import React, { useState, useEffect } from 'react';
import API from '../../api';
import './UserManager.css';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await API.updateUser(userId, { is_active: currentStatus ? 0 : 1 });
      loadUsers();
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
      
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Dernière connexion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge badge-${user.status}`}>
                  {user.status}
                </span>
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
                  {user.is_active ? '✅ Actif' : '❌ Désactivé'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManager;
