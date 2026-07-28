const ActivityLog = require("../models/ActivityLog");

/**
 * Fire-and-forget helper to record an entry in the ActivityLogs collection.
 * Used inside controllers after sensitive actions (block user, delete hackathon, etc.)
 * Failure to log never blocks the actual request/response.
 */
const logActivity = async ({ actorId, action, targetType = "Other", targetId, description = "", req, metadata = {} }) => {
  try {
    await ActivityLog.create({
      actor: actorId,
      action,
      targetType,
      targetId,
      description,
      ipAddress: req ? req.ip : "",
      metadata,
    });
  } catch (err) {
    console.error(`[ActivityLog] Failed to log action ${action}:`, err.message);
  }
};

module.exports = logActivity;
