import React, { useState, useEffect } from 'react';
import API from '../../api';
import './TreeEditor.css';

function TreeEditor({ tree, onSave, onCancel }) {
  const [treeData, setTreeData] = useState(tree);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const updateTree = (field, value) => {
    setTreeData({ ...treeData, [field]: value });
  };

  const addNode = (type) => {
    const newId = Math.max(...treeData.nodes.map(n => n.id), 0) + 1;
    
    let newNode = { id: newId, type };

    if (type === 'question') {
      newNode.text = 'Nouvelle question';
      newNode.answers = [
        { text: 'Oui', next: null },
        { text: 'Non', next: null }
      ];
    } else if (type === 'test') {
      newNode.text = 'Résultat du test ?';
      newNode.tests = [];
      newNode.answers = [
        { text: 'Positif', next: null },
        { text: 'Négatif', next: null }
      ];
    } else if (type === 'result') {
      newNode.title = 'Nouveau résultat';
      newNode.severity = 'warning';
      newNode.description = '';
      newNode.recommendations = [];
      newNode.isRedFlag = false;
    }

    setTreeData({
      ...treeData,
      nodes: [...treeData.nodes, newNode]
    });
    setSelectedNodeId(newId);
  };

  const updateNode = (nodeId, updates) => {
    setTreeData({
      ...treeData,
      nodes: treeData.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    });
  };

  const deleteNode = (nodeId) => {
    if (!window.confirm('Supprimer ce nœud ?')) return;
    
    setTreeData({
      ...treeData,
      nodes: treeData.nodes.filter(n => n.id !== nodeId)
    });
    setSelectedNodeId(null);
  };

  const addAnswer = (nodeId) => {
    const node = treeData.nodes.find(n => n.id === nodeId);
    if (!node || !node.answers) return;

    updateNode(nodeId, {
      answers: [...node.answers, { text: 'Nouvelle réponse', next: null }]
    });
  };

  const updateAnswer = (nodeId, answerIndex, field, value) => {
    const node = treeData.nodes.find(n => n.id === nodeId);
    const newAnswers = [...node.answers];
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], [field]: value };
    updateNode(nodeId, { answers: newAnswers });
  };

  const deleteAnswer = (nodeId, answerIndex) => {
    const node = treeData.nodes.find(n => n.id === nodeId);
    const newAnswers = node.answers.filter((_, i) => i !== answerIndex);
    updateNode(nodeId, { answers: newAnswers });
  };

  const handleSave = () => {
    // Validation
    if (!treeData.name || !treeData.icon) {
      alert('Le nom et l\'icône sont requis');
      return;
    }

    if (treeData.nodes.length === 0) {
      alert('L\'arbre doit contenir au moins un nœud');
      return;
    }

    onSave(treeData);
  };

  const selectedNode = treeData.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="tree-editor">
      <div className="editor-header">
        <h3>Éditeur d'Arbre Décisionnel</h3>
        <div className="header-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSave}>
            💾 Sauvegarder
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Panneau de gauche - Propriétés de l'arbre */}
        <div className="tree-properties">
          <h4>Propriétés de l'arbre</h4>
          
          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              value={treeData.name}
              onChange={(e) => updateTree('name', e.target.value)}
              placeholder="Ex: Cervicale"
            />
          </div>

          <div className="form-group">
            <label>Icône * (emoji)</label>
            <input
              type="text"
              value={treeData.icon}
              onChange={(e) => updateTree('icon', e.target.value)}
              placeholder="🦴"
              maxLength={2}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={treeData.description || ''}
              onChange={(e) => updateTree('description', e.target.value)}
              placeholder="Description de l'arbre..."
              rows={3}
            />
          </div>

          <div className="add-node-section">
            <h4>Ajouter un nœud</h4>
            <button className="btn-add" onClick={() => addNode('question')}>
              ❓ Question
            </button>
            <button className="btn-add" onClick={() => addNode('test')}>
              🏥 Test
            </button>
            <button className="btn-add" onClick={() => addNode('result')}>
              ✅ Résultat
            </button>
          </div>
        </div>

        {/* Panneau central - Liste des nœuds */}
        <div className="nodes-list">
          <h4>Nœuds ({treeData.nodes.length})</h4>
          {treeData.nodes.map(node => (
            <div
              key={node.id}
              className={`node-item ${selectedNodeId === node.id ? 'selected' : ''}`}
              onClick={() => setSelectedNodeId(node.id)}
            >
              <div className="node-type">
                {node.type === 'question' && '❓'}
                {node.type === 'test' && '🏥'}
                {node.type === 'result' && '✅'}
              </div>
              <div className="node-content">
                <strong>Nœud #{node.id}</strong>
                <p>{node.text || node.title || 'Sans titre'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Panneau de droite - Éditeur de nœud */}
        <div className="node-editor">
          {selectedNode ? (
            <>
              <div className="editor-header-node">
                <h4>Nœud #{selectedNode.id}</h4>
                <button 
                  className="btn-delete-small" 
                  onClick={() => deleteNode(selectedNode.id)}
                >
                  🗑️
                </button>
              </div>

              {selectedNode.type === 'question' && (
                <QuestionEditor
                  node={selectedNode}
                  onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                  onAddAnswer={() => addAnswer(selectedNode.id)}
                  onUpdateAnswer={(idx, field, val) => updateAnswer(selectedNode.id, idx, field, val)}
                  onDeleteAnswer={(idx) => deleteAnswer(selectedNode.id, idx)}
                  availableNodes={treeData.nodes}
                />
              )}

              {selectedNode.type === 'test' && (
                <TestNodeEditor
                  node={selectedNode}
                  onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                  onAddAnswer={() => addAnswer(selectedNode.id)}
                  onUpdateAnswer={(idx, field, val) => updateAnswer(selectedNode.id, idx, field, val)}
                  onDeleteAnswer={(idx) => deleteAnswer(selectedNode.id, idx)}
                  availableNodes={treeData.nodes}
                />
              )}

              {selectedNode.type === 'result' && (
                <ResultEditor
                  node={selectedNode}
                  onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                />
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Sélectionnez un nœud pour l'éditer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Éditeur de question
function QuestionEditor({ node, onUpdate, onAddAnswer, onUpdateAnswer, onDeleteAnswer, availableNodes }) {
  return (
    <div className="node-form">
      <div className="form-group">
        <label>Question</label>
        <textarea
          value={node.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Posez votre question..."
          rows={3}
        />
      </div>

      <div className="answers-section">
        <h5>Réponses</h5>
        {node.answers.map((answer, idx) => (
          <div key={idx} className="answer-item">
            <input
              type="text"
              value={answer.text}
              onChange={(e) => onUpdateAnswer(idx, 'text', e.target.value)}
              placeholder="Texte de la réponse"
            />
            <select
              value={answer.next || ''}
              onChange={(e) => onUpdateAnswer(idx, 'next', parseInt(e.target.value) || null)}
            >
              <option value="">-- Nœud suivant --</option>
              {availableNodes.map(n => (
                <option key={n.id} value={n.id}>
                  Nœud #{n.id} ({n.type})
                </option>
              ))}
            </select>
            <button className="btn-delete-small" onClick={() => onDeleteAnswer(idx)}>
              ❌
            </button>
          </div>
        ))}
        <button className="btn-add-small" onClick={onAddAnswer}>
          ➕ Ajouter une réponse
        </button>
      </div>
    </div>
  );
}

// Éditeur de test
function TestNodeEditor({ node, onUpdate, onAddAnswer, onUpdateAnswer, onDeleteAnswer, availableNodes }) {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState(node.tests || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    // Synchroniser les tests sélectionnés avec le nœud
    onUpdate({ tests: selectedTests });
  }, [selectedTests]);

  const loadTests = async () => {
    try {
      const tests = await API.getTests();
      setAvailableTests(tests);
    } catch (error) {
      console.error('Erreur chargement tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (test) => {
    const isSelected = selectedTests.some(t => t.id === test.id);
    
    if (isSelected) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, {
        id: test.id,
        name: test.name,
        description: test.description,
        videoUrl: test.video_url
      }]);
    }
  };

  const isTestSelected = (testId) => {
    return selectedTests.some(t => t.id === testId);
  };

  return (
    <div className="node-form">
      <div className="form-group">
        <label>Question après le test</label>
        <input
          type="text"
          value={node.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Ex: Le test est-il positif ?"
        />
      </div>

      <div className="form-group">
        <label>Tests à réaliser ({selectedTests.length} sélectionné{selectedTests.length > 1 ? 's' : ''})</label>
        
        {loading ? (
          <p>Chargement des tests...</p>
        ) : (
          <div className="tests-selector">
            {availableTests.map(test => (
              <div key={test.id} className="test-option">
                <label>
                  <input
                    type="checkbox"
                    checked={isTestSelected(test.id)}
                    onChange={() => toggleTest(test)}
                  />
                  <span className="test-name">{test.name}</span>
                  <span className="test-region">({test.region})</span>
                </label>
                <p className="test-description">{test.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="answers-section">
        <h5>Réponses</h5>
        {node.answers.map((answer, idx) => (
          <div key={idx} className="answer-item">
            <input
              type="text"
              value={answer.text}
              onChange={(e) => onUpdateAnswer(idx, 'text', e.target.value)}
            />
            <select
              value={answer.next || ''}
              onChange={(e) => onUpdateAnswer(idx, 'next', parseInt(e.target.value) || null)}
            >
              <option value="">-- Nœud suivant --</option>
              {availableNodes.map(n => (
                <option key={n.id} value={n.id}>
                  Nœud #{n.id} ({n.type})
                </option>
              ))}
            </select>
            <button className="btn-delete-small" onClick={() => onDeleteAnswer(idx)}>
              ❌
            </button>
          </div>
        ))}
        <button className="btn-add-small" onClick={onAddAnswer}>
          ➕ Ajouter une réponse
        </button>
      </div>
    </div>
  );
}

// Éditeur de résultat
function ResultEditor({ node, onUpdate }) {
  const addRecommendation = () => {
    onUpdate({
      recommendations: [...(node.recommendations || []), 'Nouvelle recommandation']
    });
  };

  const updateRecommendation = (idx, value) => {
    const newRecs = [...node.recommendations];
    newRecs[idx] = value;
    onUpdate({ recommendations: newRecs });
  };

  const deleteRecommendation = (idx) => {
    onUpdate({
      recommendations: node.recommendations.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="node-form">
      <div className="form-group">
        <label>Titre du résultat</label>
        <input
          type="text"
          value={node.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Cervicalgie commune"
        />
      </div>

      <div className="form-group">
        <label>Sévérité</label>
        <select
          value={node.severity}
          onChange={(e) => onUpdate({ severity: e.target.value })}
        >
          <option value="success">Succès (vert)</option>
          <option value="warning">Attention (orange)</option>
          <option value="danger">Danger (rouge)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={node.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={4}
          placeholder="Description détaillée du résultat..."
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={node.isRedFlag || false}
            onChange={(e) => onUpdate({ isRedFlag: e.target.checked })}
          />
          Drapeau rouge (référer immédiatement)
        </label>
      </div>

      <div className="recommendations-section">
        <h5>Recommandations</h5>
        {(node.recommendations || []).map((rec, idx) => (
          <div key={idx} className="recommendation-item">
            <input
              type="text"
              value={rec}
              onChange={(e) => updateRecommendation(idx, e.target.value)}
              placeholder="Recommandation..."
            />
            <button className="btn-delete-small" onClick={() => deleteRecommendation(idx)}>
              ❌
            </button>
          </div>
        ))}
        <button className="btn-add-small" onClick={addRecommendation}>
          ➕ Ajouter une recommandation
        </button>
      </div>
    </div>
  );
}

export default TreeEditor;
