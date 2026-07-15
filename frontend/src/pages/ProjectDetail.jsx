import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../api/projects";

function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getProjectById(id)
            .then(setProject)
            .catch(() => setError("Project not found"));
    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (!project) return <p>Loading...</p>;

    return (
        <section className="detail">
            <h1>{project.title}</h1>
            <p className="muted">Status: {project.status} · {project.location}</p>
            <p>{project.description}</p>
            <p className="price">${project.price}</p>
        </section>
    );
}

export default ProjectDetail;
