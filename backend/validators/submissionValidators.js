const { body } = require("express-validator");

const submissionValidator = [
  body("projectName").trim().notEmpty().withMessage("Project name is required").isLength({ max: 100 }),
  body("problemStatement").trim().notEmpty().withMessage("Problem statement is required"),
  body("solution").trim().notEmpty().withMessage("Solution is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("githubLink")
    .trim()
    .matches(/^https?:\/\/(www\.)?github\.com\/.+/)
    .withMessage("Must be a valid GitHub URL"),
  body("demoLink").optional({ checkFalsy: true }).isURL().withMessage("Must be a valid URL"),
  body("techStack").optional().isArray().withMessage("techStack must be an array"),
];

module.exports = { submissionValidator };
