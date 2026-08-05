const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const { teamInviteTemplate } = require("../utils/emailTemplates");

const notifyUser = async (req, { recipient, type, title, message, link, relatedHackathon }) => {
  const notification = await Notification.create({ recipient, type, title, message, link, relatedHackathon });
  const io = req.app.get("io");
  io.to(recipient.toString()).emit("notification", notification);
  return notification;
};

// @desc    Create a team for a hackathon (creator becomes leader)
// @route   POST /api/v1/teams
// @access  Private (participant)
exports.createTeam = asyncHandler(async (req, res, next) => {
  const { name, hackathon: hackathonId, description } = req.body;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }
  if (!hackathon.isRegistrationOpen()) {
    return next(new ErrorResponse("Registration is not currently open for this hackathon.", 400));
  }

  const existing = await Team.findOne({
    hackathon: hackathonId,
    "members.user": req.user._id,
  });
  if (existing) {
    return next(new ErrorResponse("You are already part of a team for this hackathon.", 400));
  }

  const team = await Team.create({
    name,
    hackathon: hackathonId,
    description,
    members: [{ user: req.user._id, role: "leader" }],
  });

  res.status(201).json({ success: true, team });
});

// @desc    Get a team by id
// @route   GET /api/v1/teams/:id
// @access  Private
exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id)
    .populate("members.user", "name email avatar college skills")
    .populate("hackathon", "title slug minTeamSize maxTeamSize");
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }
  res.status(200).json({ success: true, team });
});

// @desc    Get the logged-in user's team for a specific hackathon
// @route   GET /api/v1/teams/mine/:hackathonId
// @access  Private
exports.getMyTeamForHackathon = asyncHandler(async (req, res) => {
  const team = await Team.findOne({
    hackathon: req.params.hackathonId,
    "members.user": req.user._id,
  }).populate("members.user", "name email avatar");

  res.status(200).json({ success: true, team: team || null });
});

// @desc    Invite a member to the team by email
// @route   POST /api/v1/teams/:id/invite
// @access  Private (team leader)
exports.inviteMember = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const team = await Team.findById(req.params.id).populate("hackathon", "title maxTeamSize");
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }

  const leader = team.getLeader();
  if (!leader || leader.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Only the team leader can invite members.", 403));
  }

  if (team.isFull(team.hackathon.maxTeamSize)) {
    return next(new ErrorResponse("Team has reached the maximum size for this hackathon.", 400));
  }

  const alreadyInvited = team.invites.find((inv) => inv.email === email && inv.status === "pending");
  if (alreadyInvited) {
    return next(new ErrorResponse("This email already has a pending invite.", 400));
  }

  const token = crypto.randomBytes(20).toString("hex");
  team.invites.push({ email, invitedBy: req.user._id, token, status: "pending" });
  await team.save();

  const invitee = await User.findOne({ email });
  const link = `${process.env.CLIENT_URL}/teams/invite/${token}`;

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${team.name} on HackForge`,
    html: teamInviteTemplate(invitee ? invitee.name : "there", team.name, team.hackathon.title, link),
  }).catch((err) => console.error("[Email] Team invite failed:", err.message));

  if (invitee) {
    await notifyUser(req, {
      recipient: invitee._id,
      type: "team_invite",
      title: "New team invitation",
      message: `You've been invited to join team "${team.name}".`,
      link: `/teams/invite/${token}`,
      relatedHackathon: team.hackathon._id,
    });
  }

  res.status(200).json({ success: true, message: "Invitation sent." });
});

// @desc    Accept a team invite
// @route   PUT /api/v1/teams/invite/:token/accept
// @access  Private
exports.acceptInvite = asyncHandler(async (req, res, next) => {
  const team = await Team.findOne({ "invites.token": req.params.token }).populate("hackathon", "maxTeamSize");
  if (!team) {
    return next(new ErrorResponse("Invalid or expired invitation.", 404));
  }

  const invite = team.invites.find((inv) => inv.token === req.params.token);
  if (invite.status !== "pending") {
    return next(new ErrorResponse("This invitation has already been used.", 400));
  }
  if (invite.email !== req.user.email) {
    return next(new ErrorResponse("This invitation was sent to a different email address.", 403));
  }
  if (team.isFull(team.hackathon.maxTeamSize)) {
    invite.status = "expired";
    await team.save();
    return next(new ErrorResponse("Team is already full.", 400));
  }

  const alreadyMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!alreadyMember) {
    team.members.push({ user: req.user._id, role: "member" });
  }
  invite.status = "accepted";
  await team.save();

  res.status(200).json({ success: true, message: "Joined team successfully.", team });
});

// @desc    Decline a team invite
// @route   PUT /api/v1/teams/invite/:token/decline
// @access  Private
exports.declineInvite = asyncHandler(async (req, res, next) => {
  const team = await Team.findOne({ "invites.token": req.params.token });
  if (!team) {
    return next(new ErrorResponse("Invalid invitation.", 404));
  }
  const invite = team.invites.find((inv) => inv.token === req.params.token);
  invite.status = "declined";
  await team.save();
  res.status(200).json({ success: true, message: "Invitation declined." });
});

