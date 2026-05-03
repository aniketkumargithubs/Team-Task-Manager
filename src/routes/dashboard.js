const express = require("express");
const { Op } = require("sequelize");
const { Task, ProjectMember, Project, User } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const now = new Date();

  let projectIds = [];
  if (req.user.systemRole !== "Admin") {
    const memberships = await ProjectMember.findAll({ where: { userId: req.user.id } });
    projectIds = memberships.map((m) => m.projectId);
  }

  const filter =
    req.user.systemRole === "Admin" ? {} : { projectId: { [Op.in]: projectIds.length ? projectIds : [0] } };

  const tasks = await Task.findAll({
    where: filter,
    include: [
      { model: Project, as: "project", attributes: ["id", "name"] },
      { model: User, as: "assignee", attributes: ["id", "name", "email"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  const statusSummary = {
    Todo: tasks.filter((t) => t.status === "Todo").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Done: tasks.filter((t) => t.status === "Done").length,
  };
  const prioritySummary = {
    High: tasks.filter((t) => t.priority === "High").length,
    Medium: tasks.filter((t) => t.priority === "Medium").length,
    Low: tasks.filter((t) => t.priority === "Low").length,
  };

  const overdueTasks = tasks.filter((t) => t.dueDate && t.status !== "Done" && new Date(t.dueDate) < now);

  return res.json({
    totalTasks: tasks.length,
    statusSummary,
    prioritySummary,
    overdueCount: overdueTasks.length,
    overdueTasks,
    tasks,
  });
});

module.exports = router;
