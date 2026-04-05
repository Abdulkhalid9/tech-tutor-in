import { Link } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import SubjectsSection from '../components/landing/SubjectsSection';
import RolesSection from '../components/landing/RolesSection';
import TrustSection from '../components/landing/TrustSection';
import CtaSection from '../components/landing/CtaSection';

const HomePage = () => {
  return (
    <div className="bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 lg:gap-10 lg:px-8 lg:py-8">
        <HeroSection />
        <HowItWorksSection />
        <SubjectsSection />
        <RolesSection />
        <TrustSection />
        <CtaSection />
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} TechTutorIn. Structured solutions for technical learning.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="transition hover:text-slate-900">Login</Link>
            <Link to="/register" className="transition hover:text-slate-900">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
