import { useAuth } from "@/lib/auth";
import { isPremium, updateMembership } from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/membership")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  component: MembershipPage,
});

function MembershipPage() {
  const { user, profile, refreshProfile } = useAuth();
  const accountType = getAccountType(user, profile);
  const premium = isPremium(profile);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });

  function updateCard(field: keyof typeof card, value: string) {
    setCard((current) => ({ ...current, [field]: value }));
  }

  async function setPlan(tier: "free" | "premium") {
    if (!user) return;
    setBusy(true);
    setMessage("");

    try {
      await updateMembership(user.id, tier);
      await refreshProfile();
      setMessage(tier === "premium" ? "Premium membership activated." : "Membership changed back to Free.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update membership.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cardDigits = card.number.replace(/\D/g, "");
    const cvcDigits = card.cvc.replace(/\D/g, "");

    if (!card.name.trim()) {
      setMessage("Name on card is required.");
      return;
    }

    if (cardDigits.length !== 16) {
      setMessage("Card number must be 16 digits.");
      return;
    }

    if (!isValidExpiry(card.expiry)) {
      setMessage("Expiry must be in MM/YY format.");
      return;
    }

    if (cvcDigits.length !== 3) {
      setMessage("CVC must be 3 digits.");
      return;
    }

    await setPlan("premium");
    setShowCheckout(false);
  }

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Membership</p>
        <h1 className="page-title">{premium ? "Premium is active" : "Upgrade Talent Match"}</h1>
        <p className="page-copy">
          Unlock extra tools based on whether you are using Talent Match as a candidate or employer.
        </p>
      </div>

      <div className="membership-grid">
        <article className="membership-card">
          <p className="stat-label">Free</p>
          <h2>Basic access</h2>
          <p className="muted-text">
            Core job search, applications, profiles, messages, and basic matching.
          </p>
          <FeatureList
            items={
              accountType === "employer"
                ? ["Post jobs", "Review applicants", "Basic candidate ranking", "Message applicants"]
                : ["Browse jobs", "Apply for roles", "Basic match score", "Message employers"]
            }
          />
          <button className="button-secondary w-fit" disabled={busy || !premium} type="button" onClick={() => setPlan("free")}>
            Current free plan
          </button>
        </article>

        <article className="membership-card membership-card-premium">
          <p className="stat-label">Premium</p>
          <h2>{accountType === "employer" ? "Employer growth" : "Candidate advantage"}</h2>
          <p className="muted-text">
            Simulated upgrade for the project. This unlocks premium features immediately.
          </p>
          <FeatureList
            items={
              accountType === "employer"
                ? [
                    "Advanced candidate filters",
                    "Contact candidates directly",
                    "Featured job badges",
                    "Pipeline and applicant analytics",
                    "Export-ready candidate shortlists",
                  ]
                : [
                    "Save favourite jobs",
                    "Detailed match breakdowns",
                    "Priority visibility badge",
                    "Premium job alerts from saved filters",
                    "Application status alert features",
                  ]
            }
          />
          <button className="button-primary w-fit" disabled={busy || premium} type="button" onClick={() => setShowCheckout(true)}>
            {premium ? "Premium active" : "Upgrade to Premium"}
          </button>
        </article>
      </div>

      {showCheckout && !premium ? (
        <form className="checkout-panel stack" onSubmit={handleCheckout}>
          <div>
            <p className="stat-label">Fake checkout</p>
            <h2 className="section-title">Enter card details</h2>
            <p className="muted-text">This is only for the project demo. It will not charge anything.</p>
          </div>
          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="card-name">
                Name on card
              </label>
              <input
                id="card-name"
                className="input"
                value={card.name}
                onChange={(event) => updateCard("name", event.target.value)}
                placeholder="Alex Demo"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="card-number">
                Card number
              </label>
              <input
                id="card-number"
                className="input"
                inputMode="numeric"
                value={card.number}
                onChange={(event) => updateCard("number", event.target.value)}
                placeholder="4000 1234 5678 9010"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="card-expiry">
                Expiry
              </label>
              <input
                id="card-expiry"
                className="input"
                value={card.expiry}
                onChange={(event) => updateCard("expiry", event.target.value)}
                placeholder="12/29"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="card-cvc">
                CVC
              </label>
              <input
                id="card-cvc"
                className="input"
                inputMode="numeric"
                value={card.cvc}
                onChange={(event) => updateCard("cvc", event.target.value)}
                placeholder="123"
              />
            </div>
          </div>
          <div className="button-row">
            <button className="button-primary" disabled={busy} type="submit">
              {busy ? "Activating..." : "Pay and activate premium"}
            </button>
            <button className="button-secondary" disabled={busy} type="button" onClick={() => setShowCheckout(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {message ? <p className={message.includes("Could") ? "error-text" : "success-text"}>{message}</p> : null}
    </section>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="feature-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function isValidExpiry(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  return month >= 1 && month <= 12;
}
