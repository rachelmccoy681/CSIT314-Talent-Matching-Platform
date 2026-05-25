import { useAuth } from "@/lib/auth";
import { getAccountType } from "@/lib/view-mode";
import { createRootRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import type { ReactNode } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const accountType = getAccountType(user, profile);
  const isEmployer = accountType === "employer";

  async function switchAccountType() {
    window.sessionStorage.setItem("talentmatch-login-prompt", isEmployer ? "candidate" : "employer");
    await signOut();
    navigate({ to: "/sign-in" });
  }

  async function signOutAndRedirect() {
    await signOut();
    navigate({ to: "/sign-in" });
  }

  useEffect(() => {
    const publicPaths = new Set(["/", "/sign-in", "/sign-up"]);
    if (!loading && !user && !publicPaths.has(location.pathname)) {
      navigate({ to: "/sign-in" });
    }
  }, [loading, location.pathname, navigate, user]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="text-xl font-black text-slate-950">
            TalentMatch
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
              CSIT314
            </span>
          </Link>

          {!loading && (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {user ? (
                <>
                  <nav className="flex flex-wrap items-center gap-2 text-sm">
                    <NavItem to="/">Dashboard</NavItem>
                    <NavItem to="/jobs">Job listings</NavItem>
                    {!isEmployer ? <NavItem to="/matches">Matches</NavItem> : null}
                    {!isEmployer ? <NavItem to="/applications">Applications</NavItem> : null}
                    {isEmployer ? <NavItem to="/employer">Post a job</NavItem> : null}
                    {isEmployer ? <NavItem to="/employer/listings">Manage listings</NavItem> : null}
                    {isEmployer ? <NavItem to="/candidates">Find candidates</NavItem> : null}
                    {isEmployer ? <NavItem to="/hiring">Hiring</NavItem> : null}
                    <NavItem to="/messages">Messages</NavItem>
                  </nav>
                  <div className="account-actions">
                    <button className="button-secondary" type="button" onClick={switchAccountType}>
                      {isEmployer ? "Switch to Candidate" : "Switch to Employer"}
                    </button>
                    <details className="profile-menu">
                      <summary className="profile-avatar" aria-label="Open profile menu">
                        {(profile?.full_name || user.email || "U").slice(0, 1).toUpperCase()}
                      </summary>
                      <div className="profile-menu-panel">
                        <p className="profile-menu-name">{profile?.full_name || "TalentMatch user"}</p>
                        <p className="muted-text">{user.email}</p>
                        <Link className="profile-menu-link" to="/profile">
                          Profile
                        </Link>
                        <Link className="profile-menu-link" to="/settings">
                          Settings
                        </Link>
                      </div>
                    </details>
                    <button className="button-secondary" onClick={signOutAndRedirect}>
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <nav className="flex flex-wrap items-center gap-2 text-sm">
                  <NavItem to="/sign-in">Sign in</NavItem>
                  <Link className="button-primary" to="/sign-up">
                    Create account
                  </Link>
                </nav>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? <div className="panel">Loading your workspace...</div> : <Outlet />}
      </main>

      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </div>
  );
}

type AppRoutePath =
  | "/"
  | "/jobs"
  | "/matches"
  | "/applications"
  | "/employer"
  | "/employer/listings"
  | "/candidates"
  | "/hiring"
  | "/messages"
  | "/profile"
  | "/settings"
  | "/sign-in";

function NavItem({ to, children }: { to: AppRoutePath; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="nav-link"
      activeOptions={{ exact: true }}
      activeProps={{ className: "nav-link nav-link-active" }}
    >
      {children}
    </Link>
  );
}
