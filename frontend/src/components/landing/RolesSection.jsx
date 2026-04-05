import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';

const roles = [
  {
    title: 'Students',
    body: 'Ask high-difficulty questions, compare methods, and build a searchable personal repository of solved problems.',
    cta: 'Create student account',
    link: '/register?role=student',
  },
  {
    title: 'Experts',
    body: 'Solve specialized technical questions, publish high-quality structured answers, and build professional credibility.',
    cta: 'Apply as expert',
    link: '/register?role=tutor',
  },
];

const RolesSection = () => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
    <SectionHeading
      eyebrow="Roles"
      title="Two-sided platform for learners and domain experts"
      description="Designed like a modern SaaS marketplace with clear workflows, role-based dashboards, and transparent interactions."
    />

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {roles.map((role) => (
        <article key={role.title} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xl font-semibold text-slate-900">{role.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{role.body}</p>
          <Link
            to={role.link}
            className="mt-4 inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            {role.cta}
          </Link>
        </article>
      ))}
    </div>
  </section>
);

export default RolesSection;
