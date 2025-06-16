const express = require("express");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const authRoutes = require("./auth");

const fs = require("fs");

const options = {
  key: fs.readFileSync("../certs/key.pem"),
  cert: fs.readFileSync("../certs/cert.pem"),
};

const httpServer = http.createServer(options, app); // added to share server with websocket connections
const PORT = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const util = require("util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); //  JWWWTTTTTT
const logAction = require("./logaction");
const crypto = require("crypto");

const initiateMission = require("./flow_parent_worker");
const initiateObjective = require("./flow_child_worker");
const addMissionToFlow = require("./flow");

const session = require("express-session");

function authenticateToken(req, res, next) {
  if (req.session?.userId) {
    req.user = { id: req.session.userId };
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1].trim();

  if (!token) return res.sendStatus(401);

  const SECRET = "my_super_secret_key";

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.log("token authentication failed");
      return res.sendStatus(403);
    }
    console.log("token authentication successful");
    req.user = user;
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

const { Pool } = require("pg");

const localDbUrl = "postgres://postgres:123456@localhost:5432/storage";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || localDbUrl,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function setupTables() {
  try {
    await pool
      .query(
        `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    twofa_secret TEXT
  )
`,
      )
      .catch(console.error);

    await pool
      .query(
        `CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    mission_title TEXT NOT NULL UNIQUE,
    mission_desc TEXT NOT NULL,
    priority_level TEXT NOT NULL,
    status TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    CHECK (end_time > start_time)
  )
`,
      )
      .catch(console.error);

    await pool
      .query(
        `CREATE TABLE IF NOT EXISTS personnel (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    assignment_time TIMESTAMP NOT NULL,
    status TEXT NOT NULL,
    clearance_level TEXT NOT NULL
  )
`,
      )
      .catch(console.error);

    await pool
      .query(
        `CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    capabilities TEXT NOT NULL
  )
`,
      )
      .catch(console.error);

    await pool
      .query(
        `CREATE TABLE IF NOT EXISTS objectives (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    depends_on TEXT NOT NULL,
    est_duration TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
  )
`,
      )
      .catch(console.error);

    await pool
      .query(
        `CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    data JSONB,
    hash TEXT
  )
`,
      )
      .catch(console.error);
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}
module.exports = pool; // ?? was = db

// const db = new sqlite3.Database("./storage.db");
const cors = require("cors");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Replace with actual frontend URL if needed
    credentials: true,
  }),
);

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

app.use(express.json()); // imprtant for reading req body
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.db = pool; // now req.db is available in routes
  next();
});

app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Test root");
});

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const { QueueEvents, tryCatch } = require("bullmq");
const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 0, // This enables IPv6 (and IPv4 fallback) to work with Railway
});

const queueEvents = new QueueEvents("objectives", { connection });

queueEvents.on("progress", ({ jobId, data }) => {
  // Emit progress to frontend
  console.log("objective progress event");
  io.emit(`job-progress-${jobId}`, data); // or socket.to(userRoom).emit(...)
});

queueEvents.on("completed", async ({ jobId }) => {
  // Parent job finished; now create child job
  // const childJob = await queue.add('child-task', { parent: jobId });

  // Notify any clients that care about this
  io.emit(`job-complete-${jobId}`, { JobId: jobId });
});

io.on("connection", (socket) => {
  console.log("WebSocket client connected");
  socket.on("subscribeToJob", (jobId) => {
    socket.join(`job-${jobId}`);
  });
});

