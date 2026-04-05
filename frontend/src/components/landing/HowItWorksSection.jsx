import SectionHeading from './SectionHeading';

const steps = [
  {
    title: 'Submit your problem',
    description: 'Share text, equations, circuit diagrams, code, and constraints in one structured form.',
  },
  {
    title: 'Expert builds solution',
    description: 'A domain-matched expert delivers a complete answer using Given, Concept, Steps, and Final Answer.',
  },
  {
    title: 'Review and learn',
    description: 'Verify the reasoning, ask follow-ups, and save the solved question to your personal knowledge archive.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <SectionHeading
        eyebrow="How it works"
        title="A technical workflow designed for real problem solving"
        description="Every answer follows an engineering-grade structure, so you can understand methods—not just copy outputs."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((step, idx) => (
          <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step {idx + 1}</span>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
