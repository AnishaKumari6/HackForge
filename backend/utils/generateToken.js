const jwt = require("jsonwebtoken");

/**
 * Generates a short-lived access token used to authorize API requests.
 */
const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });

/**
 * Generates a long-lived refresh token used to mint new access tokens
 * without forcing the user to log in again.
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });

/**
 * Generates a token used for email verification / password reset links.
 * Kept on a separate secret so leaking one token type doesn't compromise others.
 */
const generateEmailToken = (userId, purpose) =>
  jwt.sign({ id: userId, purpose }, process.env.JWT_EMAIL_SECRET, {
    expiresIn: "1d",
  });

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
const verifyEmailToken = (token) => jwt.verify(token, process.env.JWT_EMAIL_SECRET);

/**
 * Sends the access token as JSON and the refresh token as an httpOnly cookie.
 * Keeping the refresh token out of JS-accessible storage mitigates XSS token theft.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE_DAYS || 30);

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/v1/auth/refresh-token",
  };

  res
    .status(statusCode)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
  sendTokenResponse,
};
