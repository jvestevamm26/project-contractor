import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContractors } from "../api/contractors";

function Contractors() {
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getContractors()
            .then(setContractors)
            .catch(() => setError("Could not load contractors"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading contractors...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <section>
            <h1>Browse Contractors</h1>
            {contractors.length === 0 ? (
                <p>No contractors have set up a profile yet.</p>
            ) : (
                <div className="card-grid">
                    {contractors.map((contractor) => (
                        <Link to={`/contractors/${contractor.id}`} key={contractor.id} className="card">
                            <h2>{contractor.business_name}</h2>
                            <p className="muted">{contractor.skills}</p>
                            <p>{contractor.description}</p>
                            {contractor.hourly_rate && (
                                <p className="price">${contractor.hourly_rate}/hr</p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Contractors;
