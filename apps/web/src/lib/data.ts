import { supabase } from "@/utils/supabase";

export type JobPosting = {
  id?: string | number;
  created_at?: string;
  employer_id?: string | null;
  job_title: string;
  company_information: string;
  required_education_level: string;
  required_skills: string;
  years_of_experience: number;
  work_mode: string;
  job_location: string;
  category?: string;
  salary_range?: string;
  employment_type?: string;
  description?: string;
  benefits?: string;
};

export type ProfileFormValues = {
  full_name: string;
  contact_information: string;
  education: string;
  major_field_of_study: string;
  years_of_experience: string;
  work_experience: string;
  skills: string;
  preferred_working_mode: string;
  preferred_location: string;
  resume_name?: string;
  resume_data?: string;
  company_name?: string;
  company_website?: string;
  company_description?: string;
  company_location?: string;
  membership_tier?: string;
  job_alert_query?: string;
  job_alert_category?: string;
  job_alert_mode?: string;
  job_alert_experience?: string;
};

const applicationStorageKey = "talentmatch-applications";
const localJobsStorageKey = "talentmatch-local-jobs";
const messagesStorageKey = "talentmatch-messages";

export type CandidateProfile = {
  id: string;
  full_name: string;
  contact_information?: string | null;
  education?: string | null;
  major_field_of_study?: string | null;
  years_of_experience?: number | string | null;
  work_experience?: string | null;
  skills?: string | null;
  preferred_working_mode?: string | null;
  preferred_location?: string | null;
  resume_name?: string | null;
  resume_data?: string | null;
};

export type HiringStage = "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Withdrawn" | "Rejected";

export type ApplicationRecord = {
  id: string;
  job_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email?: string;
  applied_at: string;
  status: "Submitted" | "Shortlisted" | "Reviewed";
  stage: HiringStage;
  cover_note?: string;
  resume_name?: string;
  resume_data?: string;
  interview_time?: string;
  interview_location?: string;
  hr_document_name?: string;
  hr_document_data?: string;
};

export type MessageRecord = {
  id: string;
  application_id: string;
  conversation_id?: string;
  job_id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name?: string;
  employer_id?: string;
  employer_name?: string;
  candidate_id?: string;
  candidate_name?: string;
  body: string;
  attachment_name?: string;
  attachment_data?: string;
  created_at: string;
};

