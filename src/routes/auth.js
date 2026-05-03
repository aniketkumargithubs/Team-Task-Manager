const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { jwtSecret } = require("../config/env");
const { validate, schemas } = require("../middleware/validators");

const router = express.Router();

router.post("/signup", validate(schemas.signup), async (req, res) => {
  const { name, email, password, systemRole } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, systemRole });

  return res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    systemRole: user.systemRole,
  });
});

router.post("/login", validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      systemRole: user.systemRole,
    },
  });
});

module.exports = router;
