module.exports = (action, getTargetId = () => null) => {
  return (req, res, next) => {
    res.on("finish", async () => {
      console.log(
        "logAction was called !!!!!!!!!!!!!!!/......JK CB:> CX/ C....../!!!!!!!  %&^@F@IL!!!!!",
      );

      if (req.user && res.statusCode < 400) {
        const targetId = getTargetId(req, res);

        console.log("Logging action:");
        console.log("User ID:", req.user.userId); // Use req.user
        console.log("Action:", action);
        console.log("Target ID:", targetId);
        console.log("User-Agent:", req.headers["user-agent"]);

        userId = req.user.userId;
        let ip = req.ip;

        if (ip === "::1") {
          ip = "127.0.0.1";
        }

        const userAgent = req.headers["user-agent"];
        const data = JSON.stringify({});
        const hash = "no hash";

        await req.db.query(
          "INSERT INTO audit_logs (user_id, action, target_id, ip_address, user_agent, data, hash) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [userId, action, targetId, ip, userAgent, data, hash],
        );
      }
    });

    // next();
  };
};

//  await pool
//       .query(
//         `CREATE TABLE IF NOT EXISTS audit_logs (
//     id SERIAL PRIMARY KEY,
//     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     action TEXT NOT NULL,
//     target_id INTEGER,
//     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     ip_address TEXT,
//     user_agent TEXT,
//     data JSONB,
//     hash TEXT
//   )
// `,
