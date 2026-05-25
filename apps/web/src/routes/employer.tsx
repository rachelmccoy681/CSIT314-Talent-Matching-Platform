import { useAuth } from "@/lib/auth";
import { addressSuggestions, createJob, formatSalary } from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/employer")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  component: EmployerPage,
});

const emptyJob = {
  job_title: "",
  company_information: "",
  category: "Software Engineering",
  description: "",
  required_education_level: "",
  required_skills: "",
  years_of_experience: 0,
  work_mode: "Hybrid",
  job_location: "",
  salary_range: "",
  employment_type: "Full-time",
  benefits: "",
};

function EmployerPage() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const isEmployerAccount = getAccountType(user, profile) === "employer";
  const [job, setJob] = useState(emptyJob);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(field: keyof typeof emptyJob, value: string) {
    setJob((current) => ({
      ...current,
      [field]: field === "years_of_experience" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createJob({ ...job, employer_id: user?.id });
      setJob(emptyJob);
      setMessage("Job listing published. It is now available on the job board.");
    } catch (jobError) {
      setError(jobError instanceof Error ? jobError.message : "Could not create job.");
    } finally {
      setBusy(false);
    }
  }

  if (location.pathname !== "/employer") return <Outlet />;

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Employer workspace</p>
          <h1 className="page-title">Upload a job advertisement</h1>
          <p className="page-copy">
            Publish a structured job description so candidates can search it and
            the recommendation engine can rank suitable profiles.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-secondary" to="/jobs">
            View job board
          </Link>
          <Link className="button-secondary" to="/employer/listings">
            Manage listings
          </Link>
          <Link className="button-primary" to="/candidates">
            Find candidates
          </Link>
        </div>
      </div>

      {!isEmployerAccount ? (
        <div className="panel stack">
          <h2 className="section-title">Employer account required</h2>
          <p className="muted-text">
            Log out and sign in with an employer account to post and manage job advertisements.
          </p>
          <Link className="button-primary w-fit" to="/jobs">
            Browse job listings
          </Link>
        </div>
      ) : (
        <form className="form-panel elevated" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Job title" value={job.job_title} onChange={(value) => updateField("job_title", value)} />
            <Field label="Company name" value={job.company_information} onChange={(value) => updateField("company_information", value)} />
            <SelectField
              label="Job category"
              value={job.category}
              onChange={(value) => updateField("category", value)}
              options={[
                "Software Engineering",
                "Data & Analytics",
                "Cyber Security",
                "IT Operations",
                "Design & Content",
                "Product & Delivery",
              ]}
            />
            <SelectField
              label="Employment type"
              value={job.employment_type}
              onChange={(value) => updateField("employment_type", value)}
              options={["Full-time", "Part-time", "Contract", "Graduate", "Internship"]}
            />
            <Field label="Required education level" value={job.required_education_level} onChange={(value) => updateField("required_education_level", value)} />
            <Field label="Required skills" value={job.required_skills} onChange={(value) => updateField("required_skills", value)} placeholder="React, SQL, stakeholder communication" />
            <Field label="Years of experience" value={String(job.years_of_experience)} type="number" onChange={(value) => updateField("years_of_experience", value)} />
            <Field label="Job location" list="address-suggestions" value={job.job_location} onChange={(value) => updateField("job_location", value)} />
            <Field label="Salary range" value={job.salary_range} onBlur={() => updateField("salary_range", formatSalary(job.salary_range))} onChange={(value) => updateField("salary_range", value)} placeholder="$90,000 - $110,000" />
            <SelectField label="Work mode" value={job.work_mode} onChange={(value) => updateField("work_mode", value)} options={["Remote", "Hybrid", "On-site"]} />
          </div>
          <datalist id="address-suggestions">
            {addressSuggestions.map((address) => (
              <option key={address} value={address} />
            ))}
          </datalist>

          <label className="field-label" htmlFor="description">
            Full job description
          </label>
          <textarea
            id="description"
            className="input min-h-32"
            value={job.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Paste or write the job advertisement here. This text is used for candidate keyword search."
            required
          />

          <label className="field-label" htmlFor="benefits">
            Benefits and working arrangements
          </label>
          <textarea
            id="benefits"
            className="input min-h-24"
            value={job.benefits}
            onChange={(event) => updateField("benefits", event.target.value)}
            placeholder="Flexible work, training budget, mentoring, certifications..."
          />

          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          <button className="button-primary" disabled={busy} type="submit">
            {busy ? "Publishing..." : "Publish job listing"}
          </button>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  onBlur,
  list,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  onBlur?: () => void;
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
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        required
      />
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
