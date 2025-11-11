import { supabase } from "./supabaseClient";

function errMsg(e, fallback = "Erreur") {
  return e?.message || e?.error_description || fallback;
}

const API = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(errMsg(error, "Échec de connexion"));
    const u = data.user;
    await supabase.from("users").upsert({ id: u.id, email: u.email }, { onConflict: "id" });
    return { id: u.id, email: u.email, name: u.user_metadata?.name || u.email, status: "user" };
  },
  async register(email, password, name) {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw new Error(errMsg(error, "Échec de l'inscription"));
    return true;
  },
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(errMsg(error, "Échec de déconnexion"));
  },
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Pas de session");
    const { data: userRow } = await supabase.from("users").select("*").eq("id", user.id).single();
    return {
      id: user.id,
      email: user.email,
      name: userRow?.name || user.user_metadata?.name || user.email,
      status: userRow?.role || "user"
    };
  },

  async getTrees() {
    const { data, error } = await supabase.from("trees")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    if (error) { console.warn("trees list error:", error.message); return []; }
    return data || [];
  },
  async getTree(id) {
    const { data, error } = await supabase.from("trees").select("*").eq("id", id).single();
    if (error) throw new Error(errMsg(error, "Impossible de charger l'arbre"));
    return data;
  },
  async createTree(tree) {
    const { error } = await supabase.from("trees").insert({ title: tree.title, data: tree.data || {} });
    if (error) throw new Error(errMsg(error, "Impossible de créer l'arbre"));
    return true;
  },
  async updateTree(id, tree) {
    const { error } = await supabase.from("trees").update({ title: tree.title, data: tree.data || {} }).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour l'arbre"));
    return true;
  },
  async deleteTree(id) {
    const { error } = await supabase.from("trees").delete().eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de supprimer l'arbre"));
    return true;
  },

  async getTests() { return []; },
  async getTest() { return null; },
  async createTest() { throw new Error("Non implémenté (Supabase)"); },
  async updateTest() { throw new Error("Non implémenté (Supabase)"); },
  async deleteTest() { throw new Error("Non implémenté (Supabase)"); },

  async saveDiagnostic() { throw new Error("Non implémenté (Supabase)"); },
  async getDiagnostics() { return []; },
  downloadPdf() { alert("Export PDF non implémenté."); },

  async getUsers() {
    const { data, error } = await supabase.from("users").select("id,email,name,role");
    if (error) throw new Error(errMsg(error, "Impossible de lister les utilisateurs"));
    return data || [];
  },
  async createUser() { throw new Error("Créer un user se fait via 'register' (Supabase Auth)."); },
  async updateUser(id, userData) {
    const { error } = await supabase.from("users").update(userData).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour l'utilisateur"));
    return true;
  },
  async updatePassword() { throw new Error("Non implémenté (Supabase)"); },
  async deleteUser() { throw new Error("Suppression user non disponible côté client"); },

  async getStats() { return { users: 0, trees: 0 }; },
  async getSetting() { return null; },
  async setSetting() { throw new Error("Non implémenté (Supabase)"); }
};

export default API;
