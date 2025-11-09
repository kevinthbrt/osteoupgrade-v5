#!/bin/bash
# Script de test OsteoUpgrade v3.0
# Ce script teste toutes les fonctionnalités du backend

echo "🦴 OsteoUpgrade v3.0 - Script de Test"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1 - Serveur accessible
echo "Test 1: Vérification que le serveur est démarré..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|302"; then
    echo -e "${GREEN}✓${NC} Serveur accessible"
else
    echo -e "${RED}✗${NC} Serveur non accessible. Avez-vous lancé 'npm start' ?"
    exit 1
fi
echo ""

# Test 2 - Inscription d'un nouvel utilisateur
echo "Test 2: Création d'un compte test..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-'$(date +%s)'@example.com","password":"test123","name":"Test User"}')

if echo "$RESPONSE" | grep -q "Compte créé"; then
    echo -e "${GREEN}✓${NC} Création de compte fonctionne"
else
    echo -e "${YELLOW}⚠${NC} Création de compte : $RESPONSE"
fi
echo ""

# Test 3 - Connexion admin
echo "Test 3: Connexion avec le compte admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kevin.thubert@gmail.com","password":"osteoupgrade97"}' \
  -c cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "kevin.thubert@gmail.com"; then
    echo -e "${GREEN}✓${NC} Login admin fonctionne"
    echo "   Votre compte: kevin.thubert@gmail.com / osteoupgrade97"
else
    echo -e "${RED}✗${NC} Login échoué: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 4 - Récupération des arbres
echo "Test 4: Récupération des arbres décisionnels..."
TREES=$(curl -s "$BASE_URL/api/trees" -b cookies.txt)

if echo "$TREES" | grep -q "Cervicale\|Lombaire"; then
    TREE_COUNT=$(echo "$TREES" | grep -o "\"id\"" | wc -l)
    echo -e "${GREEN}✓${NC} Arbres récupérés ($TREE_COUNT arbres trouvés)"
else
    echo -e "${RED}✗${NC} Erreur récupération arbres"
fi
echo ""

# Test 5 - Récupération des tests
echo "Test 5: Récupération des tests orthopédiques..."
TESTS=$(curl -s "$BASE_URL/api/tests" -b cookies.txt)

if echo "$TESTS" | grep -q "Spurling\|Lachman"; then
    TEST_COUNT=$(echo "$TESTS" | grep -o "\"id\"" | wc -l)
    echo -e "${GREEN}✓${NC} Tests récupérés ($TEST_COUNT tests trouvés)"
else
    echo -e "${RED}✗${NC} Erreur récupération tests"
fi
echo ""

# Test 6 - Statistiques (admin)
echo "Test 6: Récupération des statistiques..."
STATS=$(curl -s "$BASE_URL/api/stats" -b cookies.txt)

if echo "$STATS" | grep -q "totalUsers\|totalDiagnostics"; then
    echo -e "${GREEN}✓${NC} Statistiques récupérées"
    echo "$STATS" | grep -o '"totalUsers":[0-9]*' | head -1
    echo "$STATS" | grep -o '"totalDiagnostics":[0-9]*' | head -1
else
    echo -e "${RED}✗${NC} Erreur récupération stats"
fi
echo ""

# Test 7 - Liste des utilisateurs (admin)
echo "Test 7: Liste des utilisateurs..."
USERS=$(curl -s "$BASE_URL/api/users" -b cookies.txt)

if echo "$USERS" | grep -q "kevin.thubert@gmail.com"; then
    USER_COUNT=$(echo "$USERS" | grep -o "\"id\"" | wc -l)
    echo -e "${GREEN}✓${NC} Utilisateurs récupérés ($USER_COUNT utilisateurs)"
else
    echo -e "${RED}✗${NC} Erreur récupération utilisateurs"
fi
echo ""

# Test 8 - Obtenir un arbre spécifique
echo "Test 8: Récupération du détail d'un arbre..."
TREE_DETAIL=$(curl -s "$BASE_URL/api/trees/1" -b cookies.txt)

if echo "$TREE_DETAIL" | grep -q "nodes\|Cervicale"; then
    NODE_COUNT=$(echo "$TREE_DETAIL" | grep -o "\"id\":" | wc -l)
    echo -e "${GREEN}✓${NC} Détail de l'arbre récupéré ($NODE_COUNT nœuds)"
else
    echo -e "${RED}✗${NC} Erreur récupération détail arbre"
fi
echo ""

# Test 9 - Enregistrer un diagnostic
echo "Test 9: Enregistrement d'un diagnostic..."
DIAGNOSTIC=$(curl -s -X POST "$BASE_URL/api/diagnostics" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "tree_id": 1,
    "tree_name": "Cervicale",
    "path": ["q1", "q2", "r1"],
    "result_title": "Test diagnostic",
    "result_severity": "success",
    "result_description": "Test de diagnostic pour validation",
    "recommendations": ["Test 1", "Test 2"]
  }')

if echo "$DIAGNOSTIC" | grep -q "diagnosticId"; then
    DIAG_ID=$(echo "$DIAGNOSTIC" | grep -o '"diagnosticId":[0-9]*' | grep -o '[0-9]*')
    echo -e "${GREEN}✓${NC} Diagnostic enregistré (ID: $DIAG_ID)"
    
    # Test 10 - Export PDF
    echo ""
    echo "Test 10: Export PDF du diagnostic..."
    PDF_RESPONSE=$(curl -s -o test-diagnostic.pdf -w "%{http_code}" \
      "$BASE_URL/api/diagnostics/$DIAG_ID/pdf" -b cookies.txt)
    
    if [ "$PDF_RESPONSE" = "200" ] && [ -f "test-diagnostic.pdf" ]; then
        PDF_SIZE=$(ls -lh test-diagnostic.pdf | awk '{print $5}')
        echo -e "${GREEN}✓${NC} PDF généré avec succès (Taille: $PDF_SIZE)"
        echo "   Fichier: test-diagnostic.pdf"
    else
        echo -e "${RED}✗${NC} Erreur génération PDF"
    fi
else
    echo -e "${RED}✗${NC} Erreur enregistrement diagnostic"
fi
echo ""

# Test 11 - Déconnexion
echo "Test 11: Déconnexion..."
LOGOUT=$(curl -s -X POST "$BASE_URL/api/auth/logout" -b cookies.txt)

if echo "$LOGOUT" | grep -q "Déconnecté"; then
    echo -e "${GREEN}✓${NC} Déconnexion fonctionne"
else
    echo -e "${YELLOW}⚠${NC} Déconnexion : $LOGOUT"
fi
echo ""

# Nettoyage
rm -f cookies.txt

# Résumé
echo "======================================"
echo "🎉 Tests terminés !"
echo ""
echo "Si tous les tests sont verts (✓), votre backend est 100% fonctionnel !"
echo ""
echo "Prochaines étapes :"
echo "1. Ouvrez http://localhost:3000 dans votre navigateur"
echo "2. Connectez-vous avec kevin.thubert@gmail.com / osteoupgrade97"
echo "3. Finalisez le frontend selon MODIFICATIONS_FRONTEND.txt"
echo ""
echo "Fichiers générés :"
echo "- test-diagnostic.pdf (exemple de PDF généré)"
echo ""
