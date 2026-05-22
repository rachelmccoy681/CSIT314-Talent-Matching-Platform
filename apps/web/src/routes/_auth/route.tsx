import { supabase } from '@/utils/supabase'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'


const currentSession = await supabase.auth.getSession()
const session = currentSession.data.session

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    if (session) {
        throw redirect({
            to: "/login",
            search: {
                redirect: location.href
            }
        })
    }
  }
})

function RouteComponent() {
  return <Outlet />;
}
