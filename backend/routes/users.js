const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required")
      .notEmpty()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters")
      .isLength({ min: 6 })
      .trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user
      await user.save();

      // Return JWT
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error("Server Error:", err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/users
// @desc    Update user's social links
// @access  Private
router.put("/", authMiddleware, async (req, res) => {
  const { socialLinks } = req.body;

  // Validate social links
  const validPlatforms = ["facebook", "twitter", "instagram", "linkedin"];
  for (const platform in socialLinks) {
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ msg: `Invalid platform: ${platform}` });
    }
    if (socialLinks[platform] && !isValidURL(socialLinks[platform])) {
      return res
        .status(400)
        .json({ msg: `Invalid URL for ${platform}: ${socialLinks[platform]}` });
    }
  }

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.socialLinks = socialLinks;

    await user.save();

    res.json({ msg: "Social links updated", socialLinks: user.socialLinks });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).send("Server Error");
  }
});

const QRCode = require("qrcode");

// @route   GET api/users/qr
// @desc    Generate QR code for user's social links
// @access  Private
router.get("/qr", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const url = `http://localhost:5500/user/${user._id}`; // Update with your frontend URL

    QRCode.toDataURL(url, (err, src) => {
      if (err) {
        console.error("QR Code Generation Error:", err.message);
        return res.status(500).send("Error generating QR code");
      }
      res.json({ qrCodeSrc: src });
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// Helper function to validate URLs
function isValidURL(url) {
  const regex =
    /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
  return regex.test(url);
}

module.exports = router;
