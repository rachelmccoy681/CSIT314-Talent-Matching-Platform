import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: SignUpPage,
});

const countryCodes = ["+61", "+64", "+1", "+44", "+91", "+86", "+65"];

const emptyForm = {
  email: "",
  password: "",
  account_type: "candidate",
  full_name: "",
  phone_country_code: "+61",
  phone_number: "",
  education: "",
  major_field_of_study: "",
  years_of_experience: "",
  work_experience: "",
  skills: "",
  preferred_working_mode: "Hybrid",
  preferred_location: "",
};

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const contact_information = `${form.phone_country_code} ${form.phone_number}`.trim();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          account_type: form.account_type,
          role: form.account_type,
          full_name: form.full_name,
          contact_information,
          education: form.education,
          major_field_of_study: form.major_field_of_study,
          years_of_experience: form.years_of_experience,
          work_experience: form.work_experience,
          skills: form.skills,
          preferred_working_mode: form.preferred_working_mode,
          preferred_location: form.preferred_location,
        },
      },
    });

    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    navigate({ to: "/" });
  }

  return (
    <section className="auth-layout">
      <div className="brand-panel">
        <p className="eyebrow">Talent marketplace</p>
        <h1 className="page-title">Create your professional TalentMatch account</h1>
        <p className="page-copy">
          Candidates can apply for roles and receive match recommendations. Employers
          can post openings and review the job market from the same platform.
        </p>
      </div>

      <form className="form-panel elevated" onSubmit={handleSubmit}>
        <div className="segmented-control" aria-label="Account type">
          <button
            className={form.account_type === "candidate" ? "segment-active" : "segment"}
            type="button"
            onClick={() => updateField("account_type", "candidate")}
          >
            Candidate
          </button>
          <button
            className={form.account_type === "employer" ? "segment-active" : "segment"}
            type="button"
            onClick={() => updateField("account_type", "employer")}
          >
            Employer
          </button>
        </div>

        <div className="form-grid">
          <Field label="Email address" value={form.email} onChange={(value) => updateField("email", value)} type="email" required />
          <Field label="Password" value={form.password} onChange={(value) => updateField("password", value)} type="password" required />
          <Field label={form.account_type === "employer" ? "Contact name" : "Full name"} value={form.full_name} onChange={(value) => updateField("full_name", value)} required />
          <PhoneField
            countryCode={form.phone_country_code}
            phoneNumber={form.phone_number}
            onCountryChange={(value) => updateField("phone_country_code", value)}
            onPhoneChange={(value) => updateField("phone_number", value)}
          />
          <Field label="Education level" value={form.education} onChange={(value) => updateField("education", value)} placeholder="Bachelor of Computer Science" />
          <Field label="Field of study" value={form.major_field_of_study} onChange={(value) => updateField("major_field_of_study", value)} placeholder="Software engineering" />
          <Field label="Years of experience" value={form.years_of_experience} onChange={(value) => updateField("years_of_experience", value)} type="number" />
          <SelectField label="Preferred work mode" value={form.preferred_working_mode} onChange={(value) => updateField("preferred_working_mode", value)} options={["Remote", "Hybrid", "On-site"]} />
          <Field label="Preferred location" value={form.preferred_location} onChange={(value) => updateField("preferred_location", value)} placeholder="Sydney, NSW" />
        </div>

        <label className="field-label" htmlFor="skills">
          Skills
        </label>
        <textarea
          id="skills"
          className="input min-h-24"
          value={form.skills}
          onChange={(event) => updateField("skills", event.target.value)}
          placeholder="React, SQL, communication, data analysis"
        />

        <label className="field-label" htmlFor="work_experience">
          Work experience summary
        </label>
        <textarea
          id="work_experience"
          className="input min-h-24"
          value={form.work_experience}
          onChange={(event) => updateField("work_experience", event.target.value)}
          placeholder="Briefly describe your most relevant work, projects, or placements."
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="button-primary w-full" disabled={busy} type="submit">
          {busy ? "Creating account..." : "Create account"}
        </button>

        <p className="muted-text">
          Already registered? <Link to="/sign-in">Sign in</Link>
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}

function PhoneField({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
}: {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="field-label" htmlFor="phone-number">
        Phone number
      </label>
      <div className="grid grid-cols-[6rem_1fr] gap-2">
        <select className="input" value={countryCode} onChange={(event) => onCountryChange(event.target.value)}>
          {countryCodes.map((code) => (
            <option key={code}>{code}</option>
          ))}
        </select>
        <input
          id="phone-number"
          className="input"
          inputMode="tel"
          value={phoneNumber}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="412 345 678"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
