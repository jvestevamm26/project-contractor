import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjectsByClient } from "../api/projects";

function ClientDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getProjectsByClient(user.id)
            .then(setProjects)
            .catch(() => setError("Could not load your projects"))
            .finally(() => setLoading(false));
    }, [user.id]);

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <section>
            <h1>Your Projects</h1>
            <div className="dashboard-actions">
                <Link to="/services" className="btn btn-primary">Browse Services</Link>
            </div>
            <p className="muted">
                To post a project, open a service you like and click "Request this contractor."
            </p>

            {error && <p className="error">{error}</p>}

            {projects.length === 0 ? (
                <p>You haven't posted any projects yet.</p>
            ) : (
                <div className="card-grid">
                    {projects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="card">
                            <h2>{project.title}</h2>
                            <p className="muted">Status: {project.status} · {project.location}</p>
                            <p>{project.description}</p>
                            <p className="price">${project.price}</p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ClientDashboard;
