import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiFlag,
  FiBarChart2,
  FiActivity,
  FiPlusCircle,
  FiClipboard,
  FiAward,
  FiUser,
  FiBookmark,
  FiBell,
  FiFileText,
  FiCheckSquare,
  FiClock,
} from "react-icons/fi";

export const roleNavConfig = {
  admin: [
    { to: "/dashboard/admin", label: "Overview", icon: FiGrid, end: true },
    { to: "/dashboard/admin/users", label: "Manage Users", icon: FiUsers },
    { to: "/dashboard/admin/hackathons", label: "Manage Hackathons", icon: FiCalendar },
    { to: "/dashboard/admin/reports", label: "Reports", icon: FiBarChart2 },
    { to: "/dashboard/admin/activity", label: "Activity Logs", icon: FiActivity },
  ],
  organizer: [
    { to: "/dashboard/organizer", label: "Overview", icon: FiGrid, end: true },
    { to: "/dashboard/organizer/hackathons", label: "My Hackathons", icon: FiCalendar },
    { to: "/dashboard/organizer/create", label: "Create Hackathon", icon: FiPlusCircle },
  ],
  judge: [
    { to: "/dashboard/judge", label: "Overview", icon: FiGrid, end: true },
    { to: "/dashboard/judge/assigned", label: "Assigned Projects", icon: FiClipboard },
    { to: "/dashboard/judge/history", label: "Evaluation History", icon: FiClock },
  ],
  participant: [
    { to: "/dashboard/participant", label: "Overview", icon: FiGrid, end: true },
    { to: "/dashboard/participant/registrations", label: "My Registrations", icon: FiCheckSquare },
    { to: "/dashboard/participant/teams", label: "My Teams", icon: FiUserCheck },
    { to: "/dashboard/participant/submissions", label: "My Submissions", icon: FiFileText },
    { to: "/dashboard/bookmarks", label: "Bookmarks", icon: FiBookmark },
  ],
};

export const sharedNavItems = [
  { to: "/dashboard/notifications", label: "Notifications", icon: FiBell },
  { to: "/dashboard/profile", label: "Profile", icon: FiUser },
];
