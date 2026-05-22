import { createFileRoute } from '@tanstack/react-router'
import { Auth } from './-components/auth'

export const Route = createFileRoute('/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      <Auth />
    </div>
  )
}
