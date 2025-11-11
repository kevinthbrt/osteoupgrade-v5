import React, { useState } from 'react';
import './Register.css';

function Register({ onRegister, onBackToLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false); // <-- nouvel état

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.name) return setError('Tous les champs sont obligatoires');
    if (formData.password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères');
    if (formData.password !== formData.confirmPassword) return setError('Les mots de passe ne correspondent pas');

    setLoading(true);
    try {
      await onRegister(formData.email, formData.password, formData.name);
      // Si confirmation requise: onRegister n’effectue PAS le login -> on affiche un message
      setDone(true);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="register-container">
        <div className="register-box">
          <div className="logo">🦴</div>
          <h1>Vérifie tes emails</h1>
          <p className="subtitle">
            Nous t’avons envoyé un lien de confirmation. Clique dessus puis reviens te connecter.
          </p>
          <button className="btn-primary" onClick={onBackToLogin}>Retour à la connexion</button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="logo">🦴</div>
        <h1>Créer un compte</h1>
        <p className="subtitle">Rejoignez OsteoUpgrade</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
                   placeholder="Dr. Jean Dupont" required disabled={loading} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)}
                   placeholder="votre@email.com" required disabled={loading} />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)}
                   placeholder="••••••••" required disabled={loading} minLength={6} />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" value={formData.confirmPassword}
                   onChange={(e) => handleChange('confirmPassword', e.target.value)}
                   placeholder="••••••••" required disabled={loading} />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="register-footer">
          <p>Déjà un compte ?</p>
          <button className="btn-link" onClick={onBackToLogin}>Se connecter</button>
        </div>

        <div className="free-info">
          <p>🎁 <strong>Compte Freemium gratuit</strong></p>
          <p>Accès à un arbre décisionnel</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
