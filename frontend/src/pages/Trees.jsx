import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Trees({ organizationId }) {
  const [trees, setTrees] = useState([]);
  const [title, setTitle] = useState("");
  const [json, setJson] = useState("{\"nodes\": []}");
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("trees")
      .select("id,title,updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });
    if (!error) setTrees(data || []);
  }

  useEffect(() => { load(); }, [organizationId]);

  async function createTree(e) {
    e.preventDefault();
    setError("");
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      return setError("JSON invalide");
    }

    const { error } = await supabase
      .from("trees")
      .insert({ organization_id: organizationId, title, data });

    if (error) setError(error.message);
    else {
      setTitle("");
      await load();
    }
  }

  return (
    <div style={{ display:"grid", gap:12, maxWidth:720 }}>
      <h2>Arbres ({trees.length})</h2>
      <ul>
        {trees.map(t => (
          <li key={t.id}>
            {t.title} — {new Date(t.updated_at).toLocaleString()}
          </li>
        ))}
      </ul>

      <h3>Créer un arbre</h3>
      <form onSubmit={createTree} style={{ display:"grid", gap:8 }}>
        <input
          value={title}
          onChange={e=>setTitle(e.target.value)}
          placeholder="Titre"
          required
        />
        <textarea rows={6} value={json} onChange={e=>setJson(e.target.value)} />
        {!!error && <p style={{ color:"crimson" }}>{error}</p>}
        <button>Créer</button>
      </form>
    </div>
  );
}
