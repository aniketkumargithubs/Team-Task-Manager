const express = require("express");
const { Task, ProjectMember } = require("../models");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validators");

const router = express.Router();

router.use(requireAuth);

router.patch("/:taskId", validate(schemas.updateTask), async (req, res) => {
  const task = await Task.findByPk(Number(req.params.taskId));
  if (!task) return res.status(404).json({ message: "Task not found." });

  const membership = await ProjectMember.findOne({
    where: { projectId: task.projectId, userId: req.user.id },
  });
  if (!membership && req.user.systemRole !== "Admin") {
    return res.status(403).json({ message: "Not allowed." });
  }

  if (req.body.assigneeId) {
    const assigneeMembership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.body.assigneeId },
    });
    if (!assigneeMembership) {
      return res.status(400).json({ message: "Assignee is not in this project." });
    }
  }

  await task.update(req.body);
  return res.json(task);
});

module.exports = router;
