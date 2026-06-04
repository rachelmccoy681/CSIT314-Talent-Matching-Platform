import { useAuth } from "@/lib/auth";
import {
  fuzzyIncludes,
  getConversationId,
  getJobId,
  isPremium,
  listCandidates,
  listJobs,
  sendMessage,
  scoreCandidateMatch,
  type CandidateProfile,
  type JobPosting,
} from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/candidates")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: async () => {
    const [jobs, candidates] = await Promise.all([listJobs(), listCandidates()]);
    return { jobs, candidates };
  },
  component: CandidatesPage,
});

function CandidatesPage() {
  const { jobs, candidates } = Route.useLoaderData();
  const { user, profile } = useAuth();
  const isEmployerAccount = getAccountType(user, profile) === "employer";
  const premium = isPremium(profile);
  const [selectedJobId, setSelectedJobId] = useState(getJobId(jobs[0]));
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [education, setEducation] = useState("all");
  const [experience, setExperience] = useState("all");
  const [workMode, setWorkMode] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  const selectedJob = jobs.find((job) => getJobId(job) === selectedJobId) ?? jobs[0];

  const rankedCandidates = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const lowerSkill = skill.toLowerCase();

    return candidates
      .filter((candidate) => {
        const haystack = [
          candidate.full_name,
          candidate.skills,
          candidate.education,
          candidate.major_field_of_study,
          candidate.work_experience,
          candidate.preferred_location,
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = fuzzyIncludes(haystack, lowerQuery);
        const matchesSkill = !lowerSkill || fuzzyIncludes(String(candidate.skills ?? ""), lowerSkill);
        const matchesEducation =
          education === "all" || String(candidate.education ?? "").toLowerCase().includes(education);
        const years = Number(candidate.years_of_experience ?? 0);
        const matchesExperience =
          experience === "all" ||
          (experience === "entry" && years <= 1) ||
          (experience === "mid" && years >= 2 && years <= 3) ||
          (experience === "senior" && years >= 4);
        const matchesMode =
          !premium ||
          workMode === "all" ||
          String(candidate.preferred_working_mode ?? "").toLowerCase() === workMode;
        const matchesLocation =
          !premium ||
          !locationFilter.trim() ||
          fuzzyIncludes(String(candidate.preferred_location ?? ""), locationFilter);

        return matchesQuery && matchesSkill && matchesEducation && matchesExperience && matchesMode && matchesLocation;
      })
      .map((candidate) => ({
        candidate,
        score: selectedJob ? scoreCandidateMatch(candidate, selectedJob) : 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [candidates, education, experience, locationFilter, premium, query, selectedJob, skill, workMode]);
  const topCandidates = rankedCandidates.slice(0, 10);

  if (!isEmployerAccount) {
    return (
      <section className="panel stack">
        <h1 className="page-title">Employer account required</h1>
        <p className="muted-text">
          Candidate ranking is part of the employer workflow. Log out and sign in
          with an employer account to access these tools.
        </p>
        <Link className="button-primary w-fit" to="/jobs">
          Browse job listings
        </Link>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Candidate discovery</p>
          <h1 className="page-title">Ranked candidate matches</h1>
          <p className="page-copy">
            Select a job posting, then search and filter candidate profiles. The
            platform recommends the Top 10 most suitable candidates.
          </p>
        </div>
        <Link className="button-primary" to="/employer">
          Upload job ad
        </Link>
      </div>

      <div className="toolbar filters-toolbar">
        <select className="input" value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
          {jobs.map((job) => (
            <option key={getJobId(job)} value={getJobId(job)}>
              {job.job_title} - {job.company_information}
            </option>
          ))}
        </select>
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, profile, location, or experience"
        />
        <input
          className="input"
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
          placeholder="Filter by skill"
        />
        <select className="input" value={education} onChange={(event) => setEducation(event.target.value)}>
          <option value="all">All education</option>
          <option value="bachelor">Bachelor</option>
          <option value="master">Master</option>
          <option value="diploma">Diploma</option>
        </select>
        <select className="input" value={experience} onChange={(event) => setExperience(event.target.value)}>
          <option value="all">All experience</option>
          <option value="entry">Entry level</option>
          <option value="mid">2-3 years</option>
          <option value="senior">4+ years</option>
        </select>
        {premium ? (
          <>
            <select className="input" value={workMode} onChange={(event) => setWorkMode(event.target.value)}>
              <option value="all">All preferred modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
            <input
              className="input"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              placeholder="Premium location filter"
            />
          </>
        ) : null}
      </div>

      {!premium ? (
        <section className="premium-locked">
          <p className="stat-label">Premium employer tools</p>
          <p className="muted-text">
            Upgrade to unlock advanced candidate filters, direct outreach, featured listings, and stronger shortlists.
          </p>
        </section>
      ) : null}

      <section className="panel stack">
        <div className="section-header">
          <h2 className="section-title">Top 10 recommended candidates</h2>
          <div className="button-row mt-0">
            {premium ? (
              <button className="button-secondary" type="button" onClick={() => exportCandidateCsv(topCandidates, selectedJob)}>
                Export CSV
              </button>
            ) : null}
            <span className="pill">{rankedCandidates.length} profiles found</span>
          </div>
        </div>
        <div className="candidate-list">
          {topCandidates.map(({ candidate, score }, index) => (
        <CandidateCard
              employerId={user?.id ?? "employer"}
              employerName={profile?.company_name || profile?.full_name || user?.email || "Employer"}
              candidate={candidate}
              job={selectedJob}
              key={candidate.id}
              premium={premium}
              rank={index + 1}
              score={score}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function exportCandidateCsv(
  rows: Array<{ candidate: CandidateProfile; score: number }>,
  job?: JobPosting,
) {
  const headers = [
    "Rank",
    "Candidate name",
    "Match score",
    "Job title",
    "Education",
    "Field of study",
    "Years of experience",
    "Preferred work mode",
    "Preferred location",
    "Skills",
  ];
  const csvRows = rows.map(({ candidate, score }, index) => [
    index + 1,
    candidate.full_name,
    `${score}%`,
    job?.job_title ?? "",
    candidate.education ?? "",
    candidate.major_field_of_study ?? "",
    candidate.years_of_experience ?? "",
    candidate.preferred_working_mode ?? "",
    candidate.preferred_location ?? "",
    candidate.skills ?? "",
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(formatCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(job?.job_title ?? "candidate-shortlist")}-shortlist.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCsvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CandidateCard({
  candidate,
  employerId,
  employerName,
  job,
  premium,
  rank,
  score,
}: {
  candidate: CandidateProfile;
  employerId: string;
  employerName: string;
  job?: JobPosting;
  premium: boolean;
  rank: number;
  score: number;
}) {
  const [contacted, setContacted] = useState(false);

  function contactCandidate() {
    sendMessage({
      application_id: getConversationId(employerId, candidate.id),
      conversation_id: getConversationId(employerId, candidate.id),
      job_id: job ? getJobId(job) : "",
      sender_id: employerId,
      sender_name: employerName,
      recipient_id: candidate.id,
      recipient_name: candidate.full_name,
      employer_id: employerId,
      employer_name: employerName,
      candidate_id: candidate.id,
      candidate_name: candidate.full_name,
      body: `Hi ${candidate.full_name}, your profile looks like a strong match for ${job?.job_title ?? "one of our roles"}. Could we discuss the next step in the hiring process?`,
    });
    setContacted(true);
  }

  return (
    <article className="candidate-card">
      <div>
        <p className="stat-label">Rank #{rank} for {job?.job_title ?? "selected job"}</p>
        <h3>
          {candidate.full_name} {premium ? <span className="pill">Premium shortlist</span> : null}
        </h3>
        <p className="muted-text">
          {candidate.education} - {candidate.major_field_of_study} -{" "}
          {candidate.years_of_experience ?? 0}+ years
        </p>
        <p>{candidate.work_experience}</p>
        <p className="tag-list">{candidate.skills}</p>
      </div>
      <aside className="candidate-score">
        <p className="stat-value">{score}%</p>
        <p className="stat-label">match</p>
        <p className="muted-text">{candidate.preferred_working_mode} - {candidate.preferred_location}</p>
        {premium ? (
          <button className={contacted ? "button-success" : "button-secondary"} type="button" onClick={contactCandidate}>
            {contacted ? "Message started" : "Contact in app"}
          </button>
        ) : (
          <p className="muted-text">Upgrade to contact candidates before they apply.</p>
        )}
      </aside>
    </article>
  );
}
