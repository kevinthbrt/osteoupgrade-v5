import React, { useState } from 'react';
import API from '../api';
import './UserSettings.css';

function UserSettings({ user, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
    setMessage('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await API.updateUser(user.id, {
        name: formData.name,
        email: formData.email
      });
      setMessage('Profil mis à jour avec succès');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (!formData.currentPassword) {
      setError('Mot de passe actuel requis');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await API.updatePassword(user.id, formData.currentPassword, formData.newPassword);
      setMessage('Mot de passe modifié avec succès');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Mot de passe actuel incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-settings">
      <div className="settings-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>⚙️ Paramètres</h2>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profil
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔒 Mot de passe
        </button>
        <button
          className={`tab ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          ⭐ Abonnement
        </button>
      </div>

      <div className="settings-content">
        {/* Profil */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3>Informations personnelles</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Statut du compte</label>
                <div className="status-display">
                  <span className={`status-badge status-${user.status}`}>
                    {user.status === 'admin' && '👑 Admin'}
                    {user.status === 'premium' && '⭐ Premium'}
                    {user.status === 'freemium' && '🆓 Freemium'}
                  </span>
                </div>
              </div>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : '💾 Enregistrer'}
              </button>
            </form>
          </div>
        )}

        {/* Mot de passe */}
        {activeTab === 'password' && (
          <div className="settings-section">
            <h3>Changer le mot de passe</h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  disabled={loading}
                />
                <small>Minimum 6 caractères</small>
              </div>

              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Modification...' : '🔒 Changer le mot de passe'}
              </button>
            </form>
          </div>
        )}

        {/* Abonnement */}
        {activeTab === 'subscription' && (
          <div className="settings-section">
            <h3>Gestion de l'abonnement</h3>
            
            <div className="subscription-info">
              <div className="current-plan">
                <h4>Plan actuel</h4>
                <div className={`plan-badge plan-${user.status}`}>
                  {user.status === 'admin' && '👑 Admin'}
                  {user.status === 'premium' && '⭐ Premium'}
                  {user.status === 'freemium' && '🆓 Freemium'}
                </div>
              </div>

              {user.status === 'freemium' && (
                <div className="upgrade-section">
                  <h4>⭐ Passer à Premium</h4>
                  <p>Accédez à tous les arbres décisionnels sans limitation</p>
                  <ul className="features-list">
                    <li>✅ Accès illimité à tous les arbres</li>
                    <li>✅ Tous les tests orthopédiques</li>
                    <li>✅ Export PDF illimité</li>
                    <li>✅ Mises à jour prioritaires</li>
                  </ul>
                  <button className="btn-upgrade" onClick={() => alert('Fonctionnalité de paiement à venir')}>
                    Passer à Premium
                  </button>
                </div>
              )}

              {user.status === 'premium' && (
                <div className="premium-section">
                  <h4>✅ Vous êtes Premium</h4>
                  <p>Merci pour votre abonnement !</p>
                  <ul className="features-list">
                    <li>✅ Accès illimité activé</li>
                    <li>✅ Tous les arbres disponibles</li>
                    <li>✅ Exports PDF illimités</li>
                  </ul>
                  <button className="btn-secondary" onClick={() => alert('Fonctionnalité de gestion d\'abonnement à venir')}>
                    Gérer l'abonnement
                  </button>
                </div>
              )}

              {user.status === 'admin' && (
                <div className="admin-section">
                  <h4>👑 Compte Administrateur</h4>
                  <p>Vous avez un accès complet à toutes les fonctionnalités</p>
                  <ul className="features-list">
                    <li>✅ Accès total à l'application</li>
                    <li>✅ Panneau d'administration</li>
                    <li>✅ Gestion des utilisateurs</li>
                    <li>✅ Édition des arbres et tests</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSettings;
