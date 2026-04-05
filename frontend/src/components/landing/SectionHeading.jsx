import PropTypes from 'prop-types';

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="space-y-3">
    <p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {eyebrow}
    </p>
    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
    {description ? <p className="max-w-3xl text-slate-600">{description}</p> : null}
  </div>
);

SectionHeading.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

SectionHeading.defaultProps = {
  description: '',
};

export default SectionHeading;
