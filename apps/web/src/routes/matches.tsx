import { useAuth } from "@/lib/auth";
import { getJobId, listJobs, scoreJobMatch } from "@/lib/data";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/matches")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: listJobs,
  component: MatchesPage,
});

function MatchesPage() {
  const jobs = Route.useLoaderData();
  const { profile } = useAuth();
  const matches = jobs
    .map((job) => ({ job, score: scoreJobMatch(job, profile) }))
    .sort((a, b) => b.score - a.score);

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h1 className="page-title">Your job matches</h1>
          <p className="page-copy">
            Matches are ranked using your skills, preferred work mode, location,
            and years of experience.
          </p>
        </div>
        <Link className="button-secondary" to="/profile">
          Improve profile
        </Link>
      </div>

      <div className="card-grid">
        {matches.map(({ job, score }) => (
          <Link className="job-card" key={getJobId(job)} to="/jobs/$jobId" params={{ jobId: getJobId(job) }}>
            <p className="stat-label">{score}% match</p>
            <h2>{job.job_title}</h2>
            <p>{job.company_information}</p>
            <p className="muted-text">
              {job.work_mode} - {job.job_location} - {job.salary_range ?? "Salary disclosed later"}
            </p>
            <span className="button-secondary mt-auto">View and apply</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
