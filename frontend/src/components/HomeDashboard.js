// frontend/src/components/HomeDashboard.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import './HomeDashboard.css';

function HomeDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentDiagnostics, setRecentDiagnostics] = useState([]);
  const [trees, setTrees] = useState([]);
  const [dailyTip, setDailyTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [treesData, diagnosticsData, tipSetting] = await Promise.all([
        API.getTrees(),
        API.getDiagnostics().catch(() => []),
        API.getSetting('daily_tip').catch(() => ({
          value:
            "OsteoUpgrade utilise des arbres décisionnels basés sur des références scientifiques pour vous guider dans votre diagnostic ostéopathique."
        }))
      ]);

      setTrees(Array.isArray(treesData) ? treesData : []);
      setRecentDiagnostics((diagnosticsData || []).slice(0, 5));
      setDailyTip(tipSetting?.value || '');

      if (user?.status === 'admin') {
        const statsData = await API.getStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-dashboard">
        <div className="loading">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="home-dashboard">
      {/* En-tête de bienvenue */}
      <div className="welcome-header">
        <div className="welcome-content">
          <h2>Bienvenue, {String(user?.name || user?.email || '').split(' ')[0]} ! 👋</h2>
          <p>Tableau de bord - OsteoUpgrade</p>
        </div>
        <div className="user-badge">
          <span className={`status-badge status-${user?.status}`}>
            {user?.status === 'admin' && '👑 Admin'}
            {user?.status === 'premium' && '⭐ Premium'}
            {user?.status === 'freemium' && '🆓 Freemium'}
          </span>
        </div>
      </div>

      {/* Statistiques (Admin uniquement) */}
      {user?.status === 'admin' && stats && (
        <div className="stats-grid">
          <StatCard icon="👥" title="Utilisateurs" value={stats.totalUsers} color="#4A90E2" />
          <StatCard icon="📊" title="Diagnostics" value={stats.totalDiagnostics} color="#27AE60" />
          <StatCard icon="🌳" title="Arbres" value={stats.totalTrees} color="#F39C12" />
          <StatCard icon="🏥" title="Tests" value={stats.totalTests} color="#E74C3C" />
        </div>
      )}

      {/* Le saviez-vous */}
      <div className="daily-tip-banner">
        <div className="tip-icon">💡</div>
        <div className="tip-content">
          <h4>Le saviez-vous ?</h4>
          <p>{dailyTip}</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Colonne gauche */}
        <div className="dashboard-left">
          {/* Accès rapides */}
          <div className="quick-access">
            <h3>🚀 Accès rapides</h3>
            <div className="quick-buttons">
              <button className="quick-btn primary" onClick={() => onNavigate('trees')}>
                <span className="btn-icon">🌳</span>
                <span>Commencer un diagnostic</span>
              </button>

              {user?.status === 'admin' && (
                <button className="quick-btn admin" onClick={() => onNavigate('admin')}>
                  <span className="btn-icon">🔧</span>
                  <span>Panneau Admin</span>
                </button>
              )}

              {user?.status === 'freemium' && (
                <button className="quick-btn upgrade" onClick={() => onNavigate('upgrade')}>
                  <span className="btn-icon">⭐</span>
                  <span>Passer à Premium</span>
                </button>
              )}
            </div>
          </div>

          {/* Arbres disponibles */}
          <div className="available-trees">
            <h3>🌳 Vos arbres décisionnels</h3>
            {trees.length === 0 ? (
              <p className="empty-message">Aucun arbre disponible pour le moment</p>
            ) : (
              <div className="trees-list-compact">
                {trees.slice(0, 4).map((tree) => (
                  <div
                    key={tree.id}
                    className="tree-compact"
                    onClick={() => onNavigate('tree', tree.id)}
                  >
                    <span className="tree-icon">🌳</span>
                    <span className="tree-name">{tree.title}</span>
                    <span className="tree-arrow">→</span>
                  </div>
                ))}
                {trees.length > 4 && (
                  <button className="see-more" onClick={() => onNavigate('trees')}>
                    Voir tous les arbres ({trees.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="dashboard-right">
          {/* Activité récente */}
          <div className="recent-activity">
            <h3>📋 Activité récente</h3>
            {recentDiagnostics.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📊</p>
                <p>Aucun diagnostic réalisé</p>
                <button className="btn-start" onClick={() => onNavigate('trees')}>
                  Commencer maintenant
                </button>
              </div>
            ) : (
              <div className="activity-list">
                {recentDiagnostics.map((diag) => (
                  <div key={diag.id} className="activity-item">
                    <div className="activity-icon">
                      <span className={`severity-dot severity-${diag.result_severity}`}></span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{diag.result_title}</div>
                      <div className="activity-meta">
                        {diag.tree_name} • {formatDate(diag.created_at)}
                      </div>
                    </div>
                    <button
                      className="activity-action"
                      onClick={() =>
                        alert("Export PDF non encore implémenté (à faire via Supabase Edge Function)")
                      }
                      title="Télécharger le PDF"
                    >
                      📄
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade CTA pour Freemium */}
          {user?.status === 'freemium' && (
            <div className="upgrade-card">
              <h4>⭐ Passez à Premium</h4>
              <p>Accédez à tous les arbres décisionnels sans limitation !</p>
              <button className="btn-upgrade-full" onClick={() => onNavigate('upgrade')}>
                En savoir plus
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour formater la date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default HomeDashboard;
