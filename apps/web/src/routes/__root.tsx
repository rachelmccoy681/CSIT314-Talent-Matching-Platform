// Root directory. Basically the default page

import { Auth } from './-components/auth';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { NavigationBar } from './-components/navigationbar';
import { createRootRouteWithContext, Link } from '@tanstack/react-router';
import { NavLink } from './-components/nav-link';

// Test roles
export type UserRole = 'admin' | 'client' | null;
export type RouterContext = {
    role: UserRole;
    login: (role: "admin" | "client") => void;
    logout: () => void;
    isAdmin: boolean;
    isClient: boolean;
    isAuthenticated: boolean;
}


// export const Route = createRootRoute({
//   component: RootComponent,
// })

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent
});





function RootComponent() {

    // Find out whether the user is logged in
    const [session, setSession] = useState(null)
    const fetchSession = async () => {
        const currentSession = await supabase.auth.getSession()
        console.log(currentSession)
        setSession(currentSession.data.session)
    }

    useEffect(() => {
        fetchSession();

        const {data: authListener} = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        }
    }, [])

    // Define Logut function (thanks supabase)
    // const authLogout = async () => {
    //     await supabase.auth.signOut()
    // }
    
  return (
    <>
        <div className="container mx-auto max-w-xl">
            <div className="space-x-2">
                {session ? (
                    <NavigationBar />
                ) : (
                    <div className="space-x-2">

                        <Auth />            
                    </div>
                )}
            </div>
        </div>


            {/* // <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
            //     <h2>Create an account or sign in to an existing account</h2>
            //     <NavLink */}
            {/* //         className="button"
            //         to="/sign-in"
            //         style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
            //     >
            //         Login
            //     </NavLink> */}
            {/* //     <NavLink */}
            {/* //         className="button"
            //         to="/sign-up"
            //         style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
            //     >
            //         Signup
            //     </NavLink> */}
            {/* // </div> */}
    </>
  )
}
