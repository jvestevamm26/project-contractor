import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getServiceById } from "../api/services";

function ServiceDetail() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getServiceById(id)
            .then(setService)
            .catch(() => setError("Service not found"));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!service) return <p>Loading...</p>;

    return (
        <section className="detail">
            <h1>{service.title}</h1>
            <p className="muted">{service.category} · {service.location}</p>
            <p>{service.description}</p>
            <p className="price">${service.price}</p>
            <Link to="/projects/new" className="btn btn-primary">Request this contractor</Link>
        </section>
    );
}

export default ServiceDetail;
