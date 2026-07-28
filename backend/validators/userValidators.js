const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 1, max: 60 }).withMessage("Name must be 1-60 characters"),
  body("bio").optional().isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters"),
  body("college").optional().trim(),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("github").optional().trim(),
  body("linkedin").optional().trim(),
  body("portfolio").optional().trim(),
];

const blockUserValidator = [
  body("reason").optional().isString().isLength({ max: 300 }),
];

module.exports = { updateProfileValidator, blockUserValidator };
