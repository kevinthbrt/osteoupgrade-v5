import React, { useState, useEffect } from 'react';
import API from '../api';
import './Dashboard.css';

function Dashboard({ user, onSelectTree }) {
  const [trees, setTrees] = useState([]);
  const [freemiumTreeId, setFreemiumTreeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrees();
  }, []);

  const loadTrees = async () => {
    try {
      const [treesData, settingData] = await Promise.all([
        API.getTrees(),
        API.getSetting('freemium_tree_id').catch(() => ({ value: '1' }))
      ]);
      
      setTrees(treesData);
      setFreemiumTreeId(parseInt(settingData.value));
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Sélectionnez une zone du corps</h2>
      <div className="zones-grid">
        {trees.map(tree => {
          const isLocked = user.status === 'freemium' && tree.id !== freemiumTreeId;
          
          return (
            <div
              key={tree.id}
              className={`zone-card ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && onSelectTree(tree.id)}
            >
              <div className="zone-icon">{tree.icon}</div>
              <div className="zone-name">{tree.name}</div>
              {isLocked && <div className="lock-badge">🔒 Premium</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
