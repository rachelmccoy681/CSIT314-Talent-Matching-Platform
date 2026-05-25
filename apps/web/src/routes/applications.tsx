import { getJobId, listApplications, listJobs } from "@/lib/data";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/applications")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: async () => {
    const jobs = await listJobs();
    const applications = listApplications();
    return applications.map((application) => ({
      application,
      job: jobs.find((job) => getJobId(job) === application.job_id),
    }));
  },
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const applications = Route.useLoaderData();

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Candidate activity</p>
        <h1 className="page-title">Applications</h1>
        <p className="page-copy">
          Track the roles you have applied for and revisit each listing.
        </p>
      </div>

      {applications.length ? (
        <div className="card-grid">
          {applications.map(({ application, job }) => (
            <Link
              className="job-card"
              key={application.id}
              to="/jobs/$jobId"
              params={{ jobId: application.job_id }}
            >
              <p className="stat-label">{application.status}</p>
              <h2>{job?.job_title ?? "Saved application"}</h2>
              <p>{job?.company_information ?? "Job listing"}</p>
              <p className="muted-text">
                Applied {new Date(application.applied_at).toLocaleDateString()}
              </p>
              <span className="pill">Application received</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="panel stack">
          <h2 className="section-title">No applications yet</h2>
          <p className="muted-text">Open a job listing and select Apply for this job.</p>
          <Link className="button-primary w-fit" to="/jobs">
            Browse job listings
          </Link>
        </div>
      )}
    </section>
  );
}
