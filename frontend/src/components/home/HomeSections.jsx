import { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronDown, FiCpu, FiGlobe, FiHeart, FiShield, FiTrendingUp, FiSmartphone } from "react-icons/fi";
import { Card } from "../ui/Primitives";
import AnimatedCounter from "../common/AnimatedCounter";

const categories = [
  { icon: FiCpu, label: "AI / ML", count: 42 },
  { icon: FiGlobe, label: "Web3 & Blockchain", count: 31 },
  { icon: FiHeart, label: "HealthTech", count: 24 },
  { icon: FiShield, label: "Cybersecurity", count: 18 },
  { icon: FiTrendingUp, label: "FinTech", count: 27 },
  { icon: FiSmartphone, label: "Mobile", count: 22 },
];

export const CategoriesSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-10 text-center">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Explore by category</h2>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">Find hackathons that match what you love building.</p>
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <Card hover className="flex flex-col items-center gap-2.5 px-3 py-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-forge text-white">
              <cat.icon size={19} />
            </div>
            <p className="text-sm font-semibold">{cat.label}</p>
            <p className="text-xs text-[var(--ink-muted)]">{cat.count} events</p>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
);

export const StatsSection = ({ stats }) => (
  <section className="relative overflow-hidden bg-[var(--bg-elevated)] py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {[
          { label: "Hackathons hosted", value: stats?.totalHackathons ?? 0, suffix: "+" },
          { label: "Builders registered", value: stats?.totalRegistrations ?? 0, suffix: "+" },
          { label: "Total prize pool distributed", value: Math.round((stats?.totalPrizePool ?? 0) / 100000), suffix: "L+" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-4xl font-bold text-gradient-forge sm:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const testimonials = [
  {
    quote: "We built our entire startup's MVP during a HackForge weekend. The judging feedback alone was worth it.",
    name: "Aditya Kumar",
    role: "Winner, HackForge Global Summit",
  },
  {
    quote: "Organizing on HackForge cut our admin work in half — team approvals and CSV exports just work.",
    name: "Priya Nair",
    role: "Organizer, CodeSprint Web3",
  },
  {
    quote: "As a judge, the scoring dashboard made evaluating 40 projects in a weekend actually manageable.",
    name: "Dr. Kavita Rao",
    role: "Judge, EcoHack Sustainability",
  },
];

export const TestimonialsSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-10 text-center">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Loved by builders and organizers</h2>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <Card className="flex h-full flex-col p-6">
            <p className="flex-1 text-sm leading-relaxed text-[var(--ink)]">"{t.quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-forge text-xs font-bold text-white">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-[var(--ink-muted)]">{t.role}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
);

export const PartnersSection = () => (
  <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)]">
        Trusted by teams from
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70 grayscale">
        {["Nexora", "Cloudspire", "Vertex Labs", "Orbital", "Lumen", "Forma"].map((name) => (
          <span key={name} className="font-display text-lg font-bold text-[var(--ink-muted)]">
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const faqs = [
  {
    q: "Do I need a team to register?",
    a: "It depends on the hackathon's minimum team size — some allow solo participants, others require at least 2 members. You can always form or join a team after registering.",
  },
  {
    q: "Is HackForge free to use?",
    a: "Yes, browsing and participating in hackathons is completely free. Individual events may have their own registration fees set by organizers.",
  },
  {
    q: "How is judging done?",
    a: "Organizers assign judges to each hackathon. Judges score submissions against published criteria like innovation, technical complexity, and presentation — the platform calculates final rankings automatically.",
  },
  {
    q: "Can I host my own hackathon?",
    a: "Absolutely. Register as an Organizer, create your event, set your timeline and prizes, and start accepting registrations right away.",
  },
];

export const FAQSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
      </div>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <Card key={faq.q} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold">{faq.q}</span>
              <FiChevronDown
                size={16}
                className={`shrink-0 text-[var(--ink-muted)] transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            <motion.div
              initial={false}
              animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-4 text-sm text-[var(--ink-muted)]">{faq.a}</p>
            </motion.div>
          </Card>
        ))}
      </div>
    </section>
  );
};
