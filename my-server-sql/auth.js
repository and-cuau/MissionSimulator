// routes/auth.js
const express = require("express");
const router = express.Router();
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
// const users = require('../models/users');
const jwt = require("jsonwebtoken");

// SECRET to sign tokens
const SECRET = "my_super_secret_key";

function generateToken(user) {
  //  JWWWTTTTTT
  return jwt.sign({ userId: user.id, role: user.role }, SECRET, {
    expiresIn: "10h",
  });
}

// Generate TOTP secret and QR code
router.get("/2fa/setup", async (req, res) => {
  const username = req.query.user; // e.g., ?user=alice
  console.log("GET /2fa/setup was called");

  console.log(username);

  const secret = speakeasy.generateSecret({
    name: `MyApp (${username})`,
  });

  console.log("secret: ");
  console.log(secret.base32);

  const pool = req.db;

  try {
    await pool.query(`UPDATE users SET twofa_secret = $1 WHERE username = $2`, [
      secret.base32,
      username,
    ]);
    // res.json({ message: "2FA enabled" });
  } catch (err) {
    console.error("DB update error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }

  // Generate QR code
  const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    qr: qrDataURL,
    manualKey: secret.base32,
  });
});

router.post("/2fa/verify/login", async (req, res) => {
  console.log("GET /2fa/verify/login was called");
  const { user, token } = req.body;
  const pool = req.db;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [
      user,
    ]);
    const row = result.rows[0];

    const secret = row.twofa_secret;

    console.log("secret: ");
    console.log(secret);

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
      window: 1, // allow +/- 30 sec
    });
    console.log("verified:");
    console.log(verified);

    if (verified) {
      // users[user].twoFA.enabled = true;

      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [user],
      );
      const row = result.rows[0];

      const userobj = { id: row.id, role: row.role };
      const token = generateToken(userobj);
      console.log("token: ");
      console.log(token);
      const safeUserInfo = {
        id: row.id,
        username: row.username,
        role: row.role,
      }; // added row.role. front end doesnt use it for the moment

      const data = { userInfo: safeUserInfo, token: token };

      return res.send(data);
    }

    // res.json({ message: "2FA enabled" });
  } catch (err) {
    console.error("DB update error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }

  //   res.status(401).json({ success: false, message: "Invalid token" });
});

router.post("/2fa/verify/setup", async (req, res) => {
  console.log("GET /2fa/verify/setup was called");
  const { user, token } = req.body;
  const pool = req.db;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [
      user,
    ]);
    const row = result.rows[0];

    const secret = row.twofa_secret;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
      window: 1, // allow +/- 30 sec
    });

    if (verified) {
      await pool.query(
        "UPDATE users SET twofa_enabled = TRUE WHERE username = $1",
        [user],
      );

      return res.send({ success: true });
    }
    // res.json({ message: "2FA enabled" });
  } catch (err) {
    console.error("DB update error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

// router.post("/2fa/verify", async (req, res) => {
// //check if 2FA is enabled for this user

// // fronte end respond 2FA required

// });