export const fakeJobs: JobPosting[] = [
  {
    id: "seed-001",
    job_title: "Junior Frontend Developer",
    company_information: "Northstar Digital",
    required_education_level: "Bachelor degree or equivalent portfolio",
    required_skills: "React, TypeScript, CSS, Git",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$75,000 - $92,000",
    employment_type: "Full-time",
    description: "Build customer-facing product screens with a senior product team.",
    benefits: "Training budget, flexible hours, mentoring program",
  },
  {
    id: "seed-002",
    job_title: "Graduate Software Engineer",
    company_information: "HarbourCloud",
    required_education_level: "Computer Science, IT, or related degree",
    required_skills: "JavaScript, SQL, APIs, Testing",
    years_of_experience: 0,
    work_mode: "Hybrid",
    job_location: "Wollongong, NSW",
    salary_range: "$70,000 - $85,000",
    employment_type: "Graduate",
    description: "Rotate through web, data, and platform teams while shipping production features.",
    benefits: "Graduate pathway, paid certifications, wellness leave",
  },
  {
    id: "seed-003",
    job_title: "Data Analyst",
    company_information: "InsightGrid Analytics",
    required_education_level: "Bachelor degree in IT, Business Analytics, or Statistics",
    required_skills: "SQL, Power BI, Excel, Python",
    years_of_experience: 1,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$78,000 - $98,000",
    employment_type: "Full-time",
    description: "Turn operational data into dashboards and weekly decision reports.",
    benefits: "Remote setup allowance, data conference budget",
  },
  {
    id: "seed-004",
    job_title: "UX Research Assistant",
    company_information: "Civic Labs",
    required_education_level: "Design, Psychology, HCI, or related study",
    required_skills: "User interviews, Survey design, Figma, Reporting",
    years_of_experience: 0,
    work_mode: "Hybrid",
    job_location: "Canberra, ACT",
    salary_range: "$68,000 - $82,000",
    employment_type: "Full-time",
    description: "Support research planning, synthesis, and accessibility testing for public services.",
    benefits: "Nine-day fortnight, learning budget",
  },
  {
    id: "seed-005",
    job_title: "IT Support Officer",
    company_information: "BrightPath Education",
    required_education_level: "Diploma or bachelor degree in IT",
    required_skills: "Windows, Networking, Customer support, Troubleshooting",
    years_of_experience: 1,
    work_mode: "On-site",
    job_location: "Parramatta, NSW",
    salary_range: "$65,000 - $78,000",
    employment_type: "Full-time",
    description: "Provide first and second-level support across staff devices and classroom systems.",
    benefits: "Leave loading, paid training, salary packaging",
  },
  {
    id: "seed-006",
    job_title: "Backend Developer",
    company_information: "LedgerLane Fintech",
    required_education_level: "Bachelor degree or equivalent experience",
    required_skills: "Node.js, PostgreSQL, REST APIs, Supabase",
    years_of_experience: 2,
    work_mode: "Hybrid",
    job_location: "Melbourne, VIC",
    salary_range: "$100,000 - $125,000",
    employment_type: "Full-time",
    description: "Design secure API services for payments, reporting, and customer onboarding.",
    benefits: "Equity plan, hybrid work, annual tech allowance",
  },
  {
    id: "seed-007",
    job_title: "Cyber Security Analyst",
    company_information: "SentinelWorks",
    required_education_level: "Cyber security, networking, or IT degree",
    required_skills: "SIEM, Incident response, Networking, Risk",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Brisbane, QLD",
    salary_range: "$88,000 - $110,000",
    employment_type: "Full-time",
    description: "Monitor alerts, triage incidents, and improve security playbooks.",
    benefits: "Certification support, rotating roster allowance",
  },
  {
    id: "seed-008",
    job_title: "Product Coordinator",
    company_information: "MarketPilot",
    required_education_level: "Business, IT, or communications degree",
    required_skills: "Agile, Jira, Stakeholder communication, Analytics",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$80,000 - $95,000",
    employment_type: "Full-time",
    description: "Coordinate sprint planning, user feedback, and delivery reporting.",
    benefits: "Career coaching, flexible start times",
  },
  {
    id: "seed-009",
    job_title: "Cloud Operations Associate",
    company_information: "BluePeak Systems",
    required_education_level: "IT degree, diploma, or cloud certification",
    required_skills: "AWS, Linux, Monitoring, Scripting",
    years_of_experience: 1,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$82,000 - $102,000",
    employment_type: "Full-time",
    description: "Support cloud infrastructure health, incident response, and release operations.",
    benefits: "Home office budget, certification reimbursement",
  },
  {
    id: "seed-010",
    job_title: "Business Systems Analyst",
    company_information: "Metro Health Group",
    required_education_level: "Information Systems, Business, or Health Informatics",
    required_skills: "Requirements analysis, SQL, Process mapping, Documentation",
    years_of_experience: 2,
    work_mode: "Hybrid",
    job_location: "Newcastle, NSW",
    salary_range: "$92,000 - $115,000",
    employment_type: "Full-time",
    description: "Translate clinical operations needs into system improvements and reports.",
    benefits: "Additional leave, salary packaging",
  },
  {
    id: "seed-011",
    job_title: "Mobile App Developer",
    company_information: "PocketForge",
    required_education_level: "Bachelor degree or strong app portfolio",
    required_skills: "React Native, TypeScript, APIs, Mobile UI",
    years_of_experience: 2,
    work_mode: "Hybrid",
    job_location: "Melbourne, VIC",
    salary_range: "$105,000 - $130,000",
    employment_type: "Full-time",
    description: "Ship iOS and Android features for consumer finance applications.",
    benefits: "Device allowance, product hack days",
  },
  {
    id: "seed-012",
    job_title: "Junior QA Engineer",
    company_information: "ReleaseRight",
    required_education_level: "IT degree, diploma, or testing certification",
    required_skills: "Manual testing, Test cases, Cypress, Jira",
    years_of_experience: 0,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$68,000 - $82,000",
    employment_type: "Full-time",
    description: "Create regression tests and support release quality across web products.",
    benefits: "Remote work, ISTQB support",
  },
  {
    id: "seed-013",
    job_title: "Database Administrator",
    company_information: "CoreData Services",
    required_education_level: "Database, IT, or Computer Science qualification",
    required_skills: "PostgreSQL, Backups, Performance tuning, SQL",
    years_of_experience: 3,
    work_mode: "Hybrid",
    job_location: "Adelaide, SA",
    salary_range: "$110,000 - $138,000",
    employment_type: "Full-time",
    description: "Maintain production databases, backup strategy, and performance monitoring.",
    benefits: "On-call allowance, training budget",
  },
  {
    id: "seed-014",
    job_title: "Digital Marketing Analyst",
    company_information: "GrowthWorks Studio",
    required_education_level: "Marketing, Business Analytics, or related degree",
    required_skills: "Google Analytics, Excel, SQL, Reporting",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$72,000 - $90,000",
    employment_type: "Full-time",
    description: "Analyse campaign performance and build weekly acquisition insights.",
    benefits: "Performance bonus, training budget",
  },
  {
    id: "seed-015",
    job_title: "DevOps Engineer",
    company_information: "BuildRail",
    required_education_level: "IT degree or equivalent platform experience",
    required_skills: "CI/CD, Docker, AWS, Terraform",
    years_of_experience: 3,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$125,000 - $155,000",
    employment_type: "Full-time",
    description: "Improve deployment pipelines, environment reliability, and observability.",
    benefits: "Remote-first culture, cloud certification support",
  },
  {
    id: "seed-016",
    job_title: "Systems Administrator",
    company_information: "RegionalCare IT",
    required_education_level: "IT diploma, degree, or Microsoft certification",
    required_skills: "Microsoft 365, Active Directory, Networking, PowerShell",
    years_of_experience: 2,
    work_mode: "On-site",
    job_location: "Wagga Wagga, NSW",
    salary_range: "$82,000 - $98,000",
    employment_type: "Full-time",
    description: "Support infrastructure, identity, and endpoint management across regional sites.",
    benefits: "Relocation support, additional leave",
  },
  {
    id: "seed-017",
    job_title: "AI Prompt Engineer",
    company_information: "AssistiveAI Labs",
    required_education_level: "IT, linguistics, communications, or equivalent experience",
    required_skills: "Prompt design, Evaluation, Python, Documentation",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$95,000 - $118,000",
    employment_type: "Full-time",
    description: "Design and test AI workflows for internal knowledge and support tools.",
    benefits: "Research days, learning allowance",
  },
  {
    id: "seed-018",
    job_title: "Scrum Master",
    company_information: "FlowState Delivery",
    required_education_level: "Business, IT, or project management qualification",
    required_skills: "Agile, Facilitation, Jira, Stakeholder management",
    years_of_experience: 2,
    work_mode: "Hybrid",
    job_location: "Perth, WA",
    salary_range: "$105,000 - $128,000",
    employment_type: "Full-time",
    description: "Coach delivery teams, unblock work, and improve sprint rituals.",
    benefits: "Professional development, flexible working",
  },
  {
    id: "seed-019",
    job_title: "Technical Writer",
    company_information: "Docs & Systems Co.",
    required_education_level: "Communications, IT, or equivalent writing portfolio",
    required_skills: "Technical writing, Markdown, APIs, Information architecture",
    years_of_experience: 1,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$78,000 - $96,000",
    employment_type: "Full-time",
    description: "Create developer documentation, release notes, and support knowledge articles.",
    benefits: "Remote work, editing mentorship",
  },
  {
    id: "seed-020",
    job_title: "Machine Learning Intern",
    company_information: "SignalMinds",
    required_education_level: "Current student in CS, Data Science, or related field",
    required_skills: "Python, Machine learning, Data cleaning, Git",
    years_of_experience: 0,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$32 - $40 per hour",
    employment_type: "Internship",
    description: "Assist with dataset preparation, model experiments, and evaluation dashboards.",
    benefits: "Academic-friendly schedule, mentorship",
  },
  {
    id: "seed-021",
    job_title: "Full Stack Developer",
    company_information: "Cobalt Apps",
    required_education_level: "Bachelor degree or equivalent commercial experience",
    required_skills: "React, Node.js, PostgreSQL, TypeScript",
    years_of_experience: 3,
    work_mode: "Hybrid",
    job_location: "Brisbane, QLD",
    salary_range: "$115,000 - $145,000",
    employment_type: "Full-time",
    description: "Own end-to-end features across customer portals and admin tooling.",
    benefits: "Equity plan, training budget",
  },
  {
    id: "seed-022",
    job_title: "Network Engineer",
    company_information: "Connective Networks",
    required_education_level: "Networking qualification or Cisco certification",
    required_skills: "Routing, Switching, Firewalls, Documentation",
    years_of_experience: 2,
    work_mode: "On-site",
    job_location: "Melbourne, VIC",
    salary_range: "$98,000 - $122,000",
    employment_type: "Full-time",
    description: "Maintain client networks, firewall policies, and upgrade planning.",
    benefits: "Certification support, vehicle allowance",
  },
  {
    id: "seed-023",
    job_title: "CRM Administrator",
    company_information: "MemberFirst",
    required_education_level: "Business systems, IT, or equivalent experience",
    required_skills: "Salesforce, Data quality, Reporting, User support",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$82,000 - $100,000",
    employment_type: "Full-time",
    description: "Manage CRM configuration, reports, imports, and user support requests.",
    benefits: "Flexible hours, professional development",
  },
  {
    id: "seed-024",
    job_title: "Information Security Consultant",
    company_information: "AssureSec",
    required_education_level: "Cyber security, IT, or risk qualification",
    required_skills: "ISO 27001, Risk assessment, Security policy, Consulting",
    years_of_experience: 3,
    work_mode: "Hybrid",
    job_location: "Sydney, NSW",
    salary_range: "$120,000 - $150,000",
    employment_type: "Full-time",
    description: "Deliver security assessments and practical remediation plans for clients.",
    benefits: "Certification allowance, client travel budget",
  },
  {
    id: "seed-025",
    job_title: "Software Support Specialist",
    company_information: "CareDesk Software",
    required_education_level: "IT, health administration, or equivalent experience",
    required_skills: "Customer support, SQL, Troubleshooting, Communication",
    years_of_experience: 1,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$70,000 - $86,000",
    employment_type: "Full-time",
    description: "Resolve customer product issues and escalate reproducible defects.",
    benefits: "Remote work, support career pathway",
  },
  {
    id: "seed-026",
    job_title: "Junior Project Manager",
    company_information: "Atlas Delivery Group",
    required_education_level: "Project management, business, or IT qualification",
    required_skills: "Scheduling, Risk tracking, Stakeholder communication, Excel",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Canberra, ACT",
    salary_range: "$84,000 - $104,000",
    employment_type: "Full-time",
    description: "Support project planning, status reporting, and delivery governance.",
    benefits: "PM certification support, hybrid work",
  },
  {
    id: "seed-027",
    job_title: "Web Content Coordinator",
    company_information: "UniConnect",
    required_education_level: "Communications, marketing, or web qualification",
    required_skills: "CMS, Accessibility, HTML, Content editing",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Wollongong, NSW",
    salary_range: "$68,000 - $82,000",
    employment_type: "Full-time",
    description: "Publish and improve content across university web properties.",
    benefits: "Additional leave, campus benefits",
  },
  {
    id: "seed-028",
    job_title: "Analytics Engineer",
    company_information: "WarehouseIQ",
    required_education_level: "Data, IT, or engineering degree",
    required_skills: "dbt, SQL, Python, Data modelling",
    years_of_experience: 2,
    work_mode: "Remote",
    job_location: "Australia",
    salary_range: "$110,000 - $138,000",
    employment_type: "Full-time",
    description: "Build trusted analytics models and modern data warehouse transformations.",
    benefits: "Remote work, data conference budget",
  },
  {
    id: "seed-029",
    job_title: "Service Desk Team Lead",
    company_information: "ManagedIT Partners",
    required_education_level: "IT qualification or equivalent leadership experience",
    required_skills: "ITIL, Team leadership, Escalations, Reporting",
    years_of_experience: 3,
    work_mode: "On-site",
    job_location: "Sydney, NSW",
    salary_range: "$92,000 - $115,000",
    employment_type: "Full-time",
    description: "Lead a service desk team and improve customer support performance.",
    benefits: "Leadership training, bonus program",
  },
  {
    id: "seed-030",
    job_title: "Associate Solutions Consultant",
    company_information: "CloudBridge Advisory",
    required_education_level: "IT, business systems, or engineering degree",
    required_skills: "Presentations, APIs, Requirements analysis, Cloud",
    years_of_experience: 1,
    work_mode: "Hybrid",
    job_location: "Melbourne, VIC",
    salary_range: "$86,000 - $108,000",
    employment_type: "Full-time",
    description: "Support demos, discovery workshops, and solution design for enterprise clients.",
    benefits: "Travel opportunities, mentoring program",
  },
];

