const { body } = require("express-validator");

const createTeamValidator = [
  body("name").trim().notEmpty().withMessage("Team name is required").isLength({ max: 60 }),
  body("hackathon").isMongoId().withMessage("Valid hackathon id is required"),
  body("description").optional().isLength({ max: 500 }),
];

const inviteMemberValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
];

module.exports = { createTeamValidator, inviteMemberValidator };