(async () => {
  await setupTables();

  // Start your server AFTER tables are ready
  httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
})();

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

  const result = await pool.query(
    `INSERT INTO users (username, password, role)
   VALUES ($1, $2, $3)
   ON CONFLICT (username) DO NOTHING
   RETURNING *`,
    [username, hash, role],
  );

  if (result.rows.length === 0) {
    console.log("User already exists — insert ignored");
    return res.status(404).json({ error: "User already exists" });
  } else {
    console.log(`New user inserted with ID: ${result.rows[0].id}`);
    return res.json({ error: "User already exists" });
  }
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
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, row.password);

    if (isMatch) {
      console.log("login successful");

      req.session.userId = username;

      return res.send({ success: true }); // res.send({loginsuccess: true})
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
  authorizeRoles("admin", "operator"),
  async (req, res, next) => {
    console.log("POST /missions was called");
    console.log(req.body);

    const {
      mission_title,
      mission_desc,
      priority_level,
      start_time,
      end_time,
    } = req.body;

    const mission_status = "draft";

    try {
      const { rows: exists } = await pool.query(
        "SELECT id FROM missions WHERE mission_title = $1",
        [mission_title],
      );

      if (exists.length) {
        return res.status(409).json({ error: "Mission title already taken" });
      }

      const { rows } = await pool.query(
        `INSERT INTO missions
         (mission_title, mission_desc, priority_level, status, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          mission_title,
          mission_desc,
          priority_level,
          mission_status,
          start_time,
          end_time,
        ],
      );

      req.missionId = rows[0].id;
      // console.log(`New mission inserted with ID: ${req.missionId}`);

      // addMissionJob(start_time, end_time, req.missionId); // FLAG
      // initiateTask();

      return res.send({ id: req.missionId });
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
);

app.post(
  "/missions/:missionId/personnel",
  authenticateToken,
  async (req, res, next) => {
    const missionId = req.params.missionId;
    console.log(`POST /missions/${missionId}/personnel was called`);

    const missionPersonnel = req.body;
    // console.log(missionId);
    // console.log(missionPersonnel);

    try {
      for (const person of missionPersonnel) {
        const {
          name,
          role,
          assignment_time = "2025-01-01 12:00:00",
          status = "ready",
          clearance_level,
        } = person;

        await pool.query(
          `INSERT INTO personnel
           (mission_id, name, role, assignment_time, status, clearance_level)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            missionId,
            name,
            role,
            "2025-01-01 12:00:00",
            "ready",
            clearance_level,
          ],
        );
      }

      req.missionId = missionId;
      res.status(201).json({ success: true, message: "Personnel created" });
      // next();
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
);

