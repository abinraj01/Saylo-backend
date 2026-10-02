const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants/constant");

const requireAuth = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).send({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adds { userId: 123 } to the request object
  } catch (err) {
    return res.status(401).send({ error: "Invalid token or expired session." });
  }
};

module.exports = { requireAuth };
