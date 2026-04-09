/**
 * Home Page
 */

import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="section-kicker">TechTutorIn</p>
          <h1>Fast answers for serious exam preparation.</h1>
          <p className="hero-lead">
            Students post JEE and NEET doubts, expert tutors solve them, and
            every answer flows through payment, review, and study resources in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            {/* <Link to="/materials" className="btn btn-secondary">Browse Materials</Link> */}
          </div>
          {/* <div className="hero-stats">
            <div>
              <strong>24/7</strong>
              <span>Question intake</span>
            </div>
            <div>
              <strong>2 roles</strong>
              <span>Students and tutors</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Payments and gated answers</span>
            </div>
          </div> */}
        </div>

        <div className="hero-panel">
          <div className="hero-card hero-card-primary">
            <span className="hero-chip">Student workflow</span>
            <h3>Ask once. Track everything.</h3>
            <p>Post a question, monitor tutor assignment, unlock the answer, and keep your study flow moving.</p>
          </div>
          <div className="hero-card-grid">
            <div className="hero-card">
              <span className="hero-chip">Tutor</span>
              <p>Accept high-value questions and build verified earnings.</p>
            </div>
            <div className="hero-card">
              <span className="hero-chip">Student</span>
              <p>Browse materials, post doubts, and keep every solved answer organized for revision.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <p className="section-kicker">How It Works</p>
          <h2>Designed around real doubt-solving flow</h2>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <span>01</span>
            <h3>Post Your Question</h3>
            <p>Upload a problem statement, diagrams, PDFs, and the subject context that matters.</p>
          </div>
          <div className="feature-card">
            <span>02</span>
            <h3>Tutor Accepts & Solves</h3>
            <p>Approved tutors pick up pending questions and deliver written, structured solutions.</p>
          </div>
          <div className="feature-card">
            <span>03</span>
            <h3>Unlock & Review</h3>
            <p>Students unlock the answer and close the loop with acceptance after reviewing the solution.</p>
          </div>
        </div>
      </section>

      <section className="roles">
        <div className="section-heading">
          <p className="section-kicker">Choose Your Role</p>
          <h2>Built for students and tutors</h2>
        </div>
        <div className="role-grid">
          <div className="role-card">
            <h3>Student</h3>
            <p>Submit questions, unlock solutions, and build your own subject library.</p>
            <Link to="/register?role=student" className="btn btn-outline">Register as Student</Link>
          </div>
          <div className="role-card">
            <h3>Tutor</h3>
            <p>Answer doubts, earn from accepted solutions, and grow a trusted teaching profile.</p>
            <Link to="/register?role=tutor" className="btn btn-outline">Register as Tutor</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
