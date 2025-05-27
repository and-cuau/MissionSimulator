const express = require("express");
const app = express();
const PORT = 3000;

const bodyParser = require("body-parser");
const util = require("util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logAction = require("./logaction");

// const { myQueue, addMissionJob } = require("./queue");
const  addMissionJob  = require("./queue");
const initiateTask = require("./worker");

const initiateMission = require("./flow_parent_worker");
const initiateObjective = require("./flow_child_worker");

const addMissionToFlow = require("./flow");

// SECRET to sign tokens (keep this hidden!)
const SECRET = "my_super_secret_key";

// When user logs in:
function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
}
// Middleware to protect routes:
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1].trim();

  // console.log("this is the token at auth:" + token);

  // const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    console.log("before 403");
    if (err) return res.sendStatus(403);
    console.log("token authentication successful");
    req.user = user;
    console.log("next called");
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    console.log("user role is " + req.user.role);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./storage.db");
const cors = require("cors");

app.use(cors());

app.use(express.json()); // imprtant for reading req body ! Modern, built-in way

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.db = db; // now req.db is available in routes
  next();
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL
)`);
db.run(`CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_title TEXT NOT NULL UNIQUE,
  mission_desc TEXT NOT NULL,
  priority_level TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  CHECK (end_time > start_time)
)`);
// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS personnel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    assignment_time DATETIME NOT NULL,
    status TEXT NOT NULL,
    clearance_level TEXT NOT NULL
)`);
db.run(`CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  asset_type TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  capabilities TEXT NOT NULL
)`);
db.run(`CREATE TABLE IF NOT EXISTS objectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  depends_on TEXT NOT NULL,
  est_duration TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL
)`);
db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
)`);

module.exports = db;

// Promisify db methods
db.get = util.promisify(db.get); // uncommented promisify routes to get login/signup wokring. doesnt seem to affect/break other routes so far

const originalRun = db.run;

db.run = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    originalRun.call(this, sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

// Root route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.post("/users", async (req, res) => {
  // removed async
  // post new user  (sign up)
  console.log("POST /users was called");
  const username = req.body.username;
  const password = req.body.password;
  const hash = await bcrypt.hash(password, 10);
  console.log("hash: " + hash);
  const role = req.body.role;

  console.log("username: " + username);
  console.log("password: " + password);
  console.log("hash: " + hash);

  db.run(
    "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hash, role],
    function (err) {
      if (this.changes === 0) {
        db.get(
          "SELECT id FROM users WHERE username = ?",
          [username],
          (err, row) => {
            if (err) {
              console.error("Error retrieving existing user:", err);
              return res.status(500).send("Database error");
            }
            return res.send({ msg: "Username is already taken", id: row.id }); // not sure what i use row.id sent back for
          },
        );
      } else {
        console.log(`New user inserted with ID: ${this.lastID}`);

        return res.send({ id: this.lastID });
      }
    },
  );
});

app.post("/users/login", async (req, res) => {
  // check for user (admin)
  console.log("POST /users/login was called");
  const username = req.body.username;
  const password = req.body.password;
  console.log("Test: " + username);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Assume you fetched the user and their hashed password from DB
    const row = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!row) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, row.password); // This works fine here

    if (isMatch) {
      console.log("login successful");
      const userobj = { id: row.id, role: row.role };
      const token = generateToken(userobj);

      const safeUserInfo = {
        id: row.id,
        username: row.username,
        role: row.role,
      }; // added row.role. front end doesnt use it for the moment

      const data = { userInfo: safeUserInfo, token: token };

      return res.send(data);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/missions",
  authenticateToken,
  authorizeRoles("admin", "commander"),
  logAction("MISSION_CREATED", (req) => req.missionId),
  async (req, res) => {
    console.log("POST /missions was called");

    const {
      mission_title,
      mission_desc,
      priority_level,
      start_time,
      end_time,
    } = req.body;

    console.log("priority lvl:"+priority_level);

    try {
      const result = await db.run(
        `INSERT OR IGNORE INTO missions (mission_title, mission_desc, priority_level, start_time, end_time)
         VALUES (?, ?, ?, ?, ?)`,
        [mission_title, mission_desc, priority_level, start_time, end_time],
      );

      if (result.changes === 0) {
        // Duplicate title, fetch existing ID
        const row = await db.get(
          "SELECT id FROM missions WHERE mission_title = ?",
          [mission_title],
        );

        return res.send({ msg: "Mission title is already taken", id: row.id });
      } else {
        req.missionId = result.lastID; // now available for logAction
        console.log(`New mission inserted with ID: ${req.missionId}`);

        // addMissionJob( start_time, end_time, result.lastID); // FLAG
        // initiateTask();

        return res.send({ id: req.missionId });
      }
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
);

app.post(
  "/missions/:missionId/personnel",
  authenticateToken,
  logAction("PERSON_CREATED", (req) => req.missionId),
  async (req, res) => {
    const missionId = req.params.missionId;
    console.log("POST /missions/" + missionId + "/personnel was called");
    const missionPersonnel = req.body;

    for (let person of missionPersonnel) {
      const { name, role, assignment_time, status, clearance_level } = person;
      await db.run(
        "INSERT OR IGNORE INTO personnel (mission_id, name, role, assignment_time, status, clearance_level) VALUES (?, ?, ?, ?, ?, ?)",
        [missionId, name, role, assignment_time, status, clearance_level],
      );
    }

    return res.send("route called on start error solved?");
  },
);

app.post(
  "/missions/:missionId/assets",
  authenticateToken,
  logAction("ASSET_CREATED", (req) => req.missionId),
  async (req, res) => {
    const missionId = req.params.missionId;
    console.log("POST /missions/" + missionId + "/assets was called");
    const missionAssets = req.body;
    console.log(missionAssets);
    const status = "ready";

    for (let asset of missionAssets) {
      const { missionIdUnused, asset_type, status, location, capabilities } = asset;
      await db.run(
        "INSERT OR IGNORE INTO assets (mission_id, asset_type, status, location, capabilities) VALUES (?, ?, ?, ?, ?)",
        [missionId, asset_type, status, location, capabilities],
      );
    }

    return res.send("route called on start error solved?");
  },
);

app.post(
  "/missions/:missionId/objectives",
  authenticateToken,
  logAction("OBJECTIVE_CREATED", (req) => req.missionId),
  async (req, res) => {
    const missionId = req.params.missionId;
    console.log("POST /missions/" + missionId + "/objectives was called");
    const missionObjectives = req.body;

    addMissionToFlow(missionId, missionObjectives);
    initiateMission();
    initiateObjective();

    for (let objective of missionObjectives) {
      const {
        description,
        status,
        depends_on,
        estimated_duration,
        start_time,
        end_time,
      } = objective;
      await db.run(
        "INSERT OR IGNORE INTO objectives (mission_id, description, status, depends_on, est_duration, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          missionId,
          description,
          status,
          depends_on,
          estimated_duration,
          start_time,
          end_time,
        ],
      );
    }

    return res.send("route called on start error solved?");
  },
);

app.patch("/missions/", (req, res) => {
  console.log("PATCH /missions/ was called");

  const {
    mission_title,
    mission_desc,
    priority_level,
    start_time,
    end_time,
    id,
  } = req.body;

  db.run(
    `UPDATE missions SET mission_title =?, mission_desc=?, priority_level=?, start_time=?,
     end_time=? WHERE id = ?`,
    [mission_title, mission_desc, priority_level, start_time, end_time, id],
    function (err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Row(s) updated: ${this.changes}`);
    },
  );
});

