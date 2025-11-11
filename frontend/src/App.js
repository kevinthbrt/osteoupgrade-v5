import React, { useState, useEffect } from 'react';
import API from './api';
import Login from './components/Login';
import Register from './components/Register';
import HomeDashboard from './components/HomeDashboard';
import Dashboard from './components/Dashboard';
import DecisionTree from './components/DecisionTree';
import Admin from './components/Admin';
import TestsViewer from './components/TestsViewer';
import UserSettings from './components/UserSettings';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showTreeSelector, setShowTreeSelector] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  const handleRegister = async (email, password, name) => {
  try {
    const { session } = await API.register(email, password, name);

    if (session) {
      // Cas sans confirmation d’email (ou confirm OFF) : login direct
      await handleLogin(email, password);
    } else {
      // Cas avec confirmation d’email : on n’essaie PAS de se connecter
      alert("Un e-mail de confirmation t’a été envoyé. Clique le lien puis reviens te connecter.");
      setShowRegister(false); // retour à l’écran de connexion
    }
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    throw error;
  }
};


  const handleLogout = async () => {
    await API.logout();
    setUser(null);
    setSelectedTreeId(null);
    setShowAdmin(false);
    setShowTreeSelector(false);
  };

  const handleNavigate = (destination, treeId = null) => {
    setShowAdmin(false);
    setShowTreeSelector(false);
    setSelectedTreeId(null);
    setShowTests(false);
    setShowSettings(false);

    switch (destination) {
      case 'home':
        // Revenir à l'accueil
        break;
      case 'trees':
        setShowTreeSelector(true);
        break;
      case 'tree':
        setSelectedTreeId(treeId);
        break;
      case 'admin':
        setShowAdmin(true);
        break;
      case 'tests':
        setShowTests(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'upgrade':
        // TODO: Page upgrade Premium
        alert('Page de mise à niveau Premium - À venir');
        break;
      default:
        break;
    }
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
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🦴</span>
            <h1>OsteoUpgrade</h1>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-status">{user.status}</span>
            </div>
            <button className="btn-header" onClick={() => handleNavigate('home')}>
              🏠 Accueil
            </button>
            <button className="btn-header" onClick={() => handleNavigate('trees')}>
              🌳 Arbres
            </button>
            <button className="btn-header" onClick={() => handleNavigate('tests')}>
              🏥 Tests
            </button>
            {user.status === 'admin' && (
              <button className="btn-admin" onClick={() => handleNavigate('admin')}>
                🔧 Admin
              </button>
            )}
            <button className="btn-header" onClick={() => handleNavigate('settings')}>
              ⚙️
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {showAdmin ? (
          <Admin onBack={() => handleNavigate('home')} />
        ) : showTests ? (
          <TestsViewer onBack={() => handleNavigate('home')} />
        ) : showSettings ? (
          <UserSettings 
            user={user} 
            onBack={() => handleNavigate('home')}
            onUpdate={checkAuth}
          />
        ) : selectedTreeId ? (
          <DecisionTree
            treeId={selectedTreeId}
            onBack={() => handleNavigate('home')}
          />
        ) : showTreeSelector ? (
          <Dashboard
            user={user}
            onSelectTree={(treeId) => handleNavigate('tree', treeId)}
          />
        ) : (
          <HomeDashboard
            user={user}
            onNavigate={handleNavigate}
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
