/**
 * Admin Dashboard
 */

import { useEffect, useState } from "react";
import { adminApi, materialApi } from "../api";
import toast from "react-hot-toast";
import "./Dashboard.css";

const initialMaterialForm = {
  title: "",
  description: "",
  subject: "",
  file: "",
  fileType: "pdf",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState(initialMaterialForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, questionsRes, answersRes, materialsRes] =
        await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers({ role: "tutor", approvalStatus: "pending" }),
          adminApi.getQuestions(),
          adminApi.getAnswers(),
          materialApi.getAll(),
        ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setQuestions(questionsRes.data.data);
      setAnswers(answersRes.data.data);
      setMaterials(materialsRes.data.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const handleMaterialChange = (event) => {
    const { name, value } = event.target;
    setMaterialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingMaterial(true);
      await materialApi.create(materialForm);
      toast.success("Study material added successfully");
      setMaterialForm(initialMaterialForm);
      await loadData();
    } catch {
      toast.error("Failed to add study material");
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleApprove = async (userId, status) => {
    try {
      await adminApi.approveTutor(userId, status);
      toast.success(`Tutor ${status}!`);
      await loadData();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats?.users || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.questions || 0}</h3>
          <p>Questions</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.answers || 0}</h3>
          <p>Answers</p>
        </div>
        <div className="stat-card">
          <h3>Rs. {stats?.totalEarnings || 0}</h3>
          <p>Total Earnings</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Pending Tutor Approvals</h2>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No pending approvals.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.tutorProfile?.approvalStatus || "pending"}</td>
                  <td>
                    <button
                      onClick={() => handleApprove(user._id, "approved")}
                      className="btn btn-sm btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(user._id, "rejected")}
                      className="btn btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Questions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : questions.length === 0 ? (
          <p className="empty-state">No questions found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Student</th>
                <th>Status</th>
                <th>Price</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {questions.slice(0, 10).map((question) => (
                <tr key={question._id}>
                  <td>{question.title}</td>
                  <td>{question.studentId?.name || "N/A"}</td>
                  <td>
                    <span className={`status status-${question.status}`}>
                      {question.status}
                    </span>
                  </td>
                  <td>Rs. {question.price}</td>
                  <td>{formatDate(question.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Answers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : answers.length === 0 ? (
          <p className="empty-state">No answers found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Tutor</th>
                <th>Status</th>
                <th>Earned</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {answers.slice(0, 10).map((answer) => (
                <tr key={answer._id}>
                  <td>{answer.questionId?.title || "N/A"}</td>
                  <td>{answer.tutorId?.name || "N/A"}</td>
                  <td>
                    <span className={`status status-${answer.status}`}>
                      {answer.status}
                    </span>
                  </td>
                  <td>Rs. {answer.amountEarned}</td>
                  <td>{formatDate(answer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Add Study Material</h2>
        <form className="dashboard-form" onSubmit={handleMaterialSubmit}>
          <div className="dashboard-form-grid">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                value={materialForm.title}
                onChange={handleMaterialChange}
                placeholder="E.g. NEET Biology Revision Notes"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                value={materialForm.subject}
                onChange={handleMaterialChange}
                placeholder="Physics / Chemistry / Biology / Math"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fileType">File Type</label>
              <select
                id="fileType"
                name="fileType"
                value={materialForm.fileType}
                onChange={handleMaterialChange}
                required
              >
                <option value="pdf">PDF</option>
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="file">File URL</label>
              <input
                id="file"
                name="file"
                type="url"
                value={materialForm.file}
                onChange={handleMaterialChange}
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={materialForm.description}
              onChange={handleMaterialChange}
              placeholder="Optional summary for students"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingMaterial}
          >
            {savingMaterial ? "Saving..." : "Add Material"}
          </button>
        </form>
      </div>

      <div className="dashboard-section">
        <h2>Recent Study Materials</h2>
        {loading ? (
          <p>Loading...</p>
        ) : materials.length === 0 ? (
          <p className="empty-state">No study materials added yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Downloads</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {materials.slice(0, 10).map((material) => (
                <tr key={material._id}>
                  <td>{material.title}</td>
                  <td>{material.subject}</td>
                  <td>{material.fileType}</td>
                  <td>{material.downloadCount}</td>
                  <td>{formatDate(material.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
