/**
 * Question Detail Page
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionApi, answerApi, paymentApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './QuestionDetailPage.css';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [solution, setSolution] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setAnswerLocked(false);

      const qRes = await questionApi.getOne(id);
      setQuestion(qRes.data.data);

      try {
        const aRes = await answerApi.getByQuestion(id);
        setAnswer(aRes.data.data);
      } catch (error) {
        setAnswer(null);

        if (error.response?.status === 403) {
          setAnswerLocked(true);
        } else if (error.response?.status !== 404) {
          throw error;
        }
      }
    } catch {
      toast.error('Failed to load question');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAccept = async () => {
    try {
      await answerApi.accept(answer._id);
      toast.success('Answer accepted!');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept answer');
    }
  };

  const handleSubmitAnswer = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await answerApi.submit({ questionId: id, solution });
      setSolution('');
      toast.success('Answer submitted!');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    try {
      setPaying(true);

      const [keyRes, orderRes] = await Promise.all([
        paymentApi.getKey(),
        paymentApi.createOrder(id)
      ]);

      const key = keyRes.data.data?.key;
      const { orderId, amount, currency, paymentId } = orderRes.data.data;
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout failed to load');
      }

      if (!key || key.startsWith('your_')) {
        throw new Error('Razorpay key is missing. Configure backend environment variables first.');
      }

      const razorpay = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: orderId,
        name: 'TechTutorIn',
        description: question?.title || 'Question unlock payment',
        prefill: {
          name: user?.name,
          email: user?.email
        },
        handler: async (response) => {
          await paymentApi.verify({
            ...response,
            paymentId
          });
          toast.success('Payment successful!');
          await loadData();
        }
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!question) return <p>Question not found</p>;

  const isOwner = question.studentId?._id === user.id;
  const isAssignedTutor = question.assignedTutor?._id === user.id;
  const isAdmin = user.role === 'admin';
  const canViewAnswer = question.answerUnlocked || isAssignedTutor || isAdmin;
  const showUnlockPrompt = isOwner && !question.answerUnlocked && (answerLocked || question.status === 'answered' || question.status === 'closed');

  return (
    <div className="question-workspace" role="region" aria-label="Q-Page and A-Page workspace">
      <section className="workspace-pane" aria-labelledby="q-page-title">
        <header className="pane-header sticky-pane-header">
          <div>
            <p className="pane-label">Q-Page</p>
            <h2 id="q-page-title">Student Question</h2>
          </div>
          <div className="question-meta-right">
            <span className={`status status-${question.status}`}>{question.status}</span>
            <span className="price">₹{question.price}</span>
          </div>
        </header>

        <div className="pane-content">
          <h1>{question.title}</h1>

          <div className="meta">
            <span>By {question.studentId?.name}</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            {question.subject && <span>{question.subject}</span>}
          </div>

          <div className="description">
            <h3>Question Description</h3>
            <p>{question.description}</p>
          </div>

          {question.file && (
            <div className="file-section">
              <h3>Student Attachment</h3>
              <a href={question.file} target="_blank" rel="noopener noreferrer" className="answer-link">
                View File (Image / PDF)
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="workspace-pane" aria-labelledby="a-page-title">
        <header className="pane-header sticky-pane-header">
          <div>
            <p className="pane-label">A-Page</p>
            <h2 id="a-page-title">Tutor Answer</h2>
          </div>

          <div className="answer-toolbar" role="toolbar" aria-label="A-Page toolbar">
            <button type="button" className="toolbar-btn" title="Bold">B</button>
            <button type="button" className="toolbar-btn" title="Upload">Upload</button>
            <button type="button" className="toolbar-btn" title="Code Block">{`</>`}</button>
          </div>
        </header>

        <div className="pane-content">
          {!answer ? (
            <>
              {isAssignedTutor && question.status === 'assigned' && (
                <form onSubmit={handleSubmitAnswer} className="answer-form">
                  <textarea
                    value={solution}
                    onChange={(event) => setSolution(event.target.value)}
                    placeholder="Write the solution, add steps, code snippets, or diagram notes..."
                    rows="10"
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </form>
              )}

              {showUnlockPrompt ? (
                <div className="answer-locked-card">
                  <h3>Answer ready for unlock</h3>
                  <p>
                    Your tutor has submitted the solution. Complete payment to unlock the full answer and review it.
                  </p>
                  <button onClick={handlePayment} className="btn btn-primary" disabled={paying}>
                    {paying ? 'Opening checkout...' : `Pay ₹${question.price} to Unlock`}
                  </button>
                </div>
              ) : !isAssignedTutor ? (
                <p className="no-answer">No answer submitted yet.</p>
              ) : null}
            </>
          ) : (
            <div className="answer-content">
              {canViewAnswer ? (
                <>
                  <p>{answer.solution}</p>

                  {answer.file && (
                    <a href={answer.file} target="_blank" rel="noopener noreferrer" className="answer-link">
                      View Answer File
                    </a>
                  )}
                </>
              ) : (
                <div className="answer-locked-card">
                  <h3>Answer locked</h3>
                  <p>Pay to reveal the tutor&apos;s complete written solution and any uploaded answer files.</p>
                  <button onClick={handlePayment} className="btn btn-primary" disabled={paying}>
                    {paying ? 'Opening checkout...' : `Pay ₹${question.price} to Unlock`}
                  </button>
                </div>
              )}

              {canViewAnswer && answer.status === 'submitted' && isOwner && (
                <div className="answer-actions">
                  <button onClick={handleAccept} className="btn btn-success">
                    Accept Answer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuestionDetailPage;