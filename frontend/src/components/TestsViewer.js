import React, { useState, useEffect } from 'react';
import API from '../api';
import './TestsViewer.css';

function TestsViewer({ onBack }) {
  const [tests, setTests] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
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

  // Grouper par région
  const testsByRegion = tests.reduce((acc, test) => {
    if (!acc[test.region]) {
      acc[test.region] = [];
    }
    acc[test.region].push(test);
    return acc;
  }, {});

  const regions = Object.keys(testsByRegion).sort();

  // Filtrer
  const filteredTests = tests.filter(test => {
    const matchRegion = selectedRegion === 'all' || test.region === selectedRegion;
    const matchSearch = searchTerm === '' || 
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRegion && matchSearch;
  });

  if (loading) {
    return (
      <div className="tests-viewer">
        <div className="loading">Chargement des tests...</div>
      </div>
    );
  }

  return (
    <div className="tests-viewer">
      <div className="viewer-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>🏥 Tests Orthopédiques</h2>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Rechercher un test..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filtres par région */}
      <div className="region-filters">
        <button
          className={`filter-btn ${selectedRegion === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedRegion('all')}
        >
          Toutes ({tests.length})
        </button>
        {regions.map(region => (
          <button
            key={region}
            className={`filter-btn ${selectedRegion === region ? 'active' : ''}`}
            onClick={() => setSelectedRegion(region)}
          >
            {region} ({testsByRegion[region].length})
          </button>
        ))}
      </div>

      {/* Liste des tests */}
      {filteredTests.length === 0 ? (
        <div className="empty-state">
          <p>Aucun test trouvé</p>
        </div>
      ) : (
        <div className="tests-grid">
          {filteredTests.map(test => (
            <div
              key={test.id}
              className="test-card"
              onClick={() => setSelectedTest(test)}
            >
              <div className="test-card-header">
                <h3>{test.name}</h3>
                <span className="test-region-badge">{test.region}</span>
              </div>
              <p className="test-description">{test.description}</p>
              
              {(test.sensitivity || test.specificity) && (
                <div className="test-stats">
                  {test.sensitivity && (
                    <span className="stat">
                      <strong>Se:</strong> {test.sensitivity}%
                    </span>
                  )}
                  {test.specificity && (
                    <span className="stat">
                      <strong>Sp:</strong> {test.specificity}%
                    </span>
                  )}
                </div>
              )}

              {test.video_url && (
                <div className="test-video-badge">
                  📹 Vidéo disponible
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de détail */}
      {selectedTest && (
        <div className="test-modal-overlay" onClick={() => setSelectedTest(null)}>
          <div className="test-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTest(null)}>✕</button>
            
            <div className="modal-header">
              <h2>{selectedTest.name}</h2>
              <span className="test-region-badge">{selectedTest.region}</span>
            </div>

            <div className="modal-content">
              <section>
                <h3>📋 Description</h3>
                <p>{selectedTest.description}</p>
              </section>

              {(selectedTest.sensitivity || selectedTest.specificity) && (
                <section className="stats-section">
                  <h3>📊 Statistiques</h3>
                  <div className="stats-grid">
                    {selectedTest.sensitivity && (
                      <div className="stat-item">
                        <span className="stat-label">Sensibilité</span>
                        <span className="stat-value">{selectedTest.sensitivity}%</span>
                      </div>
                    )}
                    {selectedTest.specificity && (
                      <div className="stat-item">
                        <span className="stat-label">Spécificité</span>
                        <span className="stat-value">{selectedTest.specificity}%</span>
                      </div>
                    )}
                    {selectedTest.lr_plus && (
                      <div className="stat-item">
                        <span className="stat-label">LR+</span>
                        <span className="stat-value">{selectedTest.lr_plus}</span>
                      </div>
                    )}
                    {selectedTest.lr_minus && (
                      <div className="stat-item">
                        <span className="stat-label">LR-</span>
                        <span className="stat-value">{selectedTest.lr_minus}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {selectedTest.interpretation && (
                <section>
                  <h3>💡 Interprétation</h3>
                  <p>{selectedTest.interpretation}</p>
                </section>
              )}

              {selectedTest.test_references && (
                <section>
                  <h3>📚 Références</h3>
                  <p className="references">{selectedTest.test_references}</p>
                </section>
              )}

              {selectedTest.video_url && (
                <section>
                  <h3>📹 Vidéo</h3>
                  <a 
                    href={selectedTest.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    Voir la démonstration sur YouTube →
                  </a>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestsViewer;
