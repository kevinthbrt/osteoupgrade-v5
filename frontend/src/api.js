import { supabase } from "./supabaseClient";
const msg = (e, f="Erreur") => e?.message || e?.error_description || f;

const API = {
  async login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(msg(error, "Échec de connexion"));

  const u = data.user;

  // on s'assure que la ligne existe
  await supabase
    .from("users")
    .upsert({ id: u.id, email: u.email }, { onConflict: "id" });

  // on lit le vrai role / nom depuis la table users
  const { data: row } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", u.id)
    .single();

  return {
    id: u.id,
    email: u.email,
    name: row?.name || u.user_metadata?.name || u.email,
    status: row?.role || "user",
  };
},

  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin, // redirection après clic du lien
      },
    });
    if (error) throw new Error(error.message || "Échec de l'inscription");
    // data.session === null si la confirmation d’email est requise
    return { user: data.user, session: data.session };
  },
  async logout() { const { error } = await supabase.auth.signOut(); if (error) throw new Error(msg(error)); },
  async me() {
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Pas de session");
    const { data: row } = await supabase.from("users").select("*").eq("id", user.id).single();
    return { id: user.id, email: user.email, name: row?.name || user.user_metadata?.name || user.email, status: row?.role || "user" };
  },
  async getTrees() {
    const { data, error } = await supabase.from("trees").select("id,title,updated_at").order("updated_at", { ascending:false });
    if (error) { console.warn("trees:", error.message); return []; }
    return data || [];
  },
  async getTree(id) { const { data, error } = await supabase.from("trees").select("*").eq("id", id).single(); if (error) throw new Error(msg(error)); return data; },
  async createTree(t) { const { error } = await supabase.from("trees").insert({ title: t.title, data: t.data || {} }); if (error) throw new Error(msg(error)); },
  async updateTree(id, t){ const { error } = await supabase.from("trees").update({ title:t.title, data:t.data||{} }).eq("id", id); if (error) throw new Error(msg(error)); },
  async deleteTree(id){ const { error }=await supabase.from("trees").delete().eq("id", id); if (error) throw new Error(msg(error)); },

  // Placeholders
  async getTests(){ return []; }, async getTest(){ return null; },
  async createTest(){ throw new Error("Non implémenté (Supabase)"); },
  async updateTest(){ throw new Error("Non implémenté (Supabase)"); },
  async deleteTest(){ throw new Error("Non implémenté (Supabase)"); },
  async saveDiagnostic(){ throw new Error("Non implémenté (Supabase)"); },
  async getDiagnostics(){ return []; },
  downloadPdf(){ alert("Export PDF non implémenté."); },

  async getUsers(){ const { data, error } = await supabase.from("users").select("id,email,name,role"); if (error) throw new Error(msg(error)); return data||[]; },
  async createUser(){ throw new Error("Créer un user se fait via 'register'"); },
  async updateUser(id,d){ const { error }=await supabase.from("users").update(d).eq("id",id); if (error) throw new Error(msg(error)); },
  async updatePassword(){ throw new Error("Non implémenté (Supabase)"); },
  async deleteUser(){ throw new Error("Suppression user côté client non dispo"); },
  async getStats(){ return { users:0, trees:0 }; },
  async getSetting(){ return null; },
  async setSetting(){ throw new Error("Non implémenté (Supabase)"); }
};
export default API;
