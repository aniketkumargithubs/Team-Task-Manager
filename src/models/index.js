const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    systemRole: {
      type: DataTypes.ENUM("Admin", "Member"),
      allowNull: false,
      defaultValue: "Member",
    },
  },
  { timestamps: true }
);

const Project = sequelize.define(
  "Project",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { timestamps: true }
);

const ProjectMember = sequelize.define(
  "ProjectMember",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role: {
      type: DataTypes.ENUM("Admin", "Member"),
      allowNull: false,
      defaultValue: "Member",
    },
  },
  { timestamps: true }
);

const Task = sequelize.define(
  "Task",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("Todo", "In Progress", "Done"),
      allowNull: false,
      defaultValue: "Todo",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false,
      defaultValue: "Medium",
    },
    dueDate: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: true }
);

Project.belongsTo(User, { as: "owner", foreignKey: "ownerId" });
User.hasMany(Project, { as: "ownedProjects", foreignKey: "ownerId" });

User.belongsToMany(Project, {
  through: ProjectMember,
  as: "projects",
  foreignKey: "userId",
});
Project.belongsToMany(User, {
  through: ProjectMember,
  as: "members",
  foreignKey: "projectId",
});

Project.hasMany(Task, { as: "tasks", foreignKey: "projectId", onDelete: "CASCADE" });
Task.belongsTo(Project, { as: "project", foreignKey: "projectId" });

Task.belongsTo(User, { as: "assignee", foreignKey: "assigneeId" });
User.hasMany(Task, { as: "assignedTasks", foreignKey: "assigneeId" });

module.exports = {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
};
