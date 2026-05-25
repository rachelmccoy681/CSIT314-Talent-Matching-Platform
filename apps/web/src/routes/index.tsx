import { useAuth } from "@/lib/auth";
import { getJobId, listApplications, listJobs, scoreJobMatch } from "@/lib/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { JobPosting } from "@/lib/data";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile } = useAuth();
  const accountType =
    profile?.account_type ||
    profile?.role ||
    String(user?.user_metadata?.account_type || user?.user_metadata?.role || "candidate");
  const isEmployer = accountType === "employer";
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications] = useState(() => listApplications().length);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    listJobs()
      .then(setJobs)
      .catch((jobError: Error) => setError(jobError.message));
  }, [user]);

  const bestMatches = useMemo(
    () =>
      jobs
        .map((job) => ({ job, score: scoreJobMatch(job, profile) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [jobs, profile],
  );

  if (!user) {
    return (
      <section className="hero elevated">
        <div>
          <p className="eyebrow">CSIT314 Talent Matching Platform</p>
          <h1 className="hero-title">A polished hiring platform for candidates and employers</h1>
          <p className="page-copy">
            Browse professional job listings, apply for suitable roles, maintain a
            candidate profile, and let the platform highlight strong matches.
          </p>
          <div className="button-row">
            <Link className="button-primary" to="/sign-in">
              Sign in
            </Link>
            <Link className="button-secondary" to="/sign-up">
              Create account
            </Link>
          </div>
        </div>
        <div className="hero-panel dark-panel">
          <p className="stat-label">Platform snapshot</p>
          <div className="stat-grid">
            <Stat value="30" label="Seeded job listings" />
            <Stat value="100%" label="Apply flow demo" />
            <Stat value="2" label="Account types" />
            <Stat value="Live" label="Supabase auth" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">{isEmployer ? "Employer dashboard" : "Candidate dashboard"}</p>
          <h1 className="page-title">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="page-copy">
            {isEmployer
              ? "Create job listings and review the current talent marketplace."
              : "Explore roles, apply for jobs, and keep your profile ready for accurate matching."}
          </p>
        </div>
        <Link className="button-primary" to={isEmployer ? "/employer" : "/jobs"}>
          {isEmployer ? "Post a job" : "Browse job listings"}
        </Link>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="summary-grid">
        <Summary label="Available listings" value={jobs.length} />
        <Summary label="Profile status" value={profile?.skills ? "Ready" : "Needs details"} />
        <Summary
          label={isEmployer ? "Account type" : "Applications"}
          value={isEmployer ? "Employer" : applications}
        />
      </div>

      <section className="panel stack">
        <div className="section-header">
          <h2 className="section-title">{isEmployer ? "Recent listings" : "Recommended roles"}</h2>
          <Link to="/jobs">View all</Link>
        </div>
        <div className="card-grid">
          {bestMatches.map(({ job, score }) => (
            <Link className="job-card" key={`${job.job_title}-${job.company_information}`} to="/jobs/$jobId" params={{ jobId: getJobId(job) }}>
              <p className="stat-label">{isEmployer ? job.work_mode : `${score}% match`}</p>
              <h3>{job.job_title}</h3>
              <p>{job.company_information}</p>
              <p className="muted-text">
                {job.work_mode} - {job.job_location}
              </p>
              <span className="pill">{job.salary_range ?? "Salary disclosed later"}</span>
            </Link>
          ))}
          {!bestMatches.length ? <p className="muted-text">No job postings were found yet.</p> : null}
        </div>
      </section>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
