import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setErr(error.message);
    else setSent(true);
  }

  if (sent) {
    return <p>Un lien de connexion a été envoyé à <b>{email}</b>. Consulte ta boîte mail.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:"grid", gap:8, maxWidth:320 }}>
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
      />
      <button type="submit">Recevoir le lien</button>
      {err && <p style={{ color:"crimson" }}>{err}</p>}
    </form>
  );
}
