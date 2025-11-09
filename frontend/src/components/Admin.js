import React, { useState, useEffect } from 'react';
import API from '../api';
import TreeManager from './admin/TreeManager';
import TestManager from './admin/TestManager';
import UserManager from './admin/UserManager';
import './Admin.css';

function Admin({ onBack }) {
  const [activeTab, setActiveTab] = useState('trees');

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>🔧 Panneau d'Administration</h2>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'trees' ? 'active' : ''}`}
          onClick={() => setActiveTab('trees')}
        >
          🌳 Arbres Décisionnels
        </button>
        <button 
          className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          🏥 Tests Orthopédiques
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Utilisateurs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'trees' && <TreeManager />}
        {activeTab === 'tests' && <TestManager />}
        {activeTab === 'users' && <UserManager />}
      </div>
    </div>
  );
}

export default Admin;
