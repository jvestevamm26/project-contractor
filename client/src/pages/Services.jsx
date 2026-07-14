import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getServices } from "../api/services";

function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getServices()
            .then(setServices)
            .catch(() => setError("Could not load services"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading services...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <section>
            <h1>Browse Services</h1>
            {services.length === 0 ? (
                <p>No services posted yet.</p>
            ) : (
                <div className="card-grid">
                    {services.map((service) => (
                        <Link to={`/services/${service.id}`} key={service.id} className="card">
                            <h2>{service.title}</h2>
                            <p className="muted">{service.category} · {service.location}</p>
                            <p>{service.description}</p>
                            <p className="price">${service.price}</p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Services;
