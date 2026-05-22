import { supabase } from "@/utils/supabase";
import { NavLink } from "./nav-link";
import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const authLogout = async () => {
    await supabase.auth.signOut()
}

export const NavigationBar = () => {
    return (
        <div className="container mx-auto max-w-xl">
            <div className="space-x-2">
            
                <NavLink to='/'>Home Page</NavLink>
                <NavLink to='/search'>Search</NavLink>
                {/* {isClient && <NavLink to="/client">Account</NavLink>}
                {isAdmin && <NavLink to="/admin">Admin</NavLink>} */}
                
                <button
                    className="button"
                    onClick={authLogout}
                >Log Out</button>

                {/* {isAuthenticated ? (
                    <button
                        className="button"
                        onClick={() => {
                            logout();
                            navigate({ to: "/login", search: { redirect: location.href } });
                        }}
                    >
                        Sign out
                    </button> */}
                
                

            </div>

            <Outlet />
            <TanStackRouterDevtools />
            
        </div>
    )
}
