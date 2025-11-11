import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Trees from "./Trees";

export default function OrgSelect() {
  const [orgs, setOrgs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("users").upsert({ id: user.id, email: user.email }, { onConflict: "id" });

      const { data: ms } = await supabase
        .from("memberships")
        .select("organization_id, role")
        .eq("user_id", user.id);

      if (ms?.length) {
        const ids = ms.map(m => m.organization_id);
        const { data: orgsData } = await supabase
          .from("organizations")
          .select("*")
          .in("id", ids);
        setOrgs(orgsData || []);
      }
      setLoading(false);
    })();
  }, []);

  async function createOrg(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { data: org, error: e1 } = await supabase
      .from("organizations")
      .insert({ name })
      .select()
      .single();
    if (e1) return alert(e1.message);

    const { error: e2 } = await supabase
      .from("memberships")
      .insert({ user_id: user.id, organization_id: org.id, role: "owner" });
    if (e2) return alert(e2.message);

    setOrgs([...(orgs||[]), org]);
  }

  if (loading) return <p>Chargement…</p>;
  if (selected) return <Trees organizationId={selected} />;

  return (
    <div style={{ display:"grid", gap:12, maxWidth:480 }}>
      <h2>Choisir une organisation</h2>
      {orgs?.length ? (
        <ul>
          {orgs.map(o => (
            <li key={o.id}>
              <button onClick={()=>setSelected(o.id)}>{o.name}</button>
            </li>
          ))}
        </ul>
      ) : <p>Aucune organisation pour l’instant.</p>}

      <form onSubmit={createOrg} style={{ display:"grid", gap:8, marginTop:16 }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom de l'organisation" />
        <button type="submit">Créer une organisation</button>
      </form>

      <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 24 }}>
        Se déconnecter
      </button>
    </div>
  );
}
