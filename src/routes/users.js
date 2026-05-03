const express = require("express");
const { Op } = require("sequelize");
const { User } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/lookup", async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "Email query is required." });
  }

  const user = await User.findOne({
    where: { email: { [Op.eq]: email } },
    attributes: ["id", "name", "email", "systemRole"],
  });

  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json(user);
});

module.exports = router;
