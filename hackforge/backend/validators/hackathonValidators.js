const { body } = require("express-validator");

const createHackathonValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("mode").optional().isIn(["online", "offline", "hybrid"]).withMessage("Invalid mode"),
  body("registrationStart").isISO8601().withMessage("registrationStart must be a valid date"),
  body("registrationEnd").isISO8601().withMessage("registrationEnd must be a valid date"),
  body("startDate").isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").isISO8601().withMessage("endDate must be a valid date"),
  body("minTeamSize").optional().isInt({ min: 1 }).withMessage("minTeamSize must be at least 1"),
  body("maxTeamSize").optional().isInt({ min: 1 }).withMessage("maxTeamSize must be at least 1"),
  body("prizePool").optional().isFloat({ min: 0 }).withMessage("prizePool cannot be negative"),
];

const updateHackathonValidator = [
  body("title").optional().trim().isLength({ max: 120 }),
  body("mode").optional().isIn(["online", "offline", "hybrid"]),
  body("registrationStart").optional().isISO8601(),
  body("registrationEnd").optional().isISO8601(),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
];

module.exports = { createHackathonValidator, updateHackathonValidator };
