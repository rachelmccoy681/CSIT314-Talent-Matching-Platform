import { useAuth } from "@/lib/auth";
import {
  fileToDataUrl,
  getConversationId,
  getJobId,
  listApplicationsForJob,
  listJobs,
  sendMessage,
  updateApplicationDetails,
  updateApplicationStage,
  type ApplicationRecord,
  type HiringStage,
} from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const activeStages: HiringStage[] = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export const Route = createFileRoute("/hiring")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: listJobs,
  component: HiringPage,
});

function HiringPage() {
  const jobs = Route.useLoaderData();
  const { user, profile } = useAuth();
  const isEmployerAccount = getAccountType(user, profile) === "employer";
  const employerJobs = jobs.filter((job) => !job.employer_id || job.employer_id === user?.id || String(job.id).startsWith("local-"));
  const [selectedJobId, setSelectedJobId] = useState(getJobId(employerJobs[0] ?? jobs[0]));
  const [stageFilter, setStageFilter] = useState<HiringStage | "All active">("All active");
  const [messageByApplication, setMessageByApplication] = useState<Record<string, string>>({});
  const [interviewByApplication, setInterviewByApplication] = useState<Record<string, { time: string; location: string }>>({});
  const [documentsByApplication, setDocumentsByApplication] = useState<Record<string, { name: string; data: string }>>({});
  const [, setRefreshKey] = useState(0);

  const selectedJob = employerJobs.find((job) => getJobId(job) === selectedJobId);
  const applications = listApplicationsForJob(selectedJobId);
  const filteredApplications = useMemo(() => {
    if (stageFilter === "All active") return applications.filter((application) => activeStages.includes(application.stage));
    return applications.filter((application) => application.stage === stageFilter);
  }, [applications, stageFilter]);

  if (!isEmployerAccount) {
    return (
      <section className="panel stack">
        <h1 className="page-title">Employer account required</h1>
        <p className="muted-text">Log out and sign in with an employer account to open hiring pipeline tools.</p>
        <Link className="button-primary w-fit" to="/jobs">
          Browse jobs
        </Link>
      </section>
    );
  }

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  function progressStage(application: ApplicationRecord) {
    const index = activeStages.indexOf(application.stage);
    const nextStage = activeStages[Math.min(index + 1, activeStages.length - 1)];
    updateApplicationStage(application.id, nextStage);
    refresh();
  }

  function reject(application: ApplicationRecord) {
    updateApplicationStage(application.id, "Rejected");
    refresh();
  }

  function messageCandidate(application: ApplicationRecord, body: string, attachment?: { name: string; data: string }) {
    if (!body.trim() && !attachment?.data) return;

    sendMessage({
      application_id: getConversationId(user?.id ?? "employer", application.candidate_id),
      conversation_id: getConversationId(user?.id ?? "employer", application.candidate_id),
      job_id: selectedJobId,
      sender_id: user?.id ?? "employer",
      sender_name: profile?.company_name || selectedJob?.company_information || profile?.full_name || "Employer",
      recipient_id: application.candidate_id,
      recipient_name: application.candidate_name,
      employer_id: user?.id ?? "employer",
      employer_name: profile?.company_name || selectedJob?.company_information || profile?.full_name || "Employer",
      candidate_id: application.candidate_id,
      candidate_name: application.candidate_name,
      body: body || `Sent attachment: ${attachment?.name}`,
      attachment_name: attachment?.name,
      attachment_data: attachment?.data,
    });
  }

  function sendQuickMessage(application: ApplicationRecord) {
    const body = messageByApplication[application.id]?.trim();
    if (!body) return;
    messageCandidate(application, body);
    setMessageByApplication((current) => ({ ...current, [application.id]: "" }));
  }

  function sendInterview(application: ApplicationRecord) {
    const interview = interviewByApplication[application.id];
    if (!interview?.time || !interview?.location) return;

    updateApplicationDetails(application.id, {
      interview_time: interview.time,
      interview_location: interview.location,
    });
    messageCandidate(
      application,
      `Interview invitation for ${selectedJob?.job_title ?? "the role"}: ${new Date(interview.time).toLocaleString()} at ${interview.location}.`,
    );
    refresh();
  }

  async function attachDocument(applicationId: string, file?: File) {
    if (!file) return;
    setDocumentsByApplication((current) => ({
      ...current,
      [applicationId]: { name: file.name, data: "" },
    }));
    const data = await fileToDataUrl(file);
    setDocumentsByApplication((current) => ({
      ...current,
      [applicationId]: { name: file.name, data },
    }));
  }

  function sendDocuments(application: ApplicationRecord) {
    const document = documentsByApplication[application.id];
    if (!document?.data) return;

    updateApplicationDetails(application.id, {
      hr_document_name: document.name,
      hr_document_data: document.data,
    });
    messageCandidate(application, `Please review the attached HR document for ${selectedJob?.job_title ?? "this role"}.`, document);
    refresh();
  }

  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hiring pipeline</p>
          <h1 className="page-title">Review applications</h1>
          <p className="page-copy">
            Progress candidates, book interviews, send documents, and keep every
            applicant conversation attached to the role.
          </p>
        </div>
        <Link className="button-primary" to="/messages">
          Open messages
        </Link>
      </div>

      <div className="toolbar">
        <select className="input" value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
          {employerJobs.map((job) => (
            <option key={getJobId(job)} value={getJobId(job)}>
              {job.job_title} - {job.company_information}
            </option>
          ))}
        </select>
      </div>

      <div className="pipeline-bar">
        {["Applied", "Screening", "Interview", "Offer", "Hired", "All active", "Withdrawn", "Rejected"].map((stage) => {
          const count =
            stage === "All active"
              ? applications.filter((application) => activeStages.includes(application.stage)).length
              : applications.filter((application) => application.stage === stage).length;
          return (
            <button
              className={stageFilter === stage ? "pipeline-card-active" : "pipeline-card"}
              key={stage}
              type="button"
              onClick={() => setStageFilter(stage as HiringStage | "All active")}
            >
              <span>{count || "-"}</span>
              <small>{stage}</small>
            </button>
          );
        })}
      </div>

      <div className="candidate-list">
        {filteredApplications.map((application) => (
          <article className="hiring-card" key={application.id}>
            <div className="stack">
              <div>
                <p className="stat-label">{application.stage}</p>
                <h3>{application.candidate_name}</h3>
                <p className="muted-text">{application.candidate_email}</p>
              </div>
              <p>{application.cover_note || "No cover note supplied."}</p>
              {application.resume_data ? (
                <a className="button-secondary w-fit" href={application.resume_data} download={application.resume_name || "resume"}>
                  Download resume
                </a>
              ) : (
                <p className="error-text">No resume attached.</p>
              )}
            </div>

            <aside className="hiring-actions">
              <div className="button-row mt-0">
                <button
                  className="button-primary"
                  disabled={application.stage === "Hired" || application.stage === "Rejected" || application.stage === "Withdrawn"}
                  type="button"
                  onClick={() => progressStage(application)}
                >
                  {application.stage === "Offer" ? "Mark hired" : `Progress to ${getNextStage(application.stage)}`}
                </button>
                <button className="button-danger" type="button" onClick={() => reject(application)}>
                  Reject
                </button>
              </div>

              {application.stage === "Interview" ? (
                <div className="action-panel">
                  <h4>Book interview</h4>
                  <input
                    className="input"
                    type="datetime-local"
                    value={interviewByApplication[application.id]?.time ?? application.interview_time ?? ""}
                    onChange={(event) =>
                      setInterviewByApplication((current) => ({
                        ...current,
                        [application.id]: {
                          time: event.target.value,
                          location: current[application.id]?.location ?? application.interview_location ?? "",
                        },
                      }))
                    }
                  />
                  <input
                    className="input"
                    value={interviewByApplication[application.id]?.location ?? application.interview_location ?? ""}
                    onChange={(event) =>
                      setInterviewByApplication((current) => ({
                        ...current,
                        [application.id]: {
                          time: current[application.id]?.time ?? application.interview_time ?? "",
                          location: event.target.value,
                        },
                      }))
                    }
                    placeholder="Teams link, office address, or phone call"
                  />
                  <button className="button-secondary" type="button" onClick={() => sendInterview(application)}>
                    Send interview invite
                  </button>
                </div>
              ) : null}

              {application.stage === "Offer" || application.stage === "Hired" ? (
                <div className="action-panel">
                  <h4>HR documents</h4>
                  <label className="file-upload" htmlFor={`hr-document-${application.id}`}>
                    <span className="file-upload-title">Attach HR document</span>
                    <span className="file-upload-copy">
                      {documentsByApplication[application.id]?.name || application.hr_document_name || "PDF, DOCX, or image"}
                    </span>
                    <input
                      id={`hr-document-${application.id}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(event) => attachDocument(application.id, event.target.files?.[0])}
                    />
                  </label>
                  <button className="button-secondary" type="button" onClick={() => sendDocuments(application)}>
                    Send HR document
                  </button>
                </div>
              ) : null}

              <div className="action-panel">
                <h4>Message candidate</h4>
                <textarea
                  className="input min-h-24"
                  value={messageByApplication[application.id] ?? ""}
                  onChange={(event) =>
                    setMessageByApplication((current) => ({
                      ...current,
                      [application.id]: event.target.value,
                    }))
                  }
                  placeholder="Send a hiring update..."
                />
                <button className="button-secondary" type="button" onClick={() => sendQuickMessage(application)}>
                  Send message
                </button>
              </div>
            </aside>
          </article>
        ))}
        {!filteredApplications.length ? (
          <div className="panel stack">
            <h2 className="section-title">No applications in this stage</h2>
            <p className="muted-text">Applications will appear here after candidates apply or move through the pipeline.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getNextStage(stage: HiringStage) {
  const index = activeStages.indexOf(stage);
  return activeStages[Math.min(index + 1, activeStages.length - 1)];
}
