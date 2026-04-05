import { Link } from 'react-router-dom';

const solutionBlocks = [
  { label: 'Given', content: 'RLC series circuit, R = 12Ω, L = 40mH, C = 47µF, input frequency = 50Hz.' },
  { label: 'Concept', content: 'Impedance and phasor-domain analysis with resonance proximity check.' },
  { label: 'Steps', content: '1) Compute XL and XC  2) Derive net reactance  3) Calculate |Z| and phase angle.' },
  { label: 'Final Answer', content: '|Z| = 67.4Ω, current = 3.56A, lagging by 79.7°.' },
];

const HeroSection = () => {
  return (
    <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_1fr] lg:p-10">
      <div className="space-y-6">
        <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Technical problem solving
        </p>
        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Professional solutions for hard STEM and coding questions.
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Get structured, step-by-step answers from verified experts across Math, Physics, Electronics, MATLAB, and Python—built for clarity, not coaching hype.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/register?role=student"
            className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Ask a question
          </Link>
          <Link
            to="/register?role=tutor"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Join as expert
          </Link>
        </div>

        <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <dt className="font-medium text-slate-500">Format quality</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">Given → Concept → Steps</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <dt className="font-medium text-slate-500">Coverage</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">5 core domains</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <dt className="font-medium text-slate-500">Platform style</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">SaaS-first UX</dd>
          </div>
        </dl>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-slate-100 shadow-inner md:p-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Solution preview</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Network Theory</h3>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Completed
          </span>
        </header>

        <div className="space-y-3">
          {solutionBlocks.map((block) => (
            <div key={block.label} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{block.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">{block.content}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};

export default HeroSection;
