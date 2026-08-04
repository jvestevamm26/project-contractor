import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getContractorById } from "../api/contractors";
import { getServicesByContractor } from "../api/services";
import { getReviewsByContractor } from "../api/reviews";

function ContractorDetail() {
    const { id } = useParams();
    const [contractor, setContractor] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getContractorById(id)
            .then(setContractor)
            .catch(() => setError("Contractor not found"));

        getServicesByContractor(id).then(setServices).catch(() => setServices([]));
        getReviewsByContractor(id).then(setReviews).catch(() => setReviews([]));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!contractor) return <p>Loading...</p>;

    const averageRating = reviews.length
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <section className="detail">
            <h1>{contractor.business_name}</h1>
            <p className="muted">
                {contractor.skills} · {contractor.experience_years ? `${contractor.experience_years} yrs experience` : ""}
            </p>
            <p>{contractor.description}</p>
            {contractor.hourly_rate && <p className="price">${contractor.hourly_rate}/hr</p>}
            {contractor.phone && <p className="muted">Phone: {contractor.phone}</p>}
            {contractor.availability && <p className="muted">Availability: {contractor.availability}</p>}

            <h2>Services</h2>
            {services.length === 0 ? (
                <p>No services posted yet.</p>
            ) : (
                <div className="card-grid">
                    {services.map((service) => (
                        <Link to={`/services/${service.id}`} key={service.id} className="card">
                            <h2>{service.title}</h2>
                            <p className="muted">{service.category} · {service.location}</p>
                            <p className="price">${service.price}</p>
                        </Link>
                    ))}
                </div>
            )}

            <h2>Reviews {averageRating && `(${averageRating} avg, ${reviews.length} review${reviews.length === 1 ? "" : "s"})`}</h2>
            {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <ul>
                    {reviews.map((review) => (
                        <li key={review.id}>
                            <strong>{review.rating}/5</strong> — {review.comment}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ContractorDetail;
