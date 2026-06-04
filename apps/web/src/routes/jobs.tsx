import { useAuth } from "@/lib/auth";
import {
  fuzzyIncludes,
  fuzzyScore,
  getJobId,
  isPremium,
  listJobs,
  updateJobAlertPreferences,
  type JobPosting,
} from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/jobs")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: listJobs,
  component: JobsPage,
});

function JobsPage() {
  const jobs = Route.useLoaderData();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEmployer = getAccountType(user, profile) === "employer";
  const userId = user?.id;
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [category, setCategory] = useState("all");
  const [experience, setExperience] = useState("all");
  const [owner, setOwner] = useState<"all" | "mine" | "others">("all");
  const [savedJobs, setSavedJobs] = useState<string[]>(() => getSavedJobs(user?.id));
  const [alertMessage, setAlertMessage] = useState("");
  const premium = isPremium(profile);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(jobs.map((job) => job.category ?? inferCategory(job))))],
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
      const descriptionText = [
        job.description,
        job.required_skills,
        job.required_education_level,
        job.job_title,
        job.company_information,
        job.job_location,
      ]
        .join(" ");

      const matchesQuery = fuzzyIncludes(descriptionText, query);
      const matchesMode = mode === "all" || job.work_mode.toLowerCase() === mode;
      const matchesCategory = category === "all" || (job.category ?? inferCategory(job)) === category;
      const matchesExperience =
        experience === "all" ||
        (experience === "entry" && Number(job.years_of_experience) <= 1) ||
        (experience === "mid" && Number(job.years_of_experience) >= 2 && Number(job.years_of_experience) <= 3) ||
        (experience === "senior" && Number(job.years_of_experience) >= 4);
      const owned = Boolean(userId && job.employer_id === userId);
      const matchesOwner =
        !isEmployer ||
        owner === "all" ||
        (owner === "mine" && owned) ||
        (owner === "others" && !owned);

      return matchesQuery && matchesMode && matchesCategory && matchesExperience && matchesOwner;
    })
      .sort((a, b) => fuzzyScore(jobSearchText(b), query) - fuzzyScore(jobSearchText(a), query));
  }, [category, experience, isEmployer, jobs, mode, owner, query, userId]);

  const alertMatches = useMemo(() => {
    if (!premium || isEmployer) return [];

    const alertQuery = profile?.job_alert_query || "";
    const alertCategory = profile?.job_alert_category || "all";
    const alertMode = profile?.job_alert_mode || "all";
    const alertExperience = profile?.job_alert_experience || "all";

    return jobs
      .filter((job) => {
        const matchesQuery = fuzzyIncludes(jobSearchText(job), alertQuery);
        const matchesCategory = alertCategory === "all" || (job.category ?? inferCategory(job)) === alertCategory;
        const matchesMode = alertMode === "all" || job.work_mode.toLowerCase() === alertMode;
        const matchesExperience =
          alertExperience === "all" ||
          (alertExperience === "entry" && Number(job.years_of_experience) <= 1) ||
          (alertExperience === "mid" && Number(job.years_of_experience) >= 2 && Number(job.years_of_experience) <= 3) ||
          (alertExperience === "senior" && Number(job.years_of_experience) >= 4);

        return matchesQuery && matchesCategory && matchesMode && matchesExperience;
      })
      .slice(0, 5);
  }, [isEmployer, jobs, premium, profile?.job_alert_category, profile?.job_alert_experience, profile?.job_alert_mode, profile?.job_alert_query]);

  if (location.pathname !== "/jobs") return <Outlet />;

  async function saveAlertFilters() {
    if (!userId || !premium) return;

    await updateJobAlertPreferences(userId, {
      query,
      category,
      mode,
      experience,
    });
    setAlertMessage("Premium alert filter saved.");
  }

  function toggleSavedJob(jobId: string) {
    const nextSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter((item) => item !== jobId)
      : [...savedJobs, jobId];

    setSavedJobs(nextSavedJobs);
    localStorage.setItem(savedJobsStorageKey(userId), JSON.stringify(nextSavedJobs));
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Opportunities</p>
          <h1 className="page-title">Professional job listings</h1>
          <p className="page-copy">
            Search by job description, filter by category, and open a listing to apply.
          </p>
        </div>
        {isEmployer ? (
          <Link className="button-primary" to="/employer">
            Post a job
          </Link>
        ) : null}
      </div>

      <div className="toolbar filters-toolbar">
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search job descriptions, skills, company, or location"
        />
        <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All categories" : item}
            </option>
          ))}
        </select>
        <select className="input" value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="all">All work modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="on-site">On-site</option>
        </select>
        <select className="input" value={experience} onChange={(event) => setExperience(event.target.value)}>
          <option value="all">All experience levels</option>
          <option value="entry">Entry level</option>
          <option value="mid">2-3 years</option>
          <option value="senior">4+ years</option>
        </select>
        {isEmployer ? (
          <select className="input" value={owner} onChange={(event) => setOwner(event.target.value as "all" | "mine" | "others")}>
            <option value="all">All owners</option>
            <option value="mine">My listings</option>
            <option value="others">Other listings</option>
          </select>
        ) : null}
      </div>

      {!isEmployer ? (
        premium ? (
          <section className="premium-banner stack">
            <div className="section-header">
              <div>
                <p className="stat-label">Premium alerts</p>
                <h2 className="section-title">Jobs matching your saved filter</h2>
              </div>
              <button className="button-secondary" type="button" onClick={saveAlertFilters}>
                Save current filters
              </button>
            </div>
            {alertMatches.length ? (
              <div className="card-grid">
                {alertMatches.map((job) => (
                  <button
                    className="mini-stat text-left"
                    key={getJobId(job)}
                    type="button"
                    onClick={() => navigate({ to: "/jobs/$jobId", params: { jobId: getJobId(job) } })}
                  >
                    <p className="stat-label">{job.company_information}</p>
                    <p className="font-black text-slate-950">{job.job_title}</p>
                    <p className="muted-text">{job.job_location}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted-text">Save a filter to start seeing premium job alerts here.</p>
            )}
            {alertMessage ? <p className="success-text">{alertMessage}</p> : null}
          </section>
        ) : (
          <section className="premium-locked">
            <p className="stat-label">Premium feature</p>
            <p className="muted-text">
              Upgrade from the Membership page to save jobs and receive alerts for jobs matching your filters.
            </p>
          </section>
        )
      ) : null}

      <div className="card-grid">
        {filteredJobs.map((job: JobPosting) => (
          <article className="job-card" key={getJobId(job)}>
            <div className="job-card-topline">
              <p className="stat-label">{job.work_mode}</p>
              <span className="pill">{job.category ?? inferCategory(job)}</span>
            </div>
            <h2>{job.job_title}</h2>
            <p>{job.company_information}</p>
            <p className="muted-text">
              {job.job_location} - {job.years_of_experience}+ years -{" "}
              {job.salary_range ?? "Salary disclosed later"}
            </p>
            <p className="tag-list">{job.required_skills}</p>
            <button
              className="button-secondary mt-auto"
              type="button"
              onClick={() => navigate({ to: "/jobs/$jobId", params: { jobId: getJobId(job) } })}
            >
              View listing
            </button>
            {!isEmployer && premium ? (
              <button className="button-secondary" type="button" onClick={() => toggleSavedJob(getJobId(job))}>
                {savedJobs.includes(getJobId(job)) ? "Saved" : "Save job"}
              </button>
            ) : null}
            {isEmployer && userId && job.employer_id === userId ? (
              <Link className="button-primary" to="/hiring">
                Open hiring
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      {!filteredJobs.length ? <p className="panel muted-text">No matching jobs found.</p> : null}
    </section>
  );
}

function inferCategory(job: JobPosting) {
  const text = `${job.job_title} ${job.required_skills}`.toLowerCase();
  if (text.includes("data") || text.includes("analytics") || text.includes("sql")) return "Data & Analytics";
  if (text.includes("security") || text.includes("cyber")) return "Cyber Security";
  if (text.includes("support") || text.includes("systems") || text.includes("network")) return "IT Operations";
  if (text.includes("ux") || text.includes("content") || text.includes("writer")) return "Design & Content";
  if (text.includes("project") || text.includes("scrum") || text.includes("product")) return "Product & Delivery";
  return "Software Engineering";
}

function jobSearchText(job: JobPosting) {
  return [
    job.description,
    job.required_skills,
    job.required_education_level,
    job.job_title,
    job.company_information,
    job.job_location,
    job.category,
    job.work_mode,
  ].join(" ");
}

function savedJobsStorageKey(userId?: string) {
  return `talentmatch-saved-jobs-${userId || "guest"}`;
}

function getSavedJobs(userId?: string) {
  const stored = localStorage.getItem(savedJobsStorageKey(userId));
  return stored ? (JSON.parse(stored) as string[]) : [];
}
