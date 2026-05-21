import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen';
import { useRouterContextState } from './lib/use-router-context-state';

import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase.ts'

const router = createRouter({
    routeTree,
    defaultPendingMs: 1000,
    defaultPreload: "intent",
    context:{
        role: null,
        login: () => {},
        logout: () => {},
        isAdmin: false,
        isClient: false,
        isAuthenticated: false
    }
});


declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

interface JobPosting {
    job_title: string;
    company_information: string;
    required_education_level: string;
    required_skills: string;
    years_of_experience: number;
    work_mode: string;
    job_location: string;
}

function App() {
    const [newJobPosting, setNewJobPosting] = useState({
        job_title: "",
        company_information: "",
        required_education_level: "",
        required_skills: "",
        years_of_experience: 0,
        work_mode: "",
        job_location: "",
    })

    const[jobPostings, setJobPostings] = useState<JobPosting[]>([]);

    const fetchJobPostings = async () => {
        const { error, data } = await supabase
        .from("job_posting")
        .select("*")
        .order("created_at",{ ascending: true });

        if (error) {
            console.error("Error adding task: ", error.message);
            return
        }

        console.log("data:")
        console.log(data)

        setJobPostings(data);
    };



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        await supabase.from("job_posting").insert(newJobPosting).single()
        const { error } = await supabase.from("job_posting").insert(newJobPosting).single();

        if (error) {
            console.error("Error adding task: ", error.message);
            return
        }

        setNewJobPosting({ 
            job_title: "",
            company_information: "",
            required_education_level: "",
            required_skills: "",
            years_of_experience: 0,
            work_mode: "",
            job_location: ""
        })
    }

    useEffect(() => {
        fetchJobPostings();
    }, []);

    console.log("jobPostings:")
    console.log(jobPostings)

    const routerContextState = useRouterContextState();

  return <RouterProvider router={router} context={routerContextState} />;
  
}

export default App
