export const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", ...opts });

export const formatDateShort = (date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const timeUntil = (date) => {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

export const getHackathonPhase = (hackathon) => {
  const now = Date.now();
  const regStart = new Date(hackathon.registrationStart).getTime();
  const regEnd = new Date(hackathon.registrationEnd).getTime();
  const start = new Date(hackathon.startDate).getTime();
  const end = new Date(hackathon.endDate).getTime();

  if (hackathon.status === "completed" || now > end) return "completed";
  if (now >= start) return "ongoing";
  if (now >= regStart && now <= regEnd) return "registration_open";
  if (now < regStart) return "upcoming";
  return "registration_closed";
};

export const phaseLabel = {
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  upcoming: "Upcoming",
  ongoing: "Live Now",
  completed: "Completed",
};

export const phaseVariant = {
  registration_open: "success",
  registration_closed: "neutral",
  upcoming: "volt",
  ongoing: "ember",
  completed: "neutral",
};
