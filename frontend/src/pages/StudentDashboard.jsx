/**
 * Student Dashboard
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questionApi } from '../api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const StudentDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await questionApi.getMyQuestions();
      setQuestions(response.data.data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'answered': return 'status-answered';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <Link to="/ask-question" className="btn btn-primary">Ask a Question</Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{questions.length}</h3>
          <p>Total Questions</p>
        </div>
        <div className="stat-card">
          <h3>{questions.filter(q => q.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{questions.filter(q => q.status === 'answered' || q.status === 'closed').length}</h3>
          <p>Solved</p>
        </div>
      </div>

      <div className="questions-list">
        <h2>My Questions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : questions.length === 0 ? (
          <p className="empty-state">No questions yet. <Link to="/ask-question">Ask your first question!</Link></p>
        ) : (
          <div className="question-cards">
            {questions.map(question => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <span className={`status ${getStatusColor(question.status)}`}>{question.status}</span>
                  <span className="price">₹{question.price}</span>
                </div>
                <h3><Link to={`/questions/${question._id}`}>{question.title}</Link></h3>
                <p>{question.description.substring(0, 100)}...</p>
                <div className="question-footer">
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  {question.assignedTutor && (
                    <span>Tutor: {question.assignedTutor.name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
