import { Link } from 'react-router-dom';

const CtaSection = () => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Get started</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Start solving tougher questions with structured expert help.
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/register?role=student"
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Create student account
        </Link>
        <Link
          to="/register?role=tutor"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Join as expert
        </Link>
      </div>
    </div>
  </section>
);

export default CtaSection;
