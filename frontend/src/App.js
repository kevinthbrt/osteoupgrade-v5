import React, { useState, useEffect } from 'react';
import API from './api';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DecisionTree from './components/DecisionTree';
import Admin from './components/Admin';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await API.me();
      setUser(userData); // Le backend retourne directement l'objet user
    } catch (error) {
      // Pas de session active
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    console.log('🔐 Tentative de login avec:', email);
    try {
      const userData = await API.login(email, password);
      console.log('✅ Réponse du serveur:', userData);
      setUser(userData); // Le backend retourne directement l'objet user
      console.log('✅ User setté:', userData);
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await API.logout();
    setUser(null);
    setSelectedTreeId(null);
  };

  const handleSelectTree = (treeId) => {
    setSelectedTreeId(treeId);
  };

  const handleBackToDashboard = () => {
    setSelectedTreeId(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🦴</span>
            <h1>OsteoUpgrade</h1>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-status">{user.status}</span>
            </div>
            {user.role === 'admin' && (
              <button className="btn-admin" onClick={() => setShowAdmin(true)}>
                🔧 Admin
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {showAdmin ? (
          <Admin onBack={() => {
            setShowAdmin(false);
            setSelectedTreeId(null);
          }} />
        ) : selectedTreeId ? (
          <DecisionTree
            treeId={selectedTreeId}
            onBack={() => setSelectedTreeId(null)}
          />
        ) : (
          <Dashboard
            user={user}
            onSelectTree={(treeId) => {
              setSelectedTreeId(treeId);
              setShowAdmin(false);
            }}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 OsteoUpgrade v3.0 - Aide au diagnostic ostéopathique</p>
      </footer>
    </div>
  );
}

export default App;
