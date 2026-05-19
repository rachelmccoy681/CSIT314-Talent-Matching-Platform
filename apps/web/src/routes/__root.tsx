import { Outlet, createRootRoute } from '@tanstack/react-router'
import { NavLink } from './-components/nav-link'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="container mx-auto max-w-xl">
        <div className="space-x-2">
        
            <NavLink to='/'>Main Page</NavLink>
            <NavLink to='/about'>About Us</NavLink>
            <NavLink to='/contact-us'>Contact Us</NavLink>
            <NavLink to='/categories'>Categories</NavLink>
            <NavLink to='/search'>Search</NavLink>
        </div>
        <Outlet />
    </div>
  )
}
