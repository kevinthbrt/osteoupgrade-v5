import React, { useState, useEffect } from 'react';
import API from '../../api';
import TreeEditor from './TreeEditor';
import './TreeManager.css';

function TreeManager() {
  const [trees, setTrees] = useState([]);
  const [editingTree, setEditingTree] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrees();
  }, []);

  const loadTrees = async () => {
    try {
      const data = await API.getTrees();
      setTrees(data);
    } catch (error) {
      console.error('Erreur chargement arbres:', error);
      alert('Erreur lors du chargement des arbres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTree({
      name: '',
      icon: '🦴',
      description: '',
      nodes: [
        {
          id: 1,
          type: 'question',
          text: 'Première question',
          answers: [
            { text: 'Oui', next: 2 },
            { text: 'Non', next: 3 }
          ]
        }
      ]
    });
    setShowEditor(true);
  };

  const handleEdit = async (treeId) => {
    try {
      const tree = await API.getTree(treeId);
      setEditingTree(tree);
      setShowEditor(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement de l\'arbre');
    }
  };

  const handleDelete = async (treeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet arbre ?')) {
      return;
    }

    try {
      await API.deleteTree(treeId);
      loadTrees();
      alert('Arbre supprimé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSave = async (treeData) => {
    try {
      if (treeData.id) {
        await API.updateTree(treeData.id, treeData);
        alert('Arbre modifié avec succès');
      } else {
        await API.createTree(treeData);
        alert('Arbre créé avec succès');
      }
      setShowEditor(false);
      setEditingTree(null);
      loadTrees();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTree(null);
  };

  if (showEditor) {
    return (
      <TreeEditor
        tree={editingTree}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  if (loading) {
    return <div className="loading">Chargement des arbres...</div>;
  }

  return (
    <div className="tree-manager">
      <div className="manager-header">
        <h3>Arbres Décisionnels</h3>
        <button className="btn-create" onClick={handleCreate}>
          ➕ Créer un nouvel arbre
        </button>
      </div>

      <div className="trees-list">
        {trees.length === 0 ? (
          <div className="empty-state">
            <p>Aucun arbre décisionnel pour le moment.</p>
            <button className="btn-primary" onClick={handleCreate}>
              Créer le premier arbre
            </button>
          </div>
        ) : (
          trees.map(tree => (
            <div key={tree.id} className="tree-card">
              <div className="tree-icon">{tree.icon}</div>
              <div className="tree-info">
                <h4>{tree.name}</h4>
                <p>{tree.description || 'Pas de description'}</p>
                <div className="tree-meta">
                  <span>{tree.nodes?.length || 0} nœuds</span>
                </div>
              </div>
              <div className="tree-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEdit(tree.id)}
                >
                  ✏️ Modifier
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(tree.id)}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TreeManager;
