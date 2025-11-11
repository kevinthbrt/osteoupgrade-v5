// frontend/src/api.js
import { supabase } from "./supabaseClient";

/** Helpers */
function errMsg(e, fallback = "Erreur") {
  return e?.message || e?.error_description || fallback;
}
function mustUser(user) {
  if (!user) throw new Error("Non connecté");
  return user;
}

const API = {
  // --------------------
  // AUTH (email/password)
  // --------------------
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(errMsg(error, "Échec de connexion"));
    // Optionnel : stocker le user dans votre table public.users
    const u = data.user;
    await supabase.from("users")
      .upsert({ id: u.id, email: u.email }, { onConflict: "id" });
    // retourne un "user" au format attendu par ton App.js
    return { id: u.id, email: u.email, name: u.user_metadata?.name || u.email, status: "user" };
  },

  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } }
    });
    if (error) throw new Error(errMsg(error, "Échec de l'inscription"));
    // auto-login selon la config (si email confirm)
    return true;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(errMsg(error, "Échec de déconnexion"));
    return;
  },

  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Pas de session");
    // lis le rôle depuis ta table users (facultatif)
    const { data: userRow } = await supabase.from("users").select("*").eq("id", user.id).single();
    return {
      id: user.id,
      email: user.email,
      name: userRow?.name || user.user_metadata?.name || user.email,
      status: userRow?.role || "user" // "admin" si tu veux gérer ça plus tard
    };
  },

  // ------------
  // TREES (table)
  // ------------
  async getTrees() {
    const { data, error } = await supabase
      .from("trees")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      console.warn("trees list error:", error.message);
      return []; // évite l'écran blanc si la table n'existe pas encore
    }
    return data || [];
  },

  async getTree(id) {
    const { data, error } = await supabase.from("trees").select("*").eq("id", id).single();
    if (error) throw new Error(errMsg(error, "Impossible de charger l'arbre"));
    return data;
  },

  async createTree(tree) {
    const { error } = await supabase.from("trees").insert({
      title: tree.title,
      data: tree.data || {},
      // si tu as une orga, ajoute organization_id ici
    });
    if (error) throw new Error(errMsg(error, "Impossible de créer l'arbre"));
    return true;
  },

  async updateTree(id, tree) {
    const { error } = await supabase.from("trees").update({
      title: tree.title,
      data: tree.data || {}
    }).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour l'arbre"));
    return true;
  },

  async deleteTree(id) {
    const { error } = await supabase.from("trees").delete().eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de supprimer l'arbre"));
    return true;
  },

  // ----------------
  // TESTS (optionnel)
  // ----------------
  async getTests(region = null) {
    // Si tu crées une table "tests", remplace par un select supabase
    // Pour l’instant on retourne une liste vide pour ne pas casser l’UI
    return [];
  },
  async getTest(id) {
    // idem : à brancher quand la table existe
    return null;
  },
  async createTest(test) { throw new Error("Non implémenté (Supabase)"); },
  async updateTest(id, test) { throw new Error("Non implémenté (Supabase)"); },
  async deleteTest(id) { throw new Error("Non implémenté (Supabase)"); },

  // ---------------------
  // DIAGNOSTICS (optionel)
  // ---------------------
  async saveDiagnostic(d) { throw new Error("Non implémenté (Supabase)"); },
  async getDiagnostics() { return []; },
  downloadPdf(id) {
    // quand tu auras un générateur PDF (Edge Function), on ouvrira son URL
    alert("Export PDF non implémenté pour l’instant.");
  },

  // ----------------
  // USERS (admin)
  // ----------------
  async getUsers() {
    const { data, error } = await supabase.from("users").select("id,email,name,role");
    if (error) throw new Error(errMsg(error, "Impossible de lister les utilisateurs"));
    return data || [];
  },
  async createUser(userData) {
    // Avec Supabase Auth, la création se fait via signUp côté Auth.
    throw new Error("Créer un user se fait via 'register' (Supabase Auth).");
  },
  async updateUser(id, userData) {
    const { error } = await supabase.from("users").update(userData).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour l'utilisateur"));
    return true;
  },
  async updatePassword() {
    // à faire avec supabase.auth.updateUser({ password })
    throw new Error("Non implémenté (Supabase)");
  },
  async deleteUser(id) {
    // suppression d'utilisateur gérée côté Admin Supabase (ou via service key côté serveur)
    throw new Error("Suppression user non disponible côté client");
  },

  // ----------------
  // STATS/SETTINGS
  // ----------------
  async getStats() {
    // À implémenter si tu crées des vues/matérialisées
    return { users: 0, trees: 0 };
  },
  async getSetting(key) {
    // À implémenter si tu crées une table settings
    return null;
  },
  async setSetting(key, value) {
    // À implémenter si tu crées une table settings
    throw new Error("Non implémenté (Supabase)");
  }
};

export default API;
