import React, { useState, useEffect } from 'react';
import API from '../../api';
import './TestManager.css';

function TestManager() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await API.getTests();
      setTests(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement des tests...</div>;
  }

  return (
    <div className="test-manager">
      <h3>Tests Orthopédiques</h3>
      <p className="info">Gestion des tests orthopédiques disponibles dans les arbres décisionnels.</p>
      
      <div className="tests-grid">
        {tests.map(test => (
          <div key={test.id} className="test-card">
            <h4>{test.name}</h4>
            <p className="test-region">📍 {test.region}</p>
            <p className="test-description">{test.description}</p>
            {test.video_url && (
              <a href={test.video_url} target="_blank" rel="noopener noreferrer">
                📹 Voir la vidéo
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestManager;
