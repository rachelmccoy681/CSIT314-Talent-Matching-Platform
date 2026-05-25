import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginPrompt] = useState(() => window.sessionStorage.getItem("talentmatch-login-prompt"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    window.sessionStorage.removeItem("talentmatch-login-prompt");
    navigate({ to: "/" });
  }

  return (
    <section className="auth-layout">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="page-title">Sign in to your TalentMatch workspace</h1>
        <p className="page-copy">
          {loginPrompt === "employer"
            ? "Sign in with an employer account to post jobs, manage listings, contact candidates, and review hiring stages."
            : loginPrompt === "candidate"
              ? "Sign in with a candidate account to browse jobs, apply for roles, and track your applications."
              : "Browse jobs, tune your candidate profile, check matches, and manage employer postings from one place."}
        </p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="button-primary w-full" disabled={busy} type="submit">
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <p className="muted-text">
          New candidate? <Link to="/sign-up">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
