import React, { useState, useEffect } from 'react';
import API from '../../api';
import './UserManager.css';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premiumPrice, setPremiumPrice] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await API.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const setting = await API.getSetting('premium_price');
      setPremiumPrice(setting?.value || '29.99');
    } catch (error) {
      setPremiumPrice('29.99');
    }
  };

  const savePremiumPrice = async () => {
    try {
      await API.setSetting('premium_price', premiumPrice);
      alert('Prix Premium enregistré');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await API.updateUser(userId, { is_active: currentStatus ? 0 : 1 });
      loadUsers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const changeUserStatus = async (userId, newStatus) => {
    try {
      await API.updateUser(userId, { status: newStatus });
      loadUsers();
      alert('Statut modifié avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  if (loading) {
    return <div className="loading">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="user-manager">
      <h3>Gestion des Utilisateurs</h3>

      {/* Paramètre prix Premium */}
      <div className="premium-settings">
        <h4>💳 Abonnement Premium</h4>
        <div className="setting-row">
          <label>Prix mensuel (€) :</label>
          <input
            type="number"
            step="0.01"
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
            placeholder="29.99"
          />
          <button className="btn-save" onClick={savePremiumPrice}>
            💾 Enregistrer
          </button>
        </div>
        <p className="setting-info">
          Ce prix sera affiché lors de la mise à niveau vers Premium
        </p>
      </div>
      
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Dernière connexion</th>
            <th>Actif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={user.status}
                    onChange={(e) => {
                      changeUserStatus(user.id, e.target.value);
                      setEditingUser(null);
                    }}
                    className="status-select"
                  >
                    <option value="freemium">Freemium</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span
                    className={`badge badge-${user.status}`}
                    onClick={() => setEditingUser(user.id)}
                    style={{ cursor: 'pointer' }}
                    title="Cliquez pour modifier"
                  >
                    {user.status}
                  </span>
                )}
              </td>
              <td>
                {user.last_login ? 
                  new Date(user.last_login).toLocaleDateString('fr-FR') : 
                  'Jamais'
                }
              </td>
              <td>
                <button
                  className={`btn-toggle ${user.is_active ? 'active' : 'inactive'}`}
                  onClick={() => toggleUserStatus(user.id, user.is_active)}
                >
                  {user.is_active ? '✅' : '❌'}
                </button>
              </td>
              <td>
                <button
                  className="btn-change-status"
                  onClick={() => setEditingUser(user.id)}
                >
                  Changer statut
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="status-legend">
        <h4>Légende des statuts :</h4>
        <ul>
          <li><strong>Freemium</strong> : Accès gratuit à 1 arbre (configuré dans Paramètres)</li>
          <li><strong>Premium</strong> : Accès illimité à tous les arbres ({premiumPrice}€/mois)</li>
          <li><strong>Admin</strong> : Accès total + Gestion + Édition</li>
        </ul>
      </div>
    </div>
  );
}

export default UserManager;