export const demoCandidates: CandidateProfile[] = [
  {
    id: "candidate-001",
    full_name: "Ava Chen",
    contact_information: "+61 412 223 118",
    education: "Bachelor of Computer Science",
    major_field_of_study: "Software Engineering",
    years_of_experience: 2,
    work_experience: "Frontend internship, React dashboard project, accessibility testing.",
    skills: "React, TypeScript, CSS, Git, APIs",
    preferred_working_mode: "Hybrid",
    preferred_location: "Sydney, NSW",
  },
  {
    id: "candidate-002",
    full_name: "Noah Williams",
    contact_information: "+61 421 991 772",
    education: "Bachelor of Information Technology",
    major_field_of_study: "Cyber Security",
    years_of_experience: 1,
    work_experience: "SOC placement, incident triage, network monitoring.",
    skills: "SIEM, Incident response, Networking, Risk, Linux",
    preferred_working_mode: "Hybrid",
    preferred_location: "Brisbane, QLD",
  },
  {
    id: "candidate-003",
    full_name: "Mia Patel",
    contact_information: "+61 400 812 554",
    education: "Master of Data Science",
    major_field_of_study: "Analytics",
    years_of_experience: 3,
    work_experience: "Built BI dashboards and SQL reporting pipelines.",
    skills: "SQL, Power BI, Python, Excel, Data modelling",
    preferred_working_mode: "Remote",
    preferred_location: "Australia",
  },
  {
    id: "candidate-004",
    full_name: "Liam Nguyen",
    contact_information: "+61 433 702 440",
    education: "Bachelor of Computer Science",
    major_field_of_study: "Cloud Computing",
    years_of_experience: 2,
    work_experience: "Cloud support, Linux administration, CI/CD coursework.",
    skills: "AWS, Linux, Docker, Monitoring, Scripting",
    preferred_working_mode: "Remote",
    preferred_location: "Australia",
  },
  {
    id: "candidate-005",
    full_name: "Sofia Martinez",
    contact_information: "+61 488 110 219",
    education: "Bachelor of Business Information Systems",
    major_field_of_study: "Business Analysis",
    years_of_experience: 4,
    work_experience: "Requirements workshops, process mapping, health systems reporting.",
    skills: "Requirements analysis, SQL, Process mapping, Documentation, Stakeholder communication",
    preferred_working_mode: "Hybrid",
    preferred_location: "Newcastle, NSW",
  },
  {
    id: "candidate-006",
    full_name: "Ethan O'Connor",
    contact_information: "+61 477 305 665",
    education: "Diploma of Information Technology",
    major_field_of_study: "IT Support",
    years_of_experience: 3,
    work_experience: "Service desk lead, Microsoft 365 rollout, endpoint support.",
    skills: "Windows, Microsoft 365, Active Directory, Customer support, Troubleshooting",
    preferred_working_mode: "On-site",
    preferred_location: "Parramatta, NSW",
  },
  {
    id: "candidate-007",
    full_name: "Olivia Brown",
    contact_information: "+61 455 881 007",
    education: "Bachelor of Design",
    major_field_of_study: "Human Computer Interaction",
    years_of_experience: 1,
    work_experience: "UX research assistant, usability tests, Figma prototypes.",
    skills: "User interviews, Survey design, Figma, Reporting, Accessibility",
    preferred_working_mode: "Hybrid",
    preferred_location: "Canberra, ACT",
  },
  {
    id: "candidate-008",
    full_name: "Lucas Kim",
    contact_information: "+61 499 626 310",
    education: "Bachelor of Software Engineering",
    major_field_of_study: "Backend Development",
    years_of_experience: 3,
    work_experience: "Node.js API development, PostgreSQL schemas, Supabase prototypes.",
    skills: "Node.js, PostgreSQL, REST APIs, Supabase, TypeScript",
    preferred_working_mode: "Hybrid",
    preferred_location: "Melbourne, VIC",
  },
  {
    id: "candidate-009",
    full_name: "Grace Wilson",
    contact_information: "+61 466 731 442",
    education: "Bachelor of Communications",
    major_field_of_study: "Technical Communication",
    years_of_experience: 2,
    work_experience: "API documentation, help centre content, release notes.",
    skills: "Technical writing, Markdown, APIs, Information architecture, Content editing",
    preferred_working_mode: "Remote",
    preferred_location: "Australia",
  },
  {
    id: "candidate-010",
    full_name: "Henry Singh",
    contact_information: "+61 401 430 773",
    education: "Bachelor of Computer Science",
    major_field_of_study: "Artificial Intelligence",
    years_of_experience: 1,
    work_experience: "Machine learning coursework, model evaluation, Python data cleaning.",
    skills: "Python, Machine learning, Data cleaning, Git, Evaluation",
    preferred_working_mode: "Hybrid",
    preferred_location: "Sydney, NSW",
  },
  {
    id: "candidate-011",
    full_name: "Isabella Taylor",
    contact_information: "+61 490 212 840",
    education: "Bachelor of Project Management",
    major_field_of_study: "Information Systems",
    years_of_experience: 2,
    work_experience: "Project coordination, sprint reporting, delivery risk tracking.",
    skills: "Scheduling, Risk tracking, Stakeholder communication, Jira, Excel",
    preferred_working_mode: "Hybrid",
    preferred_location: "Canberra, ACT",
  },
  {
    id: "candidate-012",
    full_name: "Jack Thompson",
    contact_information: "+61 402 777 912",
    education: "Bachelor of Networking",
    major_field_of_study: "Network Engineering",
    years_of_experience: 4,
    work_experience: "Firewall policy updates, routing and switching, client network upgrades.",
    skills: "Routing, Switching, Firewalls, Documentation, Networking",
    preferred_working_mode: "On-site",
    preferred_location: "Melbourne, VIC",
  },
];

