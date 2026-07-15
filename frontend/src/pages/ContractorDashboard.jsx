import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getContractorProfileByUserId } from "../api/contractors";
import { getServicesByContractor } from "../api/services";
import { getProjectsByContractor, updateProjectStatus } from "../api/projects";

function ContractorDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getContractorProfileByUserId(user.id)
            .then(async (fetchedProfile) => {
                setProfile(fetchedProfile);
                const [contractorServices, contractorProjects] = await Promise.all([
                    getServicesByContractor(fetchedProfile.id),
                    getProjectsByContractor(fetchedProfile.id),
                ]);
                setServices(contractorServices);
                setProjects(contractorProjects);
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [user.id]);

    const handleStatusChange = async (projectId, status) => {
        const updated = await updateProjectStatus(projectId, status);
        setProjects((current) =>
            current.map((project) => (project.id === updated.id ? updated : project))
        );
    };

    if (loading) return <p>Loading dashboard...</p>;

    if (!profile) {
        return (
            <section className="form-page">
                <h1>Set Up Your Profile</h1>
                <p className="muted">
                    You need a contractor profile before you can post services or receive projects.
                </p>
                <Link to="/contractors/profile/new" className="btn btn-primary">
                    Create Contractor Profile
                </Link>
            </section>
        );
    }

    return (
        <section>
            <h1>{profile.business_name}</h1>
            <p className="muted">{profile.skills} · {profile.experience_years} yrs experience · ${profile.hourly_rate}/hr</p>

            <h2>Your Services</h2>
            <Link to="/services/new" className="btn btn-secondary">Post a New Service</Link>
            {services.length === 0 ? (
                <p>You haven't posted any services yet.</p>
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

            <h2>Project Requests</h2>
            {projects.length === 0 ? (
                <p>No project requests yet.</p>
            ) : (
                <div className="card-grid">
                    {projects.map((project) => (
                        <div className="card" key={project.id}>
                            <h2>{project.title}</h2>
                            <p className="muted">Status: {project.status} · {project.location}</p>
                            <p>{project.description}</p>
                            <p className="price">${project.price}</p>
                            {project.status === "pending" && (
                                <div className="card-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleStatusChange(project.id, "accepted")}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => handleStatusChange(project.id, "declined")}
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ContractorDashboard;
