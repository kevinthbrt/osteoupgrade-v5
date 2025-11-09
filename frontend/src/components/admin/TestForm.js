import React, { useState } from 'react';
import './TestForm.css';

function TestForm({ onSave, onCancel, initialTest = null }) {
  const [formData, setFormData] = useState(initialTest || {
    region: '',
    name: '',
    description: '',
    sensitivity: '',
    specificity: '',
    lr_plus: '',
    lr_minus: '',
    video_url: '',
    test_references: '',
    interpretation: ''
  });

  const regions = [
    'Cervicale',
    'Lombaire',
    'Dorsale',
    'Épaule',
    'Coude',
    'Poignet/Main',
    'Hanche',
    'Genou',
    'Cheville/Pied',
    'Autre'
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.region || !formData.name || !formData.description) {
      alert('Les champs Région, Nom et Description sont obligatoires');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="test-form-overlay">
      <div className="test-form-modal">
        <div className="form-header">
          <h3>{initialTest ? 'Modifier le test' : 'Créer un nouveau test'}</h3>
          <button className="btn-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="test-form">
          <div className="form-row">
            <div className="form-group">
              <label>Région * 📍</label>
              <select
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                required
              >
                <option value="">-- Sélectionnez une région --</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nom du test *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Test de Spurling"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Décrivez comment réaliser le test..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sensibilité (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.sensitivity}
                onChange={(e) => handleChange('sensitivity', e.target.value)}
                placeholder="Ex: 85"
              />
            </div>

            <div className="form-group">
              <label>Spécificité (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.specificity}
                onChange={(e) => handleChange('specificity', e.target.value)}
                placeholder="Ex: 94"
              />
            </div>

            <div className="form-group">
              <label>LR+</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.lr_plus}
                onChange={(e) => handleChange('lr_plus', e.target.value)}
                placeholder="Ex: 14.2"
              />
            </div>

            <div className="form-group">
              <label>LR-</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.lr_minus}
                onChange={(e) => handleChange('lr_minus', e.target.value)}
                placeholder="Ex: 0.16"
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL Vidéo YouTube 📹</label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => handleChange('video_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="form-group">
            <label>Références / Sources 📚</label>
            <textarea
              value={formData.test_references}
              onChange={(e) => handleChange('test_references', e.target.value)}
              placeholder="Ex: Solomon DH et al. JAMA. 2001;286(13):1610-1620."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Interprétation</label>
            <textarea
              value={formData.interpretation}
              onChange={(e) => handleChange('interpretation', e.target.value)}
              placeholder="Interprétation du test et signification clinique..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              💾 {initialTest ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestForm;