type MatchProfile = {
  [Key in keyof Omit<ProfileFormValues, "years_of_experience">]?: string | null;
} & {
  years_of_experience?: number | string | null;
};

export type MembershipTier = "free" | "premium";

export type JobAlertPreferences = {
  query: string;
  category: string;
  mode: string;
  experience: string;
};

export function isPremium(profile?: { membership_tier?: string | null } | null) {
  return profile?.membership_tier === "premium";
}

export async function listJobs() {
  const { data, error } = await supabase
    .from("job_posting")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Using seeded jobs because live postings could not be loaded:", error.message);
    return fakeJobs;
  }

  const liveJobs = (data ?? []) as JobPosting[];
  return [...getLocalJobs(), ...liveJobs, ...fakeJobs];
}

export async function createJob(job: Omit<JobPosting, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("job_posting")
    .insert(job)
    .select("*")
    .single();

  if (error) {
    const localJob: JobPosting = {
      ...job,
      id: `local-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
    };
    saveLocalJobs([localJob, ...getLocalJobs()]);
    return localJob;
  }

  return data as JobPosting;
}

export async function updateJob(jobId: string, patch: Partial<JobPosting>) {
  const localJobs = getLocalJobs();
  const localIndex = localJobs.findIndex((job) => getJobId(job) === jobId);

  if (localIndex >= 0) {
    const updated = { ...localJobs[localIndex], ...patch };
    localJobs.splice(localIndex, 1, updated);
    saveLocalJobs(localJobs);
    return updated;
  }

  const { data, error } = await supabase
    .from("job_posting")
    .update(patch)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data as JobPosting;
}

export async function deleteJob(jobId: string) {
  const localJobs = getLocalJobs();
  const nextLocalJobs = localJobs.filter((job) => getJobId(job) !== jobId);
  if (nextLocalJobs.length !== localJobs.length) {
    saveLocalJobs(nextLocalJobs);
    return;
  }

  const { error } = await supabase.from("job_posting").delete().eq("id", jobId);
  if (error) throw error;
}

export async function updateProfile(userId: string, values: ProfileFormValues) {
  const payload = {
    id: userId,
    full_name: values.full_name,
    contact_information: values.contact_information,
    education: values.education,
    major_field_of_study: values.major_field_of_study,
    years_of_experience: Number(values.years_of_experience || 0),
    work_experience: values.work_experience,
    skills: values.skills,
    preferred_working_mode: values.preferred_working_mode,
    preferred_location: values.preferred_location,
    resume_name: values.resume_name,
    resume_data: values.resume_data,
    company_name: values.company_name,
    company_website: values.company_website,
    company_description: values.company_description,
    company_location: values.company_location,
    membership_tier: values.membership_tier,
    job_alert_query: values.job_alert_query,
    job_alert_category: values.job_alert_category,
    job_alert_mode: values.job_alert_mode,
    job_alert_experience: values.job_alert_experience,
  };

  const { error } = await supabase.from("profiles").upsert(payload);
  if (error) throw error;
}

export async function updateMembership(userId: string, tier: MembershipTier) {
  const { error } = await supabase
    .from("profiles")
    .update({
      membership_tier: tier,
      membership_updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function updateJobAlertPreferences(userId: string, values: JobAlertPreferences) {
  const { error } = await supabase
    .from("profiles")
    .update({
      job_alert_query: values.query,
      job_alert_category: values.category,
      job_alert_mode: values.mode,
      job_alert_experience: values.experience,
    })
    .eq("id", userId);

  if (error) throw error;
}

export function getJobId(job: JobPosting) {
  return String(job.id ?? `${job.job_title}-${job.company_information}`);
}

export function getLocalJobs() {
  const stored = localStorage.getItem(localJobsStorageKey);
  return stored ? (JSON.parse(stored) as JobPosting[]) : [];
}

function saveLocalJobs(jobs: JobPosting[]) {
  localStorage.setItem(localJobsStorageKey, JSON.stringify(jobs));
}

export function listApplications() {
  const stored = localStorage.getItem(applicationStorageKey);
  return stored ? (JSON.parse(stored) as ApplicationRecord[]) : [];
}

export function hasApplied(jobId: string) {
  return listApplications().some((application) => application.job_id === jobId);
}

export async function applyToJob({
  jobId,
  candidateId,
  candidateName,
  candidateEmail,
  coverNote,
  resumeName,
  resumeData,
}: {
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  coverNote?: string;
  resumeName?: string;
  resumeData?: string;
}) {
  const record: ApplicationRecord = {
    id: crypto.randomUUID(),
    job_id: jobId,
    candidate_id: candidateId,
    candidate_name: candidateName,
    candidate_email: candidateEmail,
    applied_at: new Date().toISOString(),
    status: "Submitted",
    stage: "Applied",
    cover_note: coverNote,
    resume_name: resumeName,
    resume_data: resumeData,
    interview_time: "",
    interview_location: "",
    hr_document_name: "",
    hr_document_data: "",
  };

  const { error } = await supabase.from("applications").insert({
    id: record.id,
    job_id: jobId,
    candidate_id: candidateId,
    candidate_name: candidateName,
    candidate_email: candidateEmail,
    status: record.status,
    stage: record.stage,
    cover_note: coverNote,
    resume_name: resumeName,
    resume_data: resumeData,
    interview_time: "",
    interview_location: "",
    hr_document_name: "",
    hr_document_data: "",
  });

  if (error) {
    const existing = listApplications().filter((application) => application.job_id !== jobId);
    localStorage.setItem(applicationStorageKey, JSON.stringify([record, ...existing]));
    return record;
  }

  const existing = listApplications().filter((application) => application.job_id !== jobId);
  localStorage.setItem(applicationStorageKey, JSON.stringify([record, ...existing]));
  return record;
}

export function listApplicationsForJob(jobId: string) {
  return listApplications().filter((application) => application.job_id === jobId);
}

export function updateApplicationStage(applicationId: string, stage: HiringStage) {
  const applications = listApplications().map((application) =>
    application.id === applicationId
      ? {
          ...application,
          stage,
          status: stage === "Applied" ? "Submitted" : stage === "Rejected" || stage === "Withdrawn" ? "Reviewed" : "Shortlisted",
        }
      : application,
  );
  localStorage.setItem(applicationStorageKey, JSON.stringify(applications));
  void supabase
    .from("applications")
    .update({
      stage,
      status: stage === "Applied" ? "Submitted" : stage === "Rejected" || stage === "Withdrawn" ? "Reviewed" : "Shortlisted",
    })
    .eq("id", applicationId);
}

export function updateApplicationDetails(applicationId: string, patch: Partial<ApplicationRecord>) {
  const applications = listApplications().map((application) =>
    application.id === applicationId ? { ...application, ...patch } : application,
  );
  localStorage.setItem(applicationStorageKey, JSON.stringify(applications));
  void supabase.from("applications").update(patch).eq("id", applicationId);
  return applications.find((application) => application.id === applicationId);
}

export function getConversationId(employerId: string, candidateId: string) {
  return `conversation-${employerId}-${candidateId}`;
}

export function listMessages(userId?: string) {
  const stored = localStorage.getItem(messagesStorageKey);
  const messages = stored ? (JSON.parse(stored) as MessageRecord[]) : [];
  if (!userId) return [];

  return messages.filter((message) => {
    const visibleToParticipant = message.sender_id === userId || message.recipient_id === userId;
    const visibleToConversationParty = message.employer_id === userId || message.candidate_id === userId;
    return visibleToParticipant || visibleToConversationParty;
  });
}

export async function loadMessages(userId?: string) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("application_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Using local messages because live messages could not be loaded:", error.message);
    return listMessages(userId);
  }

  const liveMessages = ((data ?? []) as MessageRecord[]).filter((message) => {
    return (
      message.sender_id === userId ||
      message.recipient_id === userId ||
      message.employer_id === userId ||
      message.candidate_id === userId
    );
  });
  const localMessages = listMessages(userId);
  const messagesById = new Map([...liveMessages, ...localMessages].map((message) => [message.id, message]));

  return Array.from(messagesById.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function listMessagesForApplication(applicationId: string, userId?: string) {
  return listMessages(userId).filter((message) => message.application_id === applicationId);
}

export function sendMessage(message: Omit<MessageRecord, "id" | "created_at">) {
  const record: MessageRecord = {
    ...message,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  void supabase.from("application_messages").insert({
    id: record.id,
    application_id: record.application_id,
    conversation_id: record.conversation_id,
    job_id: record.job_id,
    sender_id: record.sender_id,
    sender_name: record.sender_name,
    recipient_id: record.recipient_id,
    recipient_name: record.recipient_name,
    employer_id: record.employer_id,
    employer_name: record.employer_name,
    candidate_id: record.candidate_id,
    candidate_name: record.candidate_name,
    body: record.body,
    attachment_name: record.attachment_name,
    attachment_data: record.attachment_data,
  });
  const messages = getStoredMessages();
  localStorage.setItem(messagesStorageKey, JSON.stringify([...messages, record]));
  return record;
}

export async function deleteMessage(messageId: string) {
  const messages = getStoredMessages().filter((message) => message.id !== messageId);
  localStorage.setItem(messagesStorageKey, JSON.stringify(messages));

  const { error } = await supabase.from("application_messages").delete().eq("id", messageId);
  if (error) throw error;
}

export async function deleteConversation(threadId: string) {
  const messages = getStoredMessages().filter((message) => {
    const messageThreadId = message.conversation_id || message.application_id;
    return messageThreadId !== threadId;
  });
  localStorage.setItem(messagesStorageKey, JSON.stringify(messages));

  const { error: conversationError } = await supabase
    .from("application_messages")
    .delete()
    .eq("conversation_id", threadId);
  if (conversationError) throw conversationError;

  const { error: legacyError } = await supabase
    .from("application_messages")
    .delete()
    .eq("application_id", threadId);
  if (legacyError) throw legacyError;
}

function getStoredMessages() {
  const stored = localStorage.getItem(messagesStorageKey);
  return stored ? (JSON.parse(stored) as MessageRecord[]) : [];
}

export function formatSalary(value: string) {
  const clean = value.replace(/[^\d,\-\s]/g, "").trim();
  return clean ? `$${clean}` : "";
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const addressSuggestions = [
  "Sydney, NSW",
  "Melbourne, VIC",
  "Brisbane, QLD",
  "Perth, WA",
  "Adelaide, SA",
  "Canberra, ACT",
  "Wollongong, NSW",
  "Newcastle, NSW",
  "Parramatta, NSW",
  "Remote - Australia",
];

export async function listCandidates() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("account_type", "employer");

  if (error) {
    console.warn("Using demo candidates because profiles could not be loaded:", error.message);
    return demoCandidates;
  }

  const candidates = ((data ?? []) as CandidateProfile[]).filter((candidate) => candidate.full_name);
  return candidates.length ? [...candidates, ...demoCandidates] : demoCandidates;
}

export function scoreJobMatch(job: JobPosting, profile?: MatchProfile | null) {
  if (!profile) return 0;

  let score = 0;
  const profileSkills = String(profile.skills ?? "").toLowerCase();
  const requiredSkills = job.required_skills.toLowerCase();
  const preferredMode = String(profile.preferred_working_mode ?? "").toLowerCase();
  const preferredLocation = String(profile.preferred_location ?? "").toLowerCase();
  const experience = Number(profile.years_of_experience ?? 0);

  for (const skill of requiredSkills.split(/[,;]+/).map((item) => item.trim())) {
    if (skill && profileSkills.includes(skill)) score += 18;
  }

  if (preferredMode && job.work_mode.toLowerCase().includes(preferredMode)) score += 20;
  if (preferredLocation && job.job_location.toLowerCase().includes(preferredLocation)) {
    score += 20;
  }
  if (experience >= Number(job.years_of_experience ?? 0)) score += 20;

  return Math.min(score, 100);
}

export function scoreCandidateMatch(candidate: CandidateProfile, job: JobPosting) {
  return scoreJobMatch(job, {
    skills: candidate.skills,
    preferred_working_mode: candidate.preferred_working_mode,
    preferred_location: candidate.preferred_location,
    years_of_experience: candidate.years_of_experience,
    education: candidate.education,
    major_field_of_study: candidate.major_field_of_study,
    work_experience: candidate.work_experience,
    full_name: candidate.full_name,
    contact_information: candidate.contact_information,
  });
}

export function fuzzyIncludes(value: string, query: string) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;

  const cleanValue = value.toLowerCase();
  if (cleanValue.includes(cleanQuery)) return true;

  const words = cleanQuery.split(/\s+/).filter(Boolean);
  return words.every((word) => fuzzyWordMatch(cleanValue, word));
}

export function fuzzyScore(value: string, query: string) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return 0;

  const cleanValue = value.toLowerCase();
  if (cleanValue.includes(cleanQuery)) return cleanQuery.length + 20;

  return cleanQuery
    .split(/\s+/)
    .filter(Boolean)
    .reduce((score, word) => score + bestWordScore(cleanValue, word), 0);
}

function fuzzyWordMatch(value: string, query: string) {
  return bestWordScore(value, query) >= Math.max(2, Math.floor(query.length * 0.55));
}

function bestWordScore(value: string, query: string) {
  const tokens = value.split(/[^a-z0-9+#.]+/).filter(Boolean);
  return tokens.reduce((best, token) => Math.max(best, similarityScore(token, query)), 0);
}

function similarityScore(value: string, query: string) {
  if (!value || !query) return 0;
  if (value.includes(query)) return query.length + 5;

  let score = 0;
  let queryIndex = 0;

  for (const char of value) {
    if (char === query[queryIndex]) {
      score += 1;
      queryIndex += 1;
    }
    if (queryIndex >= query.length) break;
  }

  const lengthPenalty = Math.abs(value.length - query.length) * 0.2;
  return score - lengthPenalty;
}
