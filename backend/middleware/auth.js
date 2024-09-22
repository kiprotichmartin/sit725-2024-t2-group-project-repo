const jwt = require("jsonwebtoken");

// const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");
  if (!token) {
    return res
      .status(401)
      .json({ msg: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is invalid" });
  }
};
