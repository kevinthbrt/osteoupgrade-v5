import React, { useState, useEffect } from 'react';
import API from '../api';
import './DecisionTree.css';

function DecisionTree({ treeId, onBack }) {
  const [tree, setTree] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [path, setPath] = useState([]);
  const [pdfId, setPdfId] = useState(null);

  useEffect(() => {
    loadTree();
  }, [treeId]);

  const loadTree = async () => {
    try {
      const treeData = await API.getTree(treeId);
      setTree(treeData);
      setCurrentNodeId(treeData.nodes[0].id);
      setPath([]);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de chargement de l\'arbre');
    }
  };

  const handleAnswer = (nextNodeId) => {
    setPath([...path, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const handleBack = () => {
    if (path.length > 0) {
      const newPath = [...path];
      const previousNodeId = newPath.pop();
      setPath(newPath);
      setCurrentNodeId(previousNodeId);
    }
  };

  const saveDiagnostic = async (resultNode) => {
    // Éviter les doubles sauvegardes
    if (pdfId) return;
    
    try {
      const data = {
        tree_id: treeId,
        tree_name: tree.name,
        path: [...path, currentNodeId],
        result_title: resultNode.title,
        result_severity: resultNode.severity,
        result_description: resultNode.description,
        recommendations: resultNode.recommendations
      };
      
      const response = await API.saveDiagnostic(data);
      setPdfId(response.diagnosticId);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  // Effet pour sauvegarder le diagnostic une seule fois
  useEffect(() => {
    if (tree && currentNodeId) {
      const currentNode = tree.nodes.find(n => n.id === currentNodeId);
      if (currentNode && currentNode.type === 'result' && !pdfId) {
        saveDiagnostic(currentNode);
      }
    }
  }, [currentNodeId, tree]);

  if (!tree) return <div className="loading">Chargement de l'arbre...</div>;

  const currentNode = tree.nodes.find(n => n.id === currentNodeId);
  if (!currentNode) return <div>Erreur: nœud introuvable</div>;

  return (
    <div className="decision-tree">
      <div className="tree-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>{tree.icon} {tree.name}</h2>
      </div>

      <div className="tree-content">
        {currentNode.type === 'question' && (
          <div className="question-node">
            <h3>{currentNode.text}</h3>
            <div className="answers">
              {currentNode.answers.map((answer, idx) => (
                <button
                  key={idx}
                  className="answer-btn"
                  onClick={() => handleAnswer(answer.next)}
                >
                  {answer.text}
                </button>
              ))}
            </div>
            {path.length > 0 && (
              <button className="btn-secondary" onClick={handleBack}>
                ← Retour
              </button>
            )}
          </div>
        )}

        {currentNode.type === 'test' && (
          <div className="test-node">
            <h3>Tests à réaliser</h3>
            <div className="tests-list">
              {currentNode.tests.map((test, idx) => (
                <div key={idx} className="test-item">
                  <h4>{test.name}</h4>
                  <p>{test.description}</p>
                  {test.videoUrl && (
                    <a href={test.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                      📹 Voir la vidéo
                    </a>
                  )}
                </div>
              ))}
            </div>
            <p className="test-question">{currentNode.text}</p>
            <div className="answers">
              {currentNode.answers.map((answer, idx) => (
                <button
                  key={idx}
                  className="answer-btn"
                  onClick={() => handleAnswer(answer.next)}
                >
                  {answer.text}
                </button>
              ))}
            </div>
            <button className="btn-secondary" onClick={handleBack}>
              ← Retour
            </button>
          </div>
        )}

        {currentNode.type === 'result' && (
          <div className={`result-node severity-${currentNode.severity}`}>
            <h3>{currentNode.title}</h3>
            {currentNode.isRedFlag && (
              <div className="red-flag">🚩 DRAPEAU ROUGE - Référer immédiatement</div>
            )}
            <p className="result-description">{currentNode.description}</p>
            
            {currentNode.recommendations && currentNode.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>Recommandations :</h4>
                <ul>
                  {currentNode.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="result-actions">
              <button className="btn-primary" onClick={onBack}>
                ✓ Terminer
              </button>
              {pdfId && (
                <button 
                  className="btn-secondary" 
                  onClick={() => API.downloadPdf(pdfId)}
                >
                  📄 Télécharger le PDF
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DecisionTree;
