import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiUsers, FiClock } from "react-icons/fi";
import { Card, Badge } from "../ui/Primitives";
import { formatCurrency, formatDateShort, getHackathonPhase, phaseLabel, phaseVariant } from "../../utils/formatters";

const HackathonCard = ({ hackathon, index = 0 }) => {
  const phase = getHackathonPhase(hackathon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={`/hackathons/${hackathon.slug}`}>
        <Card hover className="group overflow-hidden">
          <div className="relative h-40 w-full overflow-hidden bg-gradient-forge">
            {hackathon.banner?.url ? (
              <img
                src={hackathon.banner.url}
                alt={hackathon.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-2xl font-bold text-white/90">{hackathon.title?.[0]}</span>
              </div>
            )}
            <div className="absolute left-3 top-3">
              <Badge variant={phaseVariant[phase]} dot>
                {phaseLabel[phase]}
              </Badge>
            </div>
            {hackathon.mode && (
              <div className="absolute right-3 top-3">
                <Badge variant="neutral" className="capitalize backdrop-blur-md bg-black/30 text-white">
                  {hackathon.mode}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-5">
            <h3 className="line-clamp-1 font-display text-lg font-bold">{hackathon.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-muted)]">{hackathon.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <FiClock size={13} /> {formatDateShort(hackathon.startDate)}
              </span>
              {hackathon.location && (
                <span className="inline-flex items-center gap-1.5">
                  <FiMapPin size={13} /> {hackathon.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <FiUsers size={13} /> {hackathon.registeredCount || 0} registered
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3.5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">Prize Pool</p>
                <p className="font-display text-sm font-bold text-gradient-forge">
                  {hackathon.prizePool ? formatCurrency(hackathon.prizePool) : "TBD"}
                </p>
              </div>
              <span className="text-xs font-semibold text-volt-500 opacity-0 transition-opacity group-hover:opacity-100">
                View details →
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default HackathonCard;
