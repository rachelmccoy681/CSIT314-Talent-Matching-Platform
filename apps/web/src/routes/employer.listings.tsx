import { useAuth } from "@/lib/auth";
import {
  addressSuggestions,
  deleteJob,
  formatSalary,
  getJobId,
  listJobs,
  updateJob,
  type JobPosting,
} from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

export const Route = createFileRoute("/employer/listings")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: listJobs,
  component: EmployerListingsPage,
});

function EmployerListingsPage() {
  const loadedJobs = Route.useLoaderData();
  const { user, profile } = useAuth();
  const isEmployerAccount = getAccountType(user, profile) === "employer";
  const [jobs, setJobs] = useState(loadedJobs);
  const [filter, setFilter] = useState<"mine" | "legacy" | "others" | "all">("mine");
  const [editingId, setEditingId] = useState("");

  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const owned = isOwnedByEmployer(job, user?.id);
        const legacy = isLegacyUnassigned(job);
        if (filter === "mine") return owned;
        if (filter === "legacy") return legacy;
        if (filter === "others") return !owned;
        return true;
      }),
    [filter, jobs, user?.id],
  );

  if (!isEmployerAccount) {
    return (
      <section className="panel stack">
        <h1 className="page-title">Employer account required</h1>
        <p className="muted-text">Log out and sign in with an employer account to manage job listings.</p>
        <Link className="button-primary w-fit" to="/jobs">
          Browse jobs
        </Link>
      </section>
    );
  }

  async function removeJob(jobId: string) {
    await deleteJob(jobId);
    setJobs((current) => current.filter((job) => getJobId(job) !== jobId));
  }

  async function saveJob(jobId: string, patch: Partial<JobPosting>) {
    const currentJob = jobs.find((job) => getJobId(job) === jobId);
    const updated = await updateJob(jobId, {
      ...patch,
      employer_id: currentJob && isLegacyUnassigned(currentJob) ? user?.id : patch.employer_id,
    });
    setJobs((current) => current.map((job) => (getJobId(job) === jobId ? updated : job)));
    setEditingId("");
  }

  async function claimJob(jobId: string) {
    const updated = await updateJob(jobId, { employer_id: user?.id });
    setJobs((current) => current.map((job) => (getJobId(job) === jobId ? updated : job)));
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Employer controls</p>
          <h1 className="page-title">Manage job listings</h1>
          <p className="page-copy">
            Review all listings, edit your own advertisements, and keep other
            employers' listings read-only.
          </p>
        </div>
        <Link className="button-primary" to="/employer">
          Upload job ad
        </Link>
      </div>

      <div className="segmented-control">
        <button className={filter === "mine" ? "segment-active" : "segment"} type="button" onClick={() => setFilter("mine")}>
          My listings
        </button>
        <button className={filter === "legacy" ? "segment-active" : "segment"} type="button" onClick={() => setFilter("legacy")}>
          Unassigned
        </button>
        <button className={filter === "others" ? "segment-active" : "segment"} type="button" onClick={() => setFilter("others")}>
          Other listings
        </button>
        <button className={filter === "all" ? "segment-active" : "segment"} type="button" onClick={() => setFilter("all")}>
          All listings
        </button>
      </div>

      <div className="stack">
        {visibleJobs.map((job) =>
          editingId === getJobId(job) ? (
            <ListingEditor key={getJobId(job)} job={job} onCancel={() => setEditingId("")} onSave={saveJob} />
          ) : (
            <article className="panel stack" key={getJobId(job)}>
              <div className="section-header">
                <div>
                  <p className="stat-label">
                    {isOwnedByEmployer(job, user?.id)
                      ? "Your listing"
                      : isLegacyUnassigned(job)
                        ? "Unassigned legacy listing"
                        : "Read only"}
                  </p>
                  <h2 className="section-title">{job.job_title}</h2>
                  <p className="muted-text">
                    {job.company_information} - {job.job_location} - {job.salary_range}
                  </p>
                </div>
                <div className="button-row">
                  <Link className="button-secondary" to="/jobs/$jobId" params={{ jobId: getJobId(job) }}>
                    View
                  </Link>
                  {(isOwnedByEmployer(job, user?.id) || isLegacyUnassigned(job)) ? (
                    <Link className="button-secondary" to="/hiring">
                      Hiring
                    </Link>
                  ) : null}
                  {isLegacyUnassigned(job) ? (
                    <>
                      <button className="button-secondary" type="button" onClick={() => claimJob(getJobId(job))}>
                        Claim
                      </button>
                      <button className="button-secondary" type="button" onClick={() => setEditingId(getJobId(job))}>
                        Edit
                      </button>
                      <button className="button-danger" type="button" onClick={() => removeJob(getJobId(job))}>
                        Delete
                      </button>
                    </>
                  ) : isOwnedByEmployer(job, user?.id) ? (
                    <>
                      <button className="button-secondary" type="button" onClick={() => setEditingId(getJobId(job))}>
                        Edit
                      </button>
                      <button className="button-danger" type="button" onClick={() => removeJob(getJobId(job))}>
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function isOwnedByEmployer(job: JobPosting, userId?: string) {
  return Boolean(userId && job.employer_id === userId);
}

function isLegacyUnassigned(job: JobPosting) {
  const id = getJobId(job);
  return Boolean(!job.employer_id && !id.startsWith("seed-") && !id.startsWith("local-"));
}

function ListingEditor({
  job,
  onCancel,
  onSave,
}: {
  job: JobPosting;
  onCancel: () => void;
  onSave: (jobId: string, patch: Partial<JobPosting>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    job_title: job.job_title,
    company_information: job.company_information,
    description: job.description ?? "",
    required_skills: job.required_skills,
    required_education_level: job.required_education_level,
    job_location: job.job_location,
    salary_range: job.salary_range ?? "",
    work_mode: job.work_mode,
    years_of_experience: String(job.years_of_experience),
  });
  const [busy, setBusy] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    await onSave(getJobId(job), {
      ...form,
      salary_range: formatSalary(form.salary_range),
      years_of_experience: Number(form.years_of_experience),
    });
    setBusy(false);
  }

  return (
    <form className="form-panel elevated" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field label="Job title" value={form.job_title} onChange={(value) => updateField("job_title", value)} />
        <Field label="Company name" value={form.company_information} onChange={(value) => updateField("company_information", value)} />
        <Field label="Required skills" value={form.required_skills} onChange={(value) => updateField("required_skills", value)} />
        <Field label="Required education" value={form.required_education_level} onChange={(value) => updateField("required_education_level", value)} />
        <Field label="Location" list="address-suggestions" value={form.job_location} onChange={(value) => updateField("job_location", value)} />
        <Field label="Salary range" value={form.salary_range} onChange={(value) => updateField("salary_range", value)} onBlur={() => updateField("salary_range", formatSalary(form.salary_range))} />
      </div>
      <label className="field-label" htmlFor="edit-description">Job description</label>
      <textarea
        id="edit-description"
        className="input min-h-24"
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
      />
      <datalist id="address-suggestions">
        {addressSuggestions.map((address) => (
          <option key={address} value={address} />
        ))}
      </datalist>
      <div className="button-row">
        <button className="button-primary" disabled={busy} type="submit">
          {busy ? "Saving..." : "Save changes"}
        </button>
        <button className="button-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  list,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        list={list}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
