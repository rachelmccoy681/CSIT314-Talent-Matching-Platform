import { getCities } from '@/lib/mock';
import { createFileRoute, Link, notFound, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/contact-us/$country')({
  component: RouteComponent,
  loader: async ({ params: { country } }) => {
    const cities = await getCities(country);
    if (cities.length === 0) {
        throw notFound();
    }
    return { cities };
  },
  pendingComponent: () => <div>Cities are loading...</div>
})

function RouteComponent() {
    const { cities } = Route.useLoaderData();

    return (
        <div className="space-y-3">
            <h2 className="heading">Cities:</h2>
            <div className="list">
                {cities.map((city) => (
                    <Link
                        className="card"
                        activeProps={{ className: "active-card" }}
                        from="/contact-us/$country"
                        to="/contact-us/$country/$city"
                        params={{
                            city
                        }}
                        key={city}
                    >
                        <span className="title">{city}</span>
                    </Link>
                ))}
            </div>
            <Outlet />
        </div>
    );
}