app.get("/missions/", (req, res) => {
  // fetch all missions
  console.log("GET /missions/ was called");

  db.all("SELECT * FROM missions", (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach((row) => {
      row.id = row.id.toString();
    });
    // console.log(rows);
    return res.send(rows);
  });
});

app.get("/missions/:missionId", (req, res) => {
  // fetch a mission
  const missionId = req.params.missionId;
  console.log("GET /missions/" + missionId + "was called");

  db.all("SELECT * FROM missions", (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach((row) => {
      row.mission_id = row.mission_id.toString();
    });

    return res.send(rows);
  });
});

app.get("/missions/:missionId/personnel", (req, res) => {
  const missionId = req.params.missionId;
  console.log("GET /missions/" + missionId + "/personnel was called");

  db.all(
    "SELECT * FROM personnel WHERE mission_id = ?",
    [missionId],
    (err, rows) => {
      if (err) {
        throw err;
      }

      rows.forEach((row) => {
        row.mission_id = row.mission_id.toString();
      });

      return res.send(rows);
    },
  );
});

app.get("/missions/:missionId/assets", (req, res) => {
  const missionId = req.params.missionId;
  console.log("GET /missions/" + missionId + "/assets was called");

  db.all(
    "SELECT * FROM assets where mission_id = ?",
    [missionId],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        throw err;
      }

      rows.forEach((row) => {
        row.mission_id = row.mission_id.toString();
      });

      return res.send(rows);
    },
  );
});

app.get("/missions/:missionId/objectives", (req, res) => {
  const missionId = req.params.missionId;
  console.log("mission id obj is " + missionId);
  console.log("GET /missions/" + missionId + "/objectives was called");

  db.all(
    "SELECT * FROM objectives where mission_id = ?",
    [missionId],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        throw err;
      }
      // console.log("objectives rows: ");
      // console.log(rows);
      return res.send(rows);
    },
  );
});

app.delete("/missions/:missionId", async (req, res) => {
  const missionId = req.params.missionId;
  console.log("DELETE /missions/" + missionId + " was called");

  try {
    const result = await db.run("DELETE FROM missions WHERE id = ?", [
      missionId,
    ]);
    // `result` depends on how you promisified it.
    // Usually you want to access number of rows changed:
    // e.g. result.changes or result.stmt.changes depending on implementation

    if (result.changes === 0) {
      return res.status(404).json({ message: "Mission not found" });
    }

    await deleteJob(missionId);

    res.status(200).json({ message: "Mission and job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete mission" });
  }
});

async function deleteJob(jobId) {
  // 1 ‑ look the job up in Redis
  const job = await myQueue.getJob(jobId);
  if (!job) {
    console.log(`No job found with ID ${jobId}`);
    return;
  }
  // 2 ‑ remove it from whatever set (waiting, delayed, active, etc.) it’s in
  await job.remove();
  console.log(`Job ${jobId} deleted from queue`);
}

// app.delete("/missions/:missionId", async (req, res) => {
//   const missionId = req.params.missionId;
//   console.log("DELETE /missions/" + missionId + " was called");

//   await db.run("DELETE FROM missions WHERE id = ?", [missionId], function (err){
//     if (err) {
//       console.error(err.message);
//       return res.status(500).json({ error: "Failed to delete mission" });
//     }
//     if (this.changes === 0) {
//       return res.status(404).json({ message: "Mission not found" });
//     }

//     res.status(200).json({ message: "Mission deleted successfully" });
//   });

//   await deleteJob(missionId);
// });

// async function deleteJob(jobId) {
//   // 1 ‑ look the job up in Redis
//   const job = await myQueue.getJob(jobId);
//   if (!job) {
//     console.log(`No job found with ID ${jobId}`);
//     return;
//   }
//   // 2 ‑ remove it from whatever set (waiting, delayed, active, etc.) it’s in
//   await job.remove();
//   console.log(`Job ${jobId} deleted from queue`);
// }
