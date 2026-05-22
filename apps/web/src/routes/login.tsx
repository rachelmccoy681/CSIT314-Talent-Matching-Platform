import { createFileRoute } from '@tanstack/react-router'
import { Auth } from './-components/auth'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Auth />
}