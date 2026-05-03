const Joi = require("joi");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation failed.",
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    return next();
  };
}

const schemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    systemRole: Joi.string().valid("Admin", "Member").default("Member"),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  createProject: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow("", null),
  }),
  addProjectMember: Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid("Admin", "Member").default("Member"),
  }),
  createTask: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow("", null),
    assigneeId: Joi.number().integer().allow(null),
    status: Joi.string().valid("Todo", "In Progress", "Done").default("Todo"),
    priority: Joi.string().valid("Low", "Medium", "High").default("Medium"),
    dueDate: Joi.date().iso().allow(null),
  }),
  updateTask: Joi.object({
    title: Joi.string().min(2).max(200),
    description: Joi.string().allow("", null),
    assigneeId: Joi.number().integer().allow(null),
    status: Joi.string().valid("Todo", "In Progress", "Done"),
    priority: Joi.string().valid("Low", "Medium", "High"),
    dueDate: Joi.date().iso().allow(null),
  }).min(1),
};

module.exports = {
  validate,
  schemas,
};
