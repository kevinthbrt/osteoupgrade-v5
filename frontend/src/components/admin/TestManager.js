import React, { useState, useEffect } from 'react';
import API from '../../api';
import TestForm from './TestForm';
import './TestManager.css';

function TestManager() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');

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

  const handleCreate = () => {
    setEditingTest(null);
    setShowForm(true);
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setShowForm(true);
  };

  const handleSave = async (testData) => {
    try {
      if (editingTest) {
        await API.updateTest(editingTest.id, testData);
        alert('Test modifié avec succès');
      } else {
        await API.createTest(testData);
        alert('Test créé avec succès');
      }
      setShowForm(false);
      setEditingTest(null);
      loadTests();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Supprimer ce test ?')) return;

    try {
      await API.deleteTest(testId);
      loadTests();
      alert('Test supprimé');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTest(null);
  };

  if (loading) {
    return <div className="loading">Chargement des tests...</div>;
  }

  // Grouper les tests par région
  const testsByRegion = tests.reduce((acc, test) => {
    if (!acc[test.region]) {
      acc[test.region] = [];
    }
    acc[test.region].push(test);
    return acc;
  }, {});

  const regions = Object.keys(testsByRegion).sort();
  const filteredTests = selectedRegion === 'all' 
    ? tests 
    : tests.filter(t => t.region === selectedRegion);

  return (
    <div className="test-manager">
      <div className="manager-header">
        <h3>Tests Orthopédiques</h3>
        <button className="btn-create" onClick={handleCreate}>
          ➕ Créer un test
        </button>
      </div>

      <p className="info">
        {tests.length} test{tests.length > 1 ? 's' : ''} disponible{tests.length > 1 ? 's' : ''}
      </p>

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

      {/* Tests par région */}
      <div className="tests-by-region">
        {selectedRegion === 'all' ? (
          // Affichage par région
          regions.map(region => (
            <div key={region} className="region-section">
              <h4 className="region-title">📍 {region}</h4>
              <div className="tests-grid">
                {testsByRegion[region].map(test => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Affichage filtré
          <div className="tests-grid">
            {filteredTests.map(test => (
              <TestCard
                key={test.id}
                test={test}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TestForm
          initialTest={editingTest}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function TestCard({ test, onEdit, onDelete }) {
  return (
    <div className="test-card">
      <div className="test-card-header">
        <h4>{test.name}</h4>
        <div className="test-actions">
          <button className="btn-edit-small" onClick={() => onEdit(test)}>
            ✏️
          </button>
          <button className="btn-delete-small" onClick={() => onDelete(test.id)}>
            🗑️
          </button>
        </div>
      </div>
      <p className="test-description">{test.description}</p>
      
      {(test.sensitivity || test.specificity) && (
        <div className="test-stats">
          {test.sensitivity && <span>Se: {test.sensitivity}%</span>}
          {test.specificity && <span>Sp: {test.specificity}%</span>}
        </div>
      )}
      
      {test.video_url && (
        <a href={test.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
          📹 Voir la vidéo
        </a>
      )}
    </div>
  );
}

export default TestManager;
