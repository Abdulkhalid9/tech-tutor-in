/**
 * Materials Page
 */

import { useState, useEffect } from 'react';
import { materialApi } from '../api';
import toast from 'react-hot-toast';
import './MaterialsPage.css';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const response = await materialApi.getAll();
      setMaterials(response.data.data);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="materials-page">
      <div className="page-hero">
        <p className="section-kicker">Library</p>
        <h1>Study Materials</h1>
        <p>
          Browse curated revision sheets, notes, and downloadable resources for
          Physics, Chemistry, Biology, and Mathematics.
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : materials.length === 0 ? (
        <p className="empty-state">No study materials available yet.</p>
      ) : (
        <div className="materials-grid">
          {materials.map((material) => (
            <div key={material._id} className="material-card">
              <div className="material-icon">{(material.fileType || 'file').toUpperCase()}</div>
              <h3>{material.title}</h3>
              <p>{material.description}</p>
              <div className="material-meta">
                <span className="subject">{material.subject}</span>
                <span>{material.downloadCount} downloads</span>
              </div>
              <a href={material.file} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                View / Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
