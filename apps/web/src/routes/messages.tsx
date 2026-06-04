import { useAuth } from "@/lib/auth";
import {
  deleteConversation,
  deleteMessage,
  fileToDataUrl,
  getJobId,
  listJobs,
  listMessages,
  loadMessages,
  sendMessage,
  type JobPosting,
} from "@/lib/data";
import { getAccountType } from "@/lib/view-mode";
import { supabase } from "@/utils/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/messages")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/sign-in" });
  },
  loader: async () => {
    const { data } = await supabase.auth.getSession();
    const [jobs, messages] = await Promise.all([
      listJobs(),
      loadMessages(data.session?.user.id),
    ]);
    return { jobs, messages };
  },
  component: MessagesPage,
});

function MessagesPage() {
  const { jobs, messages: loadedMessages } = Route.useLoaderData();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState(loadedMessages);
  const [selectedThreadId, setSelectedThreadId] = useState(messages[0] ? getMessageThreadId(messages[0]) : "");
  const [body, setBody] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentData, setAttachmentData] = useState("");
  const isEmployer = getAccountType(user, profile) === "employer";

  const threads = useMemo(
    () => Array.from(new Set(messages.map(getMessageThreadId))),
    [messages],
  );
  const visibleMessages = messages.filter((message) => getMessageThreadId(message) === selectedThreadId);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    async function refreshMessages() {
      const nextMessages = await loadMessages(user?.id);
      if (!active) return;

      setMessages(nextMessages);
      setSelectedThreadId((currentThreadId) => {
        if (currentThreadId && nextMessages.some((message) => getMessageThreadId(message) === currentThreadId)) {
          return currentThreadId;
        }
        return nextMessages[0] ? getMessageThreadId(nextMessages[0]) : "";
      });
    }

    const intervalId = window.setInterval(refreshMessages, 3000);
    void refreshMessages();

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  async function attachFile(file?: File) {
    if (!file) return;
    setAttachmentName(file.name);
    setAttachmentData(await fileToDataUrl(file));
  }

  function reply() {
    if ((!body.trim() && !attachmentData) || !selectedThreadId) return;
    const latest = visibleMessages[visibleMessages.length - 1];
    const job = jobs.find((item) => getJobId(item) === latest?.job_id);
    const userId = user?.id ?? "user";
    const recipientId = latest?.sender_id === userId ? latest?.recipient_id : latest?.sender_id;
    const recipientName = latest?.sender_id === userId ? latest?.recipient_name : latest?.sender_name;
    const record = sendMessage({
      application_id: selectedThreadId,
      conversation_id: selectedThreadId,
      job_id: latest?.job_id ?? "",
      sender_id: userId,
      sender_name: profile?.company_name || profile?.full_name || job?.company_information || user?.email || "User",
      recipient_id: recipientId ?? "recipient",
      recipient_name: recipientName,
      employer_id: latest?.employer_id,
      employer_name: latest?.employer_name,
      candidate_id: latest?.candidate_id,
      candidate_name: latest?.candidate_name,
      body: body || `Sent attachment: ${attachmentName}`,
      attachment_name: attachmentName,
      attachment_data: attachmentData,
    });
    setMessages((current) => [...current, record]);
    setBody("");
    setAttachmentName("");
    setAttachmentData("");
  }

  async function removeMessage(messageId: string) {
    const confirmed = window.confirm("Delete this message from the conversation?");
    if (!confirmed) return;

    await deleteMessage(messageId);
    setMessages((current) => {
      const nextMessages = current.filter((message) => message.id !== messageId);
      if (!nextMessages.some((message) => getMessageThreadId(message) === selectedThreadId)) {
        setSelectedThreadId(nextMessages[0] ? getMessageThreadId(nextMessages[0]) : "");
      }
      return nextMessages;
    });
  }

  async function removeThread(threadId: string) {
    const confirmed = window.confirm("Delete this whole message chain?");
    if (!confirmed) return;

    await deleteConversation(threadId);
    setMessages((current) => {
      const nextMessages = current.filter((message) => getMessageThreadId(message) !== threadId);
      setSelectedThreadId(nextMessages[0] ? getMessageThreadId(nextMessages[0]) : "");
      return nextMessages;
    });
  }

  return (
    <section className="stack">
      <div>
        <p className="eyebrow">Communication</p>
        <h1 className="page-title">Messages</h1>
        <p className="page-copy">
          Keep interview updates and application conversations in one place.
        </p>
      </div>

      {threads.length ? (
        <div className="messages-layout">
          <aside className="panel stack">
            {threads.map((thread) => (
              <div className={thread === selectedThreadId ? "thread-row-active" : "thread-row"} key={thread}>
                <button
                  className="thread-select"
                  type="button"
                  onClick={() => setSelectedThreadId(thread)}
                >
                  {getThreadTitle(thread, messages, jobs, isEmployer)}
                </button>
                <button className="button-link-danger" type="button" onClick={() => removeThread(thread)}>
                  Delete
                </button>
              </div>
            ))}
          </aside>
          <section className="panel stack">
            <div className="section-header">
              <h2 className="section-title">{getThreadTitle(selectedThreadId, messages, jobs, isEmployer)}</h2>
              <button className="button-danger" type="button" onClick={() => removeThread(selectedThreadId)}>
                Delete chat
              </button>
            </div>
            <div className="message-list">
              {visibleMessages.map((message) => (
                <article className="message-bubble" key={message.id}>
                  <div className="message-header">
                    <p className="stat-label">{message.sender_name}</p>
                    <button className="button-link-danger" type="button" onClick={() => removeMessage(message.id)}>
                      Delete
                    </button>
                  </div>
                  <p>{message.body}</p>
                  {message.attachment_data ? (
                    <a className="button-secondary mt-3 w-fit" href={message.attachment_data} download={message.attachment_name || "attachment"}>
                      {message.attachment_name || "Download attachment"}
                    </a>
                  ) : null}
                  <p className="muted-text">{new Date(message.created_at).toLocaleString()}</p>
                </article>
              ))}
            </div>
            <textarea
              className="input min-h-24"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a reply..."
            />
            <label className="file-upload" htmlFor="message-attachment">
              <span className="file-upload-title">Attach a file</span>
              <span className="file-upload-copy">
                {attachmentName || "PDF, image, DOC, or DOCX"}
              </span>
              <input
                id="message-attachment"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={(event) => attachFile(event.target.files?.[0])}
              />
            </label>
            <button className="button-primary w-fit" type="button" onClick={reply}>
              Send reply
            </button>
          </section>
        </div>
      ) : (
        <div className="panel">
          <p className="muted-text">No messages yet. Employers can start a conversation from the hiring pipeline.</p>
        </div>
      )}
    </section>
  );
}

function getMessageThreadId(message: ReturnType<typeof listMessages>[number]) {
  return message.conversation_id || message.application_id;
}

function getThreadTitle(threadId: string, messages: ReturnType<typeof listMessages>, jobs: JobPosting[], isEmployer: boolean) {
  const message = messages.find((item) => getMessageThreadId(item) === threadId);
  const job = jobs.find((item) => getJobId(item) === message?.job_id);

  if (isEmployer && message?.candidate_name) return message.candidate_name;
  if (!isEmployer && job) return `${job.company_information} - ${job.job_title}`;
  if (!isEmployer && message?.employer_name) return message.employer_name;
  if (message?.candidate_name) return message.candidate_name;
  return `Conversation ${threadId.slice(-8)}`;
}
