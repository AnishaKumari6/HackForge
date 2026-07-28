const { body } = require("express-validator");

const scoreFields = ["innovation", "technicalComplexity", "ui", "ux", "scalability", "documentation", "presentation"];

const reviewValidator = scoreFields
  .map((field) =>
    body(`scores.${field}`)
      .isFloat({ min: 0, max: 10 })
      .withMessage(`${field} score must be between 0 and 10`)
  )
  .concat([body("comments").optional().isLength({ max: 1000 }).withMessage("Comments cannot exceed 1000 characters")]);

module.exports = { reviewValidator };
