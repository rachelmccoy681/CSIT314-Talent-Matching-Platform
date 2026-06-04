import { addressSuggestions, fileToDataUrl, updateProfile, type ProfileFormValues } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/utils/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  component: ProfilePage,
});

const countryCodes = ["+61", "+64", "+1", "+44", "+91", "+86", "+65"];

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const initialValues: ProfileFormValues = {
    full_name: String(profile?.full_name ?? ""),
    contact_information: String(profile?.contact_information ?? ""),
    education: String(profile?.education ?? ""),
    major_field_of_study: String(profile?.major_field_of_study ?? ""),
    years_of_experience: String(profile?.years_of_experience ?? ""),
    work_experience: String(profile?.work_experience ?? ""),
    skills: String(profile?.skills ?? ""),
    preferred_working_mode: String(profile?.preferred_working_mode ?? ""),
    preferred_location: String(profile?.preferred_location ?? ""),
    resume_name: String(profile?.resume_name ?? ""),
    resume_data: String(profile?.resume_data ?? ""),
    company_name: String(profile?.company_name ?? ""),
    company_website: String(profile?.company_website ?? ""),
    company_description: String(profile?.company_description ?? ""),
    company_location: String(profile?.company_location ?? ""),
  };
  const accountType =
    profile?.account_type ||
    profile?.role ||
    String(user?.user_metadata?.account_type || user?.user_metadata?.role || "candidate");

  return (
    <ProfileForm
      key={profile?.id ?? user?.id ?? "profile"}
      initialValues={initialValues}
      accountType={accountType}
      userId={user?.id}
      onSaved={refreshProfile}
    />
  );
}

function ProfileForm({
  initialValues,
  accountType,
  userId,
  onSaved,
}: {
  initialValues: ProfileFormValues;
  accountType: string;
  userId?: string;
  onSaved: () => Promise<void>;
}) {
  const parsedPhone = splitPhone(initialValues.contact_information);
  const [form, setForm] = useState({
    ...initialValues,
    phone_country_code: parsedPhone.countryCode,
    phone_number: parsedPhone.phoneNumber,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleResumeUpload(file?: File) {
    if (!file) return;
    const resumeData = await fileToDataUrl(file);
    setForm((current) => ({
      ...current,
      resume_name: file.name,
      resume_data: resumeData,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const contact_information = `${form.phone_country_code} ${form.phone_number}`.trim();
      await updateProfile(userId, { ...form, contact_information });
      await onSaved();
      setMessage("Profile updated.");
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Could not update profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">{accountType === "employer" ? "Employer details" : "Candidate details"}</p>
        <h1 className="page-title">{accountType === "employer" ? "Company profile" : "Professional profile"}</h1>
        <p className="page-copy">
          {accountType === "employer"
            ? "Keep your company information current so candidates understand who is contacting them."
            : "Keep your profile current so match scores and employer contact details stay accurate."}
        </p>
      </div>

      <form className="form-panel elevated" onSubmit={handleSubmit}>
        {accountType === "employer" ? (
          <>
            <div className="form-grid">
              <Field label="Contact name" value={form.full_name} onChange={(value) => updateField("full_name", value)} />
              <PhoneField
                countryCode={form.phone_country_code}
                phoneNumber={form.phone_number}
                onCountryChange={(value) => updateField("phone_country_code", value)}
                onPhoneChange={(value) => updateField("phone_number", value)}
              />
              <Field label="Company name" value={form.company_name ?? ""} onChange={(value) => updateField("company_name", value)} />
              <Field label="Company website" value={form.company_website ?? ""} onChange={(value) => updateField("company_website", value)} />
              <Field label="Company location" list="address-suggestions" value={form.company_location ?? ""} onChange={(value) => updateField("company_location", value)} />
            </div>
            <label className="field-label" htmlFor="company_description">
              Company description
            </label>
            <textarea
              id="company_description"
              className="input min-h-24"
              value={form.company_description ?? ""}
              onChange={(event) => updateField("company_description", event.target.value)}
            />
          </>
        ) : (
          <>
            <div className="form-grid">
              <Field label="Full name" value={form.full_name} onChange={(value) => updateField("full_name", value)} />
              <PhoneField
                countryCode={form.phone_country_code}
                phoneNumber={form.phone_number}
                onCountryChange={(value) => updateField("phone_country_code", value)}
                onPhoneChange={(value) => updateField("phone_number", value)}
              />
              <Field label="Education level" value={form.education} onChange={(value) => updateField("education", value)} />
              <Field label="Field of study" value={form.major_field_of_study} onChange={(value) => updateField("major_field_of_study", value)} />
              <Field label="Years of experience" value={form.years_of_experience} type="number" onChange={(value) => updateField("years_of_experience", value)} />
              <SelectField label="Preferred work mode" value={form.preferred_working_mode} onChange={(value) => updateField("preferred_working_mode", value)} options={["Remote", "Hybrid", "On-site"]} />
              <Field label="Preferred location" list="address-suggestions" value={form.preferred_location} onChange={(value) => updateField("preferred_location", value)} />
            </div>

            <label className="field-label" htmlFor="resume">
              Resume / CV
            </label>
            <label className="file-upload" htmlFor="resume">
              <span className="file-upload-title">Upload saved resume</span>
              <span className="file-upload-copy">
                {form.resume_name || "PDF, DOC, or DOCX"}
              </span>
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => handleResumeUpload(event.target.files?.[0])}
              />
            </label>

            <label className="field-label" htmlFor="skills">
              Skills
            </label>
            <textarea
              id="skills"
              className="input min-h-24"
              value={form.skills}
              onChange={(event) => updateField("skills", event.target.value)}
            />

            <label className="field-label" htmlFor="work_experience">
              Work experience summary
            </label>
            <textarea
              id="work_experience"
              className="input min-h-24"
              value={form.work_experience}
              onChange={(event) => updateField("work_experience", event.target.value)}
            />
          </>
        )}

        <datalist id="address-suggestions">
          {addressSuggestions.map((address) => (
            <option key={address} value={address} />
          ))}
        </datalist>

        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button className="button-primary" disabled={busy} type="submit">
          {busy ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}

function splitPhone(value: string) {
  const [countryCode, ...rest] = value.split(" ");
  return {
    countryCode: countryCodes.includes(countryCode) ? countryCode : "+61",
    phoneNumber: countryCodes.includes(countryCode) ? rest.join(" ") : value,
  };
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  list,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  list?: string;
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
        list={list}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
