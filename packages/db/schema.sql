create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.profiles add column if not exists account_type text default 'candidate';
alter table public.profiles add column if not exists role text default 'candidate';
alter table public.profiles add column if not exists full_name text default '';
alter table public.profiles add column if not exists contact_information text;
alter table public.profiles add column if not exists education text;
alter table public.profiles add column if not exists major_field_of_study text;
alter table public.profiles add column if not exists years_of_experience numeric default 0;
alter table public.profiles add column if not exists work_experience text;
alter table public.profiles add column if not exists skills text;
alter table public.profiles add column if not exists preferred_working_mode text;
alter table public.profiles add column if not exists preferred_location text;
alter table public.profiles add column if not exists resume_name text;
alter table public.profiles add column if not exists resume_data text;
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists company_website text;
alter table public.profiles add column if not exists company_description text;
alter table public.profiles add column if not exists company_location text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

update public.profiles
set account_type = coalesce(nullif(account_type, ''), nullif(role, ''), 'candidate'),
    role = coalesce(nullif(role, ''), nullif(account_type, ''), 'candidate');

create table if not exists public.job_posting (
  id uuid primary key default gen_random_uuid(),
  job_title text not null,
  company_information text not null,
  required_education_level text not null,
  required_skills text not null,
  years_of_experience numeric default 0,
  work_mode text not null,
  job_location text not null
);

alter table public.job_posting add column if not exists employer_id uuid references public.profiles(id) on delete set null;
alter table public.job_posting add column if not exists category text default 'Software Engineering';
alter table public.job_posting add column if not exists description text default '';
alter table public.job_posting add column if not exists salary_range text;
alter table public.job_posting add column if not exists employment_type text default 'Full-time';
alter table public.job_posting add column if not exists benefits text;
alter table public.job_posting add column if not exists created_at timestamptz default now();
alter table public.job_posting add column if not exists updated_at timestamptz default now();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id text not null,
  candidate_id text not null,
  status text default 'Submitted',
  cover_note text,
  created_at timestamptz default now(),
  unique (job_id, candidate_id)
);

alter table public.applications add column if not exists stage text default 'Applied';
alter table public.applications add column if not exists candidate_name text;
alter table public.applications add column if not exists candidate_email text;
alter table public.applications add column if not exists resume_name text;
alter table public.applications add column if not exists resume_data text;
alter table public.applications add column if not exists interview_time text;
alter table public.applications add column if not exists interview_location text;
alter table public.applications add column if not exists hr_document_name text;
alter table public.applications add column if not exists hr_document_data text;

create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),
  application_id text not null,
  job_id text not null,
  sender_id text not null,
  sender_name text not null,
  recipient_id text not null,
  body text not null,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    account_type,
    role,
    full_name,
    contact_information,
    education,
    major_field_of_study,
    years_of_experience,
    work_experience,
    skills,
    preferred_working_mode,
    preferred_location,
    resume_name,
    resume_data,
    company_name,
    company_website,
    company_description,
    company_location
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'account_type', new.raw_user_meta_data ->> 'role', 'candidate'),
    coalesce(new.raw_user_meta_data ->> 'account_type', new.raw_user_meta_data ->> 'role', 'candidate'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'contact_information',
    new.raw_user_meta_data ->> 'education',
    new.raw_user_meta_data ->> 'major_field_of_study',
    coalesce(nullif(new.raw_user_meta_data ->> 'years_of_experience', '')::numeric, 0),
    new.raw_user_meta_data ->> 'work_experience',
    new.raw_user_meta_data ->> 'skills',
    new.raw_user_meta_data ->> 'preferred_working_mode',
    new.raw_user_meta_data ->> 'preferred_location',
    new.raw_user_meta_data ->> 'resume_name',
    new.raw_user_meta_data ->> 'resume_data',
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'company_website',
    new.raw_user_meta_data ->> 'company_description',
    new.raw_user_meta_data ->> 'company_location'
  )
  on conflict (id) do update set
    account_type = excluded.account_type,
    role = excluded.role,
    full_name = excluded.full_name,
    contact_information = excluded.contact_information,
    education = excluded.education,
    major_field_of_study = excluded.major_field_of_study,
    years_of_experience = excluded.years_of_experience,
    work_experience = excluded.work_experience,
    skills = excluded.skills,
    preferred_working_mode = excluded.preferred_working_mode,
    preferred_location = excluded.preferred_location,
    resume_name = excluded.resume_name,
    resume_data = excluded.resume_data,
    company_name = excluded.company_name,
    company_website = excluded.company_website,
    company_description = excluded.company_description,
    company_location = excluded.company_location,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.job_posting enable row level security;
alter table public.applications enable row level security;
alter table public.application_messages enable row level security;

alter table public.application_messages add column if not exists attachment_name text;
alter table public.application_messages add column if not exists attachment_data text;
alter table public.application_messages add column if not exists conversation_id text;
alter table public.application_messages add column if not exists recipient_name text;
alter table public.application_messages add column if not exists employer_id text;
alter table public.application_messages add column if not exists employer_name text;
alter table public.application_messages add column if not exists candidate_id text;
alter table public.application_messages add column if not exists candidate_name text;

drop policy if exists "Profiles are readable by signed-in users" on public.profiles;
create policy "Profiles are readable by signed-in users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles for delete
to authenticated
using (auth.uid() = id);

drop policy if exists "Job postings are readable by signed-in users" on public.job_posting;
create policy "Job postings are readable by signed-in users"
on public.job_posting for select
to authenticated
using (true);

drop policy if exists "Signed-in users can create job postings" on public.job_posting;
create policy "Signed-in users can create job postings"
on public.job_posting for insert
to authenticated
with check (true);

drop policy if exists "Employers can update own job postings" on public.job_posting;
create policy "Employers can update own job postings"
on public.job_posting for update
to authenticated
using (employer_id = auth.uid() or employer_id is null)
with check (employer_id = auth.uid());

drop policy if exists "Employers can delete own job postings" on public.job_posting;
create policy "Employers can delete own job postings"
on public.job_posting for delete
to authenticated
using (employer_id = auth.uid() or employer_id is null);

drop policy if exists "Applications are readable by signed-in users" on public.applications;
create policy "Applications are readable by signed-in users"
on public.applications for select
to authenticated
using (true);

drop policy if exists "Candidates can create applications" on public.applications;
create policy "Candidates can create applications"
on public.applications for insert
to authenticated
with check (candidate_id = auth.uid()::text);

drop policy if exists "Signed-in users can update applications" on public.applications;
create policy "Signed-in users can update applications"
on public.applications for update
to authenticated
using (true)
with check (true);

drop policy if exists "Messages are readable by signed-in users" on public.application_messages;
drop policy if exists "Message participants can read messages" on public.application_messages;
create policy "Message participants can read messages"
on public.application_messages for select
to authenticated
using (
  sender_id = auth.uid()::text
  or recipient_id = auth.uid()::text
  or employer_id = auth.uid()::text
  or candidate_id = auth.uid()::text
);

drop policy if exists "Signed-in users can create messages" on public.application_messages;
drop policy if exists "Message senders can create messages" on public.application_messages;
create policy "Message senders can create messages"
on public.application_messages for insert
to authenticated
with check (
  sender_id = auth.uid()::text
  and recipient_id is not null
);

drop policy if exists "Message participants can delete messages" on public.application_messages;
create policy "Message participants can delete messages"
on public.application_messages for delete
to authenticated
using (
  sender_id = auth.uid()::text
  or recipient_id = auth.uid()::text
  or employer_id = auth.uid()::text
  or candidate_id = auth.uid()::text
);
