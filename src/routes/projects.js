const express = require("express");
const { Op } = require("sequelize");
const { Project, ProjectMember, Task, User } = require("../models");
const { requireAuth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validators");
const {
  assertProjectAdmin,
  assertProjectMember,
  getProjectOr404,
} = require("../utils/projectAccess");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const projects = await Project.findAll({
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "name", "email"],
        through: { attributes: ["role"] },
        where:
          req.user.systemRole === "Admin"
            ? undefined
            : { id: { [Op.eq]: req.user.id } },
        required: req.user.systemRole !== "Admin",
      },
      {
        model: Task,
        as: "tasks",
        attributes: ["id", "status"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.json(projects);
});

router.post("/", validate(schemas.createProject), async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description || null,
    ownerId: req.user.id,
  });

  await ProjectMember.create({
    projectId: project.id,
    userId: req.user.id,
    role: "Admin",
  });

  return res.status(201).json(project);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const projectResult = await getProjectOr404(projectId);
  if (!projectResult.ok) {
    return res.status(projectResult.status).json({ message: projectResult.message });
  }

  const memberResult = await assertProjectMember(projectId, req.user.id);
  if (!memberResult.ok && req.user.systemRole !== "Admin") {
    return res.status(memberResult.status).json({ message: memberResult.message });
  }

  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "name", "email"],
        through: { attributes: ["role"] },
      },
      {
        model: Task,
        as: "tasks",
        include: [{ model: User, as: "assignee", attributes: ["id", "name", "email"] }],
      },
    ],
  });

  return res.json(project);
});

router.post("/:projectId/members", validate(schemas.addProjectMember), async (req, res) => {
  const projectId = Number(req.params.projectId);
  const projectResult = await getProjectOr404(projectId);
  if (!projectResult.ok) {
    return res.status(projectResult.status).json({ message: projectResult.message });
  }

  const adminResult = await assertProjectAdmin(projectId, req.user.id, req.user.systemRole);
  if (!adminResult.ok) {
    return res.status(adminResult.status).json({ message: adminResult.message });
  }

  const user = await User.findByPk(req.body.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  const exists = await ProjectMember.findOne({
    where: { projectId, userId: req.body.userId },
  });
  if (exists) return res.status(409).json({ message: "User already in project." });

  const member = await ProjectMember.create({
    projectId,
    userId: req.body.userId,
    role: req.body.role,
  });

  return res.status(201).json(member);
});

router.post("/:projectId/tasks", validate(schemas.createTask), async (req, res) => {
  const projectId = Number(req.params.projectId);
  const projectResult = await getProjectOr404(projectId);
  if (!projectResult.ok) {
    return res.status(projectResult.status).json({ message: projectResult.message });
  }

  const memberResult = await assertProjectMember(projectId, req.user.id);
  if (!memberResult.ok && req.user.systemRole !== "Admin") {
    return res.status(memberResult.status).json({ message: memberResult.message });
  }

  if (req.body.assigneeId) {
    const assigneeMembership = await ProjectMember.findOne({
      where: { projectId, userId: req.body.assigneeId },
    });
    if (!assigneeMembership) {
      return res.status(400).json({ message: "Assignee is not in this project." });
    }
  }

  const task = await Task.create({
    projectId,
    title: req.body.title,
    description: req.body.description || null,
    assigneeId: req.body.assigneeId || null,
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate || null,
  });

  return res.status(201).json(task);
});

module.exports = router;
