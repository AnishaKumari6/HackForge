/**
 * Centralized email templates so controllers stay focused on logic,
 * not markup. Kept simple/inline-styled for maximum email client compatibility.
 */

const baseWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#17171f;border-radius:16px;overflow:hidden;border:1px solid #27272f;">
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <div style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#7c3aed,#ec4899);-webkit-background-clip:text;background-clip:text;color:#a855f7;">HackForge</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px 32px;color:#e5e5ea;font-size:14px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#101016;color:#6b6b76;font-size:12px;">
              &copy; ${new Date().getFullYear()} HackForge. Build. Compete. Win.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const verifyEmailTemplate = (name, link) =>
  baseWrapper(
    "Verify your email",
    `<h2 style="color:#fff;">Hi ${name},</h2>
     <p>Welcome to HackForge. Confirm your email address to activate your account.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${link}" style="background:linear-gradient(90deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;display:inline-block;">Verify Email</a>
     </p>
     <p style="color:#9a9aa5;">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>`
  );

const resetPasswordTemplate = (name, link) =>
  baseWrapper(
    "Reset your password",
    `<h2 style="color:#fff;">Hi ${name},</h2>
     <p>We received a request to reset your password. Click below to choose a new one.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${link}" style="background:linear-gradient(90deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;display:inline-block;">Reset Password</a>
     </p>
     <p style="color:#9a9aa5;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>`
  );

const teamInviteTemplate = (inviteeName, teamName, hackathonTitle, link) =>
  baseWrapper(
    "Team invitation",
    `<h2 style="color:#fff;">Hi ${inviteeName},</h2>
     <p>You've been invited to join team <strong>${teamName}</strong> for <strong>${hackathonTitle}</strong> on HackForge.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${link}" style="background:linear-gradient(90deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;display:inline-block;">View Invitation</a>
     </p>`
  );

const resultsAnnouncedTemplate = (name, hackathonTitle, link) =>
  baseWrapper(
    "Results announced",
    `<h2 style="color:#fff;">Hi ${name},</h2>
     <p>Results for <strong>${hackathonTitle}</strong> have just been published.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${link}" style="background:linear-gradient(90deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;display:inline-block;">View Leaderboard</a>
     </p>`
  );

module.exports = {
  verifyEmailTemplate,
  resetPasswordTemplate,
  teamInviteTemplate,
  resultsAnnouncedTemplate,
};
