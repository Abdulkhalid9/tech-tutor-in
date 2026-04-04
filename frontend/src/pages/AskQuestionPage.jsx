/**
 * Ask Question Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionApi, uploadApi } from '../api';
import toast from 'react-hot-toast';
import './AskQuestionPage.css';

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    price: 50,
    file: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl = null;
      let fileType = null;

      // Upload file if exists
      if (formData.file) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.file);
        const uploadRes = await uploadApi.upload(uploadFormData);
        fileUrl = uploadRes.data.data.url;
        fileType = uploadRes.data.data.fileType;
        setUploading(false);
      }

      // Create question
      const questionData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        price: Number(formData.price),
        file: fileUrl,
        fileType
      };

      const response = await questionApi.create(questionData);
      toast.success('Question posted successfully!');
      navigate(`/questions/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post question');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="ask-question-page">
      <h1>Ask a Question</h1>
      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label>Question Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., How to solve quadratic equations?"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Describe your question in detail..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Mathematics"
            />
          </div>

          <div className="form-group">
            <label>Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="10"
              max="1000"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Attach File (Optional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
          />
          <small>Supported: JPEG, PNG, PDF (Max 10MB)</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || uploading}
          >
            {loading || uploading ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestionPage;
