# Talent Match

Talent Match is a CSIT314 recruitment platform for candidates and employers. Candidates can create a profile, upload a resume, browse jobs, apply for roles, and message employers. Employers can post jobs, manage listings, review candidates, move applicants through hiring stages, book interviews, send HR documents, and message candidates in-app.

## Requirements

- Node.js
- npm
- A Supabase project

## Setup

Clone the repository, then install the web app dependencies:

```cmd
cd CSIT314-Talent-Matching-Platform-main\apps\web
npm install
```

Create a Supabase project and run the database schema in the Supabase SQL Editor:

```text
packages\db\schema.sql
```

Make sure the web app has the correct Supabase URL and anon key configured for your local setup.

## Run the website

From the web app folder:

Eiher,
Run Start.bat, or

```cmd
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/
```

Keep the terminal window open while using the website.

## Windows PowerShell issue

If Windows blocks `npm` with a PowerShell script execution error, run the command through Command Prompt, or use the npm command file directly:

```cmd
"C:\Program Files\nodejs\npm.cmd" run dev
```

## Useful commands

From `apps\web`:

```cmd
npm run build
```

```cmd
npm run lint
```
