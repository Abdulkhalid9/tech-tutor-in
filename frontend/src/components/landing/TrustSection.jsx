const trustSignals = [
  { label: 'Structured QA format', value: 'Given · Concept · Steps · Final Answer' },
  { label: 'Technical alignment', value: 'STEM + Coding focused workflows' },
  { label: 'Knowledge retention', value: 'Saved answers and revisitable thread history' },
  { label: 'Professional tone', value: 'No coaching gimmicks, pure problem-solving' },
];

const TrustSection = () => (
  <section className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100 shadow-sm lg:p-8">
    <div className="space-y-3">
      <p className="inline-flex rounded-full border border-slate-600 bg-slate-700/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
        Trust
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        Built for clarity, rigor, and reliable technical explanations
      </h2>
      <p className="max-w-3xl text-slate-300">
        Each answer is designed to be auditable and understandable, giving you confidence in both process and result.
      </p>
    </div>

    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {trustSignals.map((signal) => (
        <div key={signal.label} className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{signal.label}</p>
          <p className="mt-1 text-sm font-medium text-slate-100">{signal.value}</p>
        </div>
      ))}
    </div>
  </section>
);

export default TrustSection;
