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
// petit utilitaire pour récupérer rapidement l'ID user courant
async function currentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ---------- ADAPTATEURS TREES (UI <-> DB) ----------
function toUiTree(row) {
  const d = row?.data || {};
  return {
    id: row.id,
    name: row.title || d.name || "",
    icon: d.icon || "🦴",
    description: d.description || "",
    nodes: Array.isArray(d.nodes) ? d.nodes : [],
    updated_at: row.updated_at ?? null,
  };
}
function toDbTreePayload(tree, created_by = null) {
  return {
    title: tree.name,
    data: {
      icon: tree.icon || "🦴",
      description: tree.description || "",
      nodes: Array.isArray(tree.nodes) ? tree.nodes : [],
    },
    ...(created_by ? { created_by } : {}),
  };
}

const API = {
  // -------------------- AUTH --------------------
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(errMsg(error, "Échec de connexion"));
    // upsert dans public.users (garantie que le role reste en base)
    const u = data.user;
    await supabase.from("users").upsert({ id: u.id, email: u.email }, { onConflict: "id" });
    // lecture du role
    const { data: userRow } = await supabase.from("users").select("name,role").eq("id", u.id).single();
    return {
      id: u.id,
      email: u.email,
      name: userRow?.name || u.user_metadata?.name || u.email,
      status: userRow?.role || "user",
    };
  },

  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    if (error) throw new Error(errMsg(error, "Échec de l'inscription"));
    return true; // email de confirmation selon ta config Supabase
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(errMsg(error, "Échec de déconnexion"));
  },

  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Pas de session");
    const { data: row, error } = await supabase
      .from("users")
      .select("email,name,role")
      .eq("id", user.id)
      .single();
    if (error && error.code !== "PGRST116") throw error; // ignore not found
    return {
      id: user.id,
      email: row?.email || user.email,
      name: row?.name || user.user_metadata?.name || user.email,
      status: row?.role || "user",
    };
  },

  // -------------------- TREES --------------------
  async getTrees() {
    const { data, error } = await supabase
      .from("trees")
      .select("id,title,data,updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(errMsg(error, "Impossible de lister les arbres"));
    return (data || []).map(toUiTree);
  },

  async getTree(id) {
    const { data, error } = await supabase
      .from("trees")
      .select("id,title,data,updated_at")
      .eq("id", id)
      .single();
    if (error) throw new Error(errMsg(error, "Impossible de charger l'arbre"));
    return toUiTree(data);
  },

  async createTree(tree) {
    const uid = await currentUserId();
    const payload = toDbTreePayload(tree, uid);
    const { error } = await supabase.from("trees").insert(payload);
    if (error) throw new Error(errMsg(error, "Impossible de créer l'arbre"));
    return true;
  },

  async updateTree(id, tree) {
    const payload = toDbTreePayload(tree);
    const { error } = await supabase.from("trees").update(payload).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour l'arbre"));
    return true;
  },

  async deleteTree(id) {
    const { error } = await supabase.from("trees").delete().eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de supprimer l'arbre"));
    return true;
  },

  // -------------------- TESTS --------------------
  async getTests() {
    const { data, error } = await supabase
      .from("tests")
      .select("id,name,description,region,sensitivity,specificity,video_url,created_at,updated_at")
      .order("name");
    if (error) throw new Error(errMsg(error, "Impossible de lister les tests"));
    return data || [];
  },

  async createTest(t) {
    const uid = await currentUserId();
    const payload = {
      name: t.name,
      description: t.description || "",
      region: t.region || null,
      sensitivity: t.sensitivity ?? null,
      specificity: t.specificity ?? null,
      video_url: t.video_url || null,
      created_by: uid,
    };
    const { error } = await supabase.from("tests").insert(payload);
    if (error) throw new Error(errMsg(error, "Impossible de créer le test"));
    return true;
  },

  async updateTest(id, t) {
    const payload = {
      name: t.name,
      description: t.description || "",
      region: t.region || null,
      sensitivity: t.sensitivity ?? null,
      specificity: t.specificity ?? null,
      video_url: t.video_url || null,
    };
    const { error } = await supabase.from("tests").update(payload).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour le test"));
    return true;
  },

  async deleteTest(id) {
    const { error } = await supabase.from("tests").delete().eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de supprimer le test"));
    return true;
  },

  // -------------------- USERS (Admin) --------------------
  async getUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id,email,name,role")
      .order("email");
    if (error) throw new Error(errMsg(error, "Impossible de lister les utilisateurs"));
    return data || [];
  },

  async updateUser(id, userData) {
    const { error } = await supabase.from("users").update(userData).eq("id", id);
    if (error) throw new Error(errMsg(error, "Impossible de mettre à jour l'utilisateur"));
    return true;
  },

  // -------------------- STATS --------------------
  async getStats() {
    const [u, t, te] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("trees").select("*", { count: "exact", head: true }),
      supabase.from("tests").select("*", { count: "exact", head: true }),
    ]);
    return {
      totalUsers: u.count ?? 0,
      totalTrees: t.count ?? 0,
      totalTests: te.count ?? 0,
    };
  },

  // -------------------- SETTINGS (optionnel) --------------------
  async getSetting(key) {
    const { data, error } = await supabase.from("settings").select("value").eq("key", key).single();
    if (error) return null;
    return data?.value ?? null;
  },
  async setSetting(key, value) {
    const { error } = await supabase.from("settings").upsert({ key, value });
    if (error) throw new Error(errMsg(error, "Impossible d'enregistrer le paramètre"));
    return true;
  },
};

export default API;
