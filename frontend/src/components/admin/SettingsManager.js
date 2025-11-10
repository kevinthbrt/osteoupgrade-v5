import React, { useState, useEffect } from 'react';
import API from '../../api';
import './SettingsManager.css';

function SettingsManager() {
  const [trees, setTrees] = useState([]);
  const [freemiumTreeId, setFreemiumTreeId] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [dailyTip, setDailyTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [treesData, freemiumSetting, priceSetting, tipSetting] = await Promise.all([
        API.getTrees(),
        API.getSetting('freemium_tree_id').catch(() => ({ value: '1' })),
        API.getSetting('premium_price').catch(() => ({ value: '29.99' })),
        API.getSetting('daily_tip').catch(() => ({ value: 'OsteoUpgrade utilise des arbres décisionnels basés sur des références scientifiques pour vous guider dans votre diagnostic ostéopathique.' }))
      ]);
      
      setTrees(treesData);
      setFreemiumTreeId(freemiumSetting.value);
      setPremiumPrice(priceSetting.value);
      setDailyTip(tipSetting.value);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFreemiumTree = async () => {
    try {
      await API.setSetting('freemium_tree_id', freemiumTreeId);
      alert('Arbre Freemium enregistré');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
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

  const saveDailyTip = async () => {
    try {
      await API.setSetting('daily_tip', dailyTip);
      alert('Conseil enregistré');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) {
    return <div className="loading">Chargement des paramètres...</div>;
  }

  return (
    <div className="settings-manager">
      <h3>Paramètres de l'application</h3>

      {/* Arbre Freemium */}
      <div className="setting-section">
        <h4>🆓 Compte Freemium</h4>
        <p className="section-description">
          Choisissez l'arbre décisionnel accessible gratuitement aux comptes Freemium
        </p>
        <div className="setting-row">
          <label>Arbre accessible :</label>
          <select
            value={freemiumTreeId}
            onChange={(e) => setFreemiumTreeId(e.target.value)}
            className="tree-select"
          >
            {trees.map(tree => (
              <option key={tree.id} value={tree.id}>
                {tree.icon} {tree.name}
              </option>
            ))}
          </select>
          <button className="btn-save" onClick={saveFreemiumTree}>
            💾 Enregistrer
          </button>
        </div>
        <p className="setting-info">
          Les utilisateurs Freemium n'auront accès qu'à cet arbre. Les autres seront verrouillés.
        </p>
      </div>

      {/* Prix Premium */}
      <div className="setting-section">
        <h4>💳 Abonnement Premium</h4>
        <p className="section-description">
          Définissez le prix mensuel de l'abonnement Premium
        </p>
        <div className="setting-row">
          <label>Prix mensuel (€) :</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
            placeholder="29.99"
            className="price-input"
          />
          <button className="btn-save" onClick={savePremiumPrice}>
            💾 Enregistrer
          </button>
        </div>
        <p className="setting-info">
          Les comptes Premium auront accès à tous les arbres décisionnels.
        </p>
      </div>

      {/* Le saviez-vous */}
      <div className="setting-section">
        <h4>💡 Le saviez-vous ?</h4>
        <p className="section-description">
          Personnalisez le conseil affiché sur la page d'accueil des utilisateurs
        </p>
        <div className="tip-editor">
          <textarea
            value={dailyTip}
            onChange={(e) => setDailyTip(e.target.value)}
            placeholder="Entrez votre conseil du jour..."
            rows={4}
            maxLength={500}
            className="tip-textarea"
          />
          <div className="tip-footer">
            <span className="char-count">{dailyTip.length}/500 caractères</span>
            <button className="btn-save" onClick={saveDailyTip}>
              💾 Enregistrer
            </button>
          </div>
        </div>
        <p className="setting-info">
          Ce texte apparaîtra dans l'encart "Le saviez-vous ?" sur le dashboard de tous les utilisateurs.
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="summary-section">
        <h4>📊 Récapitulatif des accès</h4>
        <div className="access-table">
          <div className="access-row">
            <div className="access-status">
              <span className="badge badge-freemium">Freemium</span>
            </div>
            <div className="access-details">
              <strong>Gratuit</strong> - Accès à 1 arbre ({trees.find(t => t.id == freemiumTreeId)?.name})
            </div>
          </div>
          <div className="access-row">
            <div className="access-status">
              <span className="badge badge-premium">Premium</span>
            </div>
            <div className="access-details">
              <strong>{premiumPrice}€/mois</strong> - Accès illimité à tous les arbres ({trees.length} arbres)
            </div>
          </div>
          <div className="access-row">
            <div className="access-status">
              <span className="badge badge-admin">Admin</span>
            </div>
            <div className="access-details">
              <strong>Accès total</strong> - Tous les arbres + Gestion + Édition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsManager;
