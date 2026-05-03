const { ProjectMember, Project } = require("../models");

async function getProjectMembership(projectId, userId) {
  return ProjectMember.findOne({ where: { projectId, userId } });
}

async function assertProjectMember(projectId, userId) {
  const membership = await getProjectMembership(projectId, userId);
  if (!membership) {
    return { ok: false, status: 403, message: "Not a project member." };
  }
  return { ok: true, membership };
}

async function assertProjectAdmin(projectId, userId, systemRole) {
  if (systemRole === "Admin") return { ok: true };
  const membership = await getProjectMembership(projectId, userId);
  if (!membership || membership.role !== "Admin") {
    return { ok: false, status: 403, message: "Project admin access required." };
  }
  return { ok: true, membership };
}

async function getProjectOr404(projectId) {
  const project = await Project.findByPk(projectId);
  if (!project) {
    return { ok: false, status: 404, message: "Project not found." };
  }
  return { ok: true, project };
}

module.exports = {
  assertProjectMember,
  assertProjectAdmin,
  getProjectOr404,
};