// @desc    Leave a team (leader must transfer leadership first, or delete the team)
// @route   PUT /api/v1/teams/:id/leave
// @access  Private (team member)
exports.leaveTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }

  const member = team.members.find((m) => m.user.toString() === req.user._id.toString());
  if (!member) {
    return next(new ErrorResponse("You are not a member of this team.", 400));
  }
  if (member.role === "leader" && team.members?.length > 1) {
    return next(new ErrorResponse("Transfer leadership before leaving the team.", 400));
  }

  team.members = team.members.filter((m) => m.user.toString() !== req.user._id.toString());

  if (team.members?.length === 0) {
    await team.deleteOne();
    return res.status(200).json({ success: true, message: "You left the team and it was disbanded." });
  }

  await team.save();
  res.status(200).json({ success: true, message: "You left the team." });
});

// @desc    Transfer team leadership to another member
// @route   PUT /api/v1/teams/:id/transfer-leadership
// @access  Private (team leader)
exports.transferLeadership = asyncHandler(async (req, res, next) => {
  const { newLeaderId } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }

  const currentLeader = team.members.find((m) => m.role === "leader");
  if (!currentLeader || currentLeader.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Only the current leader can transfer leadership.", 403));
  }

  const newLeader = team.members.find((m) => m.user.toString() === newLeaderId);
  if (!newLeader) {
    return next(new ErrorResponse("Target user is not a member of this team.", 400));
  }

  currentLeader.role = "member";
  newLeader.role = "leader";
  await team.save();

  res.status(200).json({ success: true, message: "Leadership transferred.", team });
});

// @desc    Delete own team
// @route   DELETE /api/v1/teams/:id
// @access  Private (team leader, admin)
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }
  const leader = team.getLeader();
  const isLeader = leader && leader.user.toString() === req.user._id.toString();
  if (!isLeader && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to delete this team.", 403));
  }

  await Registration.deleteMany({ team: team._id });
  await team.deleteOne();

  res.status(200).json({ success: true, message: "Team deleted." });
});

// @desc    Submit team for organizer approval
// @route   PUT /api/v1/teams/:id/submit
// @access  Private (team leader)
exports.submitTeamForApproval = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id).populate("hackathon", "minTeamSize title organizer");
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }
  const leader = team.getLeader();
  if (!leader || leader.user.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Only the team leader can submit the team.", 403));
  }
  if (team.members?.length < team.hackathon.minTeamSize) {
    return next(new ErrorResponse(`Team needs at least ${team.hackathon.minTeamSize} member(s).`, 400));
  }

  team.status = "pending_approval";
  await team.save();

  await notifyUser(req, {
    recipient: team.hackathon.organizer,
    type: "general",
    title: "New team awaiting approval",
    message: `Team "${team.name}" has requested approval for "${team.hackathon.title}".`,
    link: `/organizer/hackathons/${team.hackathon._id}/teams`,
    relatedHackathon: team.hackathon._id,
  });

  res.status(200).json({ success: true, message: "Team submitted for approval.", team });
});

// =========================================
// ORGANIZER: approve/reject teams, list them
// =========================================

// @desc    Get all teams for a hackathon (organizer)
// @route   GET /api/v1/teams/hackathon/:hackathonId
// @access  Private (organizer-owner, admin)
exports.getTeamsForHackathon = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }
  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  const filter = { hackathon: req.params.hackathonId };
  if (req.query.status) filter.status = req.query.status;

  const teams = await Team.find(filter).populate("members.user", "name email avatar college");
  res.status(200).json({ success: true, count: teams?.length, teams });
});

// @desc    Approve a team (auto-creates approved registrations for all members)
// @route   PUT /api/v1/teams/:id/approve
// @access  Private (organizer-owner, admin)
exports.approveTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id).populate("hackathon");
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }
  const isOwner = team.hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  team.status = "approved";
  await team.save();

  const registrations = await Promise.all(
    team.members.map((m) =>
      Registration.findOneAndUpdate(
        { hackathon: team.hackathon._id, participant: m.user },
        {
          hackathon: team.hackathon._id,
          participant: m.user,
          team: team._id,
          status: "approved",
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  team.hackathon.registeredCount += registrations?.length;
  await team.hackathon.save({ validateBeforeSave: false });

  await Promise.all(
    team.members.map((m) =>
      notifyUser(req, {
        recipient: m.user,
        type: "team_approved",
        title: "Team approved!",
        message: `Your team "${team.name}" has been approved for "${team.hackathon.title}".`,
        link: `/hackathons/${team.hackathon.slug}`,
        relatedHackathon: team.hackathon._id,
      })
    )
  );

  res.status(200).json({ success: true, message: "Team approved.", team });
});

// @desc    Reject a team
// @route   PUT /api/v1/teams/:id/reject
// @access  Private (organizer-owner, admin)
exports.rejectTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id).populate("hackathon");
  if (!team) {
    return next(new ErrorResponse("Team not found.", 404));
  }
  const isOwner = team.hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  team.status = "rejected";
  team.rejectionReason = req.body.reason || "Did not meet eligibility requirements";
  await team.save();

  await Promise.all(
    team.members.map((m) =>
      notifyUser(req, {
        recipient: m.user,
        type: "team_rejected",
        title: "Team not approved",
        message: `Your team "${team.name}" was not approved for "${team.hackathon.title}". Reason: ${team.rejectionReason}`,
        link: `/hackathons/${team.hackathon.slug}`,
        relatedHackathon: team.hackathon._id,
      })
    )
  );

  res.status(200).json({ success: true, message: "Team rejected.", team });
});
