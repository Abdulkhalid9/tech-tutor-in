/**
 * Tutor Dashboard
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questionApi, answerApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answerForms, setAnswerForms] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendingRes, assignedRes, answersRes] = await Promise.all([
        questionApi.getPending(),
        questionApi.getMyAssigned(),
        answerApi.getMyAnswers()
      ]);
      setPendingQuestions(pendingRes.data.data);
      setAssignedQuestions(assignedRes.data.data);
      setMyAnswers(answersRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (questionId) => {
    try {
      await questionApi.accept(questionId);
      toast.success('Question accepted!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept question');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswerForms(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitAnswer = async (questionId) => {
    const solution = answerForms[questionId];
    if (!solution || solution.trim() === '') {
      toast.error('Please write your answer before submitting');
      return;
    }
    setSubmitting(true);
    try {
      await answerApi.submit({ questionId, solution });
      toast.success('Answer submitted successfully!');
      setAnswerForms(prev => ({ ...prev, [questionId]: '' }));
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = user?.tutorProfile?.approvalStatus === 'approved';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tutor Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>₹{user?.tutorProfile?.earnings || 0}</h3>
          <p>Total Earnings</p>
        </div>
        <div className="stat-card">
          <h3>{myAnswers.length}</h3>
          <p>Answers Given</p>
        </div>
        <div className="stat-card">
          <h3>{pendingQuestions.length}</h3>
          <p>Available Questions</p>
        </div>
        <div className="stat-card">
          <h3>{assignedQuestions.length}</h3>
          <p>Assigned to Me</p>
        </div>
      </div>

      {!isApproved && (
        <div className="alert alert-warning">
          Your tutor account is pending approval from admin.
        </div>
      )}

      {/* Assigned Questions */}
      <div className="questions-list">
        <h2>My Assigned Questions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : assignedQuestions.length === 0 ? (
          <p className="empty-state">No assigned questions. Accept one below.</p>
        ) : (
          <div className="question-cards">
            {assignedQuestions.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <span className={`status status-${question.status}`}>{question.status}</span>
                  <span className="price">₹{question.price}</span>
                </div>
                <h3><Link to={`/questions/${question._id}`}>{question.title}</Link></h3>
                <p>{question.description?.substring(0, 150)}...</p>
                <div className="question-footer">
                  <span>Student: {question.studentId?.name}</span>
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                </div>

                {question.status === 'assigned' && (
                  <div style={{ marginTop: '1rem' }}>
                    <textarea
                      rows={5}
                      placeholder="Write your detailed answer here..."
                      value={answerForms[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <button
                      onClick={() => handleSubmitAnswer(question._id)}
                      className="btn btn-primary btn-sm"
                      disabled={submitting}
                      style={{ marginTop: '0.5rem' }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                  </div>
                )}

                {question.status === 'answered' && (
                  <p style={{ color: 'green', marginTop: '0.5rem' }}>
                    ✅ Answer submitted — waiting for student payment.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Questions */}
      <div className="questions-list">
        <h2>Available Questions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : pendingQuestions.length === 0 ? (
          <p className="empty-state">No pending questions available.</p>
        ) : (
          <div className="question-cards">
            {pendingQuestions.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <span className="price">₹{question.price}</span>
                  <span>{question.subject || 'General'}</span>
                </div>
                <h3><Link to={`/questions/${question._id}`}>{question.title}</Link></h3>
                <p>{question.description?.substring(0, 100)}...</p>
                <div className="question-footer">
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleAccept(question._id)}
                    className="btn btn-primary btn-sm"
                    disabled={!isApproved}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;
