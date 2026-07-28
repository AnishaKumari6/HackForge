import { FAQSection } from "../../components/home/HomeSections";
import { Card } from "../../components/ui/Primitives";
import { FiTarget, FiUsers, FiTrendingUp } from "react-icons/fi";

const values = [
  { icon: FiTarget, title: "Built for builders", desc: "Every feature exists to help teams ship, not fill out forms." },
  { icon: FiUsers, title: "Fair judging", desc: "Transparent, criteria-based scoring so the best work wins." },
  { icon: FiTrendingUp, title: "Real opportunity", desc: "Winning projects get discovered by organizers and recruiters." },
];

const AboutPage = () => (
  <div>
    <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        We're building the <span className="text-gradient-forge">home for hackathons</span>
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-[var(--ink-muted)]">
        HackForge started as a way to fix the fragmented, spreadsheet-driven mess of running a hackathon. Today it
        powers events for thousands of builders, from campus weekends to global summits.
      </p>
    </section>

    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {values.map((v) => (
          <Card key={v.title} className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-forge text-white">
              <v.icon size={20} />
            </div>
            <h3 className="font-display text-lg font-bold">{v.title}</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{v.desc}</p>
          </Card>
        ))}
      </div>
    </section>

    <FAQSection />
  </div>
);

export default AboutPage;
