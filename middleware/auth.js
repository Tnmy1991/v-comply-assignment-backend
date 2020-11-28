require("dotenv").config();
const jwt      = require("jsonwebtoken");
const { User } = require("../models/users-model");

const auth = (req, res, next) => {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: true, message: "Invalid Token supplied." });
      } else {
        req.decoded = decoded;
        req.created_by = decoded.data.system_user_id;
        req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        next();
      }
    });
  } else {
    return res.status(401).json({ error: true, message: "Auth token is not supplied" });
  }
}

module.exports = { auth }