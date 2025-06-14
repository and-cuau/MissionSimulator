module.exports = (action, getTargetId = () => null) => {
  return (req, res, next) => {
    res.on("finish", () => {
      console.log("logAction was called");

      if (req.user && res.statusCode < 400) {
        const targetId = getTargetId(req, res);

        // console.log("Logging action:");
        // console.log("User ID:", req.user.userId); // Use req.user
        // console.log("Action:", action);
        // console.log("Target ID:", targetId);
        // console.log("User-Agent:", req.headers["user-agent"]);

        db.query(
          "INSERT INTO audit_logs (user_id, action, target_id, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)",
          [userId, action, targetId, ip, userAgent],
        );
      }
    });

    next();
  };
};
