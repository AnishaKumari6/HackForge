import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";
import Button from "../ui/Button";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/20 via-[var(--bg)] to-[var(--bg)] dark:from-indigo-950/25">
    <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <span className="bg-volt-50 border border-volt-100 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-volt-500">
          <FiZap size={13} /> 200+ hackathons hosted this year
        </span>

        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.15] tracking-tight sm:text-7xl text-[var(--ink)]">
          Build. Compete. <span className="text-volt-500">Win.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-[var(--ink-muted)] sm:text-lg">
          HackForge is where developers discover hackathons, assemble teams, ship real projects under pressure, and
          get judged by people who've built things too.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/hackathons">
            <Button size="lg" icon={<FiArrowRight size={17} className="order-2" />} className="flex-row-reverse">
              Explore Hackathons
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Host your own
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-16 max-w-4xl"
      >
        <div className="border border-[var(--border)] bg-[var(--surface)] overflow-hidden rounded-2xl shadow-sm">
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Live Hackathons", value: "24" },
                { label: "Builders", value: "12K+" },
                { label: "Prize Pool", value: "₹2.4Cr" },
                { label: "Projects Shipped", value: "3,800+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-volt-500 sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
