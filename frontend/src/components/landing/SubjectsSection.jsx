import SectionHeading from './SectionHeading';

const subjects = [
  'Math',
  'Physics',
  'Electronic Devices and Circuits',
  'Analog Circuits',
  'Signals and Systems',
  'Network Theory',
  'Electromagnetic Fields and Transmission Lines',
  'Control Systems',
  'Digital Electronics',
  'Communication Systems',
  'MATLAB',
  'Python',
];

const SubjectsSection = () => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
    <SectionHeading
      eyebrow="Subjects"
      title="Coverage across foundational and advanced technical domains"
      description="From first-principles mathematics to communication systems and coding tasks, request support in the exact topic you need."
    />

    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <div key={subject} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          {subject}
        </div>
      ))}
    </div>
  </section>
);

export default SubjectsSection;
