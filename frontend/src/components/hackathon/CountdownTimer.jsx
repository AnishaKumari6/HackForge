import { useEffect, useState } from "react";
import { timeUntil } from "../../utils/formatters";

const CountdownTimer = ({ targetDate, label = "Starts in" }) => {
  const [time, setTime] = useState(() => timeUntil(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(timeUntil(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time) return null;

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div>
      {label && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>}
      <div className="flex gap-2">
        {units.map((u) => (
          <div key={u.label} className="glass-panel flex w-16 flex-col items-center rounded-xl py-2.5">
            <span className="font-mono text-xl font-bold text-gradient-forge">{String(u.value).padStart(2, "0")}</span>
            <span className="text-[10px] text-[var(--ink-muted)]">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
