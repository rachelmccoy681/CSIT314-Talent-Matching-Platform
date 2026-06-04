import { useAuth } from "@/lib/auth";
import { applyToJob, fileToDataUrl, getJobId, hasApplied, isPremium, listJobs, scoreJobMatch, type JobPosting } from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/jobs/$jobId")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: async ({ params }) => {
    const jobs = await listJobs();
    const job = jobs.find((item) => getJobId(item) === params.jobId);
    if (!job) throw notFound();
    return job;
  },
  component: JobDetailPage,
});

function JobDetailPage() {
  const job = Route.useLoaderData();
  const { user, profile } = useAuth();
  const isEmployer = getAccountType(user, profile) === "employer";
  const premium = isPremium(profile);
  const jobId = getJobId(job);
  const score = scoreJobMatch(job, profile);
  const [applied, setApplied] = useState(hasApplied(jobId));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [resumeName, setResumeName] = useState(profile?.resume_name ?? "");
  const [resumeData, setResumeData] = useState(profile?.resume_data ?? "");

  async function handleResumeUpload(file?: File) {
    if (!file) return;
    setResumeName(file.name);
    setResumeData(await fileToDataUrl(file));
  }

  async function handleApply() {
    if (!resumeData) {
      setMessage("Please upload a resume or save one on your profile before applying.");
      return;
    }

    setBusy(true);
    await applyToJob({
      jobId,
      candidateId: user?.id ?? "demo-candidate",
      candidateName: profile?.full_name || user?.email || "Candidate",
      candidateEmail: user?.email,
      coverNote,
      resumeName,
      resumeData,
    });
    setApplied(true);
    setMessage("Application submitted. The employer can now review it from their candidate tools.");
    setBusy(false);
  }

  return (
    <section className="stack">
      <Link to="/jobs">Back to job listings</Link>
      <div className="detail-layout">
        <article className="panel stack">
          <p className="eyebrow">{job.company_information}</p>
          <h1 className="page-title">{job.job_title}</h1>
          <p className="page-copy">
            {job.work_mode} role based in {job.job_location}. Requires{" "}
            {job.years_of_experience}+ years of experience.
          </p>

          <div className="metadata-grid">
            <Info label="Salary" value={job.salary_range ?? "Salary disclosed later"} />
            <Info label="Employment type" value={job.employment_type ?? "Full-time"} />
            <Info label="Location" value={job.job_location} />
          </div>

          <div>
            <h2 className="section-title">Role overview</h2>
            <p>{getRoleOverview(job)}</p>
          </div>

          <div>
            <h2 className="section-title">Required education</h2>
            <p>{job.required_education_level}</p>
          </div>

          <div>
            <h2 className="section-title">Required skills</h2>
            <p>{job.required_skills}</p>
          </div>

          <div>
            <h2 className="section-title">Benefits</h2>
            <p>{job.benefits || "Structured onboarding, regular feedback, flexible team practices, and access to mentoring will be discussed during the recruitment process."}</p>
          </div>
        </article>

        <aside className="panel stack">
          <p className="stat-label">Candidate match</p>
          <p className="stat-value">{score}%</p>
          <p className="muted-text">
            Match score uses the skills, work mode, location, and experience stored
            in your profile.
          </p>
          {!isEmployer && premium ? (
            <div className="action-panel">
              <h4>Match breakdown</h4>
              <p className="muted-text">Skills: {job.required_skills}</p>
              <p className="muted-text">Preferred mode: {job.work_mode}</p>
              <p className="muted-text">Location: {job.job_location}</p>
              <p className="muted-text">Experience target: {job.years_of_experience}+ years</p>
            </div>
          ) : !isEmployer ? (
            <div className="premium-locked">
              <p className="stat-label">Premium insight</p>
              <p className="muted-text">Upgrade to see why this role matches your profile.</p>
            </div>
          ) : null}
          <Link className="button-secondary" to="/profile">
            Update profile
          </Link>
          {!isEmployer ? (
            <div className="stack">
              <label className="field-label" htmlFor="cover-note">
                Cover note
              </label>
              <textarea
                id="cover-note"
                className="input min-h-24"
                value={coverNote}
                onChange={(event) => setCoverNote(event.target.value)}
                placeholder="Briefly tell the employer why you are a good fit."
              />
              <label className="field-label" htmlFor="application-resume">
                Resume / CV
              </label>
              <label className="file-upload" htmlFor="application-resume">
                <span className="file-upload-title">Upload resume / CV</span>
                <span className="file-upload-copy">
                  {resumeName || "PDF, DOC, or DOCX"}
                </span>
                <input
                  id="application-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => handleResumeUpload(event.target.files?.[0])}
                />
              </label>
              <button className={applied ? "button-success" : "button-primary"} onClick={handleApply} disabled={applied || busy}>
                {applied ? "Application submitted" : busy ? "Submitting..." : "Apply for this job"}
              </button>
              {message ? <p className={applied ? "success-text" : "error-text"}>{message}</p> : null}
            </div>
          ) : (
            <>
              <p className="muted-text">Employer accounts can review listings and ranked candidate matches.</p>
              <Link className="button-primary" to="/candidates">
                View matching candidates
              </Link>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

function getRoleOverview(job: JobPosting) {
  if (job.description?.trim()) return job.description;

  return `In this role, you will contribute to ${job.company_information}'s ${job.category ?? "technology"} team by solving practical business problems, working with cross-functional stakeholders, and delivering reliable outcomes. The successful candidate will use ${job.required_skills} in a ${job.work_mode.toLowerCase()} environment based around ${job.job_location}. The position is suited to someone with ${job.years_of_experience}+ years of experience who can communicate clearly, learn quickly, and turn requirements into well-tested work.`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-stat">
      <p className="stat-label">{label}</p>
      <p>{value}</p>
    </div>
  );
}