app.post(
  "/missions/:missionId/assets",
  authenticateToken,
  async (req, res, next) => {
    const missionId = req.params.missionId;
    console.log(`POST /missions/${missionId}/assets was called`);

    const missionAssets = req.body;
    // console.log(missionAssets);

    try {
      for (const asset of missionAssets) {
        const { asset_type, status = "ready", location, capabilities } = asset;

        await pool.query(
          `INSERT INTO assets
           (mission_id, asset_type, status, location, capabilities)
           VALUES ($1, $2, $3, $4, $5)`,
          [missionId, asset_type, status, location, capabilities],
        );
      }

      req.missionId = missionId;
      res.status(201).json({ success: true, message: "Assets created" });
      // next();
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
);

app.post(
  "/missions/:missionId/objectives",
  authenticateToken,
  async (req, res, next) => {
    const missionId = req.params.missionId;
    console.log(`POST /missions/${missionId}/objectives was called`);

    const missionObjectives = req.body;

    // console.log("misobjectives: ");
    // console.log(missionObjectives);

    try {
      for (const objective of missionObjectives) {
        const {
          description,
          status = "ready",
          depends_on,
          est_duration,
          start_time = "2025-01-01 12:00:00",
          end_time = "2025-01-01 12:00:00",
        } = objective;

        await pool.query(
          `INSERT INTO objectives
           (mission_id, description, status, depends_on, est_duration, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            missionId,
            description,
            "ready",
            depends_on,
            est_duration,
            "2025-01-01 12:00:00",
            "2025-01-01 12:00:00",
          ],
        );
      }

      req.missionId = missionId;
      res.status(201).json({ success: true, message: "Objectives created" });
      // next();
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
);

app.post(
  "/missions/:missionId/schedule",
  authenticateToken,
  authorizeRoles("admin", "operator"),
  async (req, res, next) => {
    const missionId = req.params.missionId;
    console.log(`POST /missions/${missionId}/schedule was called`);

    try {
      const { rowCount } = await pool.query(
        `UPDATE missions
         SET status = 'scheduled'
         WHERE id = $1`,
        [missionId],
      );
      console.log(`Row(s) updated: ${rowCount}`);

      const { rows: objectives } = await pool.query(
        `SELECT * FROM objectives WHERE mission_id = $1`,
        [missionId],
      );
      console.log("Objectives:", objectives);

      // console.log(objectives)

      addMissionToFlow(missionId, objectives);
      initiateMission();
      initiateObjective();


       req.missionId = missionId;

       res.json({
          success: true,
          message: `Mission ${missionId} scheduled successfully.`,
          updated: rowCount,
       });

       next(); // necessary for passing control to next in MW stack
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
  logAction("SCHEDULED MISSION", (req) => req.missionId),
);

app.post("/auditlogs", async (req, res, next) => {
  // const missionId = req.params.missionId;
  console.log(`POST /auditlogs was called`);

  const rawBody = req.body;

  const user_id = rawBody.user_id;
  const missionId = rawBody.mission_id;

  const jsonstring = JSON.stringify(rawBody.data);


  let ip = req.ip;

if (ip === "::1") {
  ip = "127.0.0.1";
}


  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(rawBody))
    .digest("hex");

  try {
    const user_agent = req.headers["user-agent"];

    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, target_id, ip_address, user_agent, data, hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
      [
        user_id,
        "CREATED MISSION WITH ASSIGNED RESOURCES",
        missionId,
        ip,
        user_agent,
        jsonstring,
        hash,
      ],
    );

    res.send({ success: true });

    // req.missionId = missionId;
    // next(); // run logAction
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).send("Internal server error");
  }
});

app.get(
  "/auditlogs",
  express.raw({ type: "application/json" }),
  authenticateToken,
  async (req, res, next) => {
    const missionId = req.params.missionId;
    console.log(`GET /auditlogs was called`);

    try {
      const result = await pool.query(`SELECT * FROM audit_logs`);

      return res.send(result.rows);

      req.missionId = missionId;
      next(); // run logAction
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }
  },
);

app.get("/missions", authenticateToken, async (req, res) => {
  const status = req.query.status;
  console.log(`GET /missions?status=${status} was called`);

  try {
    const { rows } = await pool.query(
      "SELECT * FROM missions WHERE status = $1",
      [status],
    );

    rows.forEach((row) => {
      row.id = row.id.toString();
    });

    // console.log("row contents: ");
    // console.log(rows);

    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/missions/:missionId", authenticateToken, async (req, res) => {
  const missionId = req.params.missionId;
  console.log(`GET /missions/${missionId} was called`);

  try {
    const { rows } = await pool.query("SELECT * FROM missions WHERE id = $1", [
      missionId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Mission not found" });
    }

    const mission = rows[0];
    mission.id = mission.id.toString(); // optional

    return res.json(mission);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get(
  "/missions/:missionId/personnel",
  authenticateToken,
  async (req, res) => {
    const missionId = req.params.missionId;
    console.log(`GET /missions/${missionId}/personnel was called`);

    try {
      const { rows } = await pool.query(
        "SELECT * FROM personnel WHERE mission_id = $1",
        [missionId],
      );

      //
      rows.forEach((row) => {
        row.mission_id = row.mission_id.toString();
      });

      // console.log("test personnel:");
      // console.log(rows);

      res.json(rows);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database query failed" });
    }
  },
);

app.get("/missions/:missionId/assets", authenticateToken, async (req, res) => {
  const missionId = req.params.missionId;
  console.log(`GET /missions/${missionId}/assets was called`);

  try {
    const { rows } = await pool.query(
      "SELECT * FROM assets WHERE mission_id = $1",
      [missionId],
    );

    // Optional: convert mission_id to string if needed
    rows.forEach((row) => {
      row.mission_id = row.mission_id.toString();
    });

    res.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get(
  "/missions/:missionId/objectives",
  authenticateToken,
  async (req, res) => {
    const missionId = req.params.missionId;
    console.log(`mission id obj is ${missionId}`);
    console.log(`GET /missions/${missionId}/objectives was called`);

    try {
      const { rows } = await pool.query(
        "SELECT * FROM objectives WHERE mission_id = $1",
        [missionId],
      );

      rows.forEach((row) => {
        row.mission_id = row.mission_id.toString();
      });

      console.log(rows);

      res.json(rows);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database query failed" });
    }
  },
);

// async function deleteJob(jobId) {
//   const job = await myQueue.getJob(jobId);
//   if (!job) {
//     console.log(`No job found with ID ${jobId}`);
//     return;
//   }

//   await job.remove();
//   console.log(`Job ${jobId} deleted from queue`);
// }

app.delete(
  "/missions/:missionId",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const missionId = req.params.missionId;
    console.log("DELETE /missions/" + missionId + " was called");

    try {
      // 🔑 parameterized query prevents SQL-injection
      const result = await pool.query("DELETE FROM missions WHERE id = $1", [
        missionId,
      ]);

      if (result.rowCount === 0) {
        // nothing deleted ⇒ mission did not exist
        return res.status(404).json({ message: "Mission not found" });
      }

      return res.status(200).json({ message: "Mission deleted successfully" });
    } catch (err) {
      console.error("Failed to delete mission:", err);
      return res.status(500).json({ error: "Failed to delete mission" });
    }

    // await deleteJob(missionId);
  },
);

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
