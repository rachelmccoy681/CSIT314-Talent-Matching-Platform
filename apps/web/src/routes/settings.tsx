import { useAuth } from "@/lib/auth";
import { supabase } from "@/utils/supabase";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function clearDemoData() {
    localStorage.removeItem("talentmatch-applications");
    localStorage.removeItem("talentmatch-local-jobs");
    localStorage.removeItem("talentmatch-messages");
    setMessage("Local demo applications, messages, and unsynced job drafts were cleared.");
  }

  async function deleteProfileData() {
    if (!user) return;
    const confirmed = window.confirm(
      "Delete your TalentMatch profile data? This removes your public profile details from the project database.",
    );
    if (!confirmed) return;

    setBusy(true);
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    await signOut();
    navigate({ to: "/sign-in" });
  }

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Account controls</p>
        <h1 className="page-title">Settings</h1>
        <p className="page-copy">
          Manage local demo data, privacy actions, and account-level preferences.
        </p>
      </div>

      <div className="settings-grid">
        <article className="panel stack">
          <div>
            <h2 className="section-title">Workspace data</h2>
            <p className="muted-text">
              Clear browser-stored demo messages, applications, and fallback job posts.
            </p>
          </div>
          <button className="button-secondary w-fit" type="button" onClick={clearDemoData}>
            Clear local demo data
          </button>
        </article>

        <article className="panel stack">
          <div>
            <h2 className="section-title">Privacy</h2>
            <p className="muted-text">
              Remove your profile record from the Supabase project. Authentication
              deletion still needs to be completed in Supabase Auth by the project owner.
            </p>
          </div>
          <button className="button-danger w-fit" disabled={busy} type="button" onClick={deleteProfileData}>
            {busy ? "Deleting..." : "Delete profile data"}
          </button>
        </article>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
    </section>
  );
}
