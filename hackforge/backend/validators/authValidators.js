const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isIn(["participant", "organizer", "judge"])
    .withMessage("Invalid role. Admin accounts cannot self-register."),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidator = [body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail()];

const resetPasswordValidator = [
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
