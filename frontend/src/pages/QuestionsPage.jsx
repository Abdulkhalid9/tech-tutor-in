/**
 * Questions Page
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { questionApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

const QuestionsPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    try {
      const response = user.role === 'tutor'
        ? await questionApi.getPending()
        : await questionApi.getMyQuestions();
      setQuestions(response.data.data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  return (
    <div className="dashboard questions-page">
      <div className="dashboard-header">
        <div>
          <p className="section-kicker">Question Flow</p>
          <h1>{user.role === 'tutor' ? 'Available Questions' : 'My Questions'}</h1>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : questions.length === 0 ? (
        <p className="empty-state">No questions available.</p>
      ) : (
        <div className="question-cards">
          {questions.map((q) => (
            <div key={q._id} className="question-card">
              <div className="question-header">
                <span className="price">₹{q.price}</span>
                <span className={`status status-${q.status}`}>{q.status}</span>
              </div>
              <h3><Link to={`/questions/${q._id}`}>{q.title}</Link></h3>
              <p>{q.description.substring(0, 100)}...</p>
              <div className="question-footer">
                <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                {q.subject && <span>{q.subject}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
