import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createProject } from "../api/projects";
import { useAuth } from "../context/AuthContext";

function CreateProject() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const contractorId = location.state?.contractorId;
    const serviceTitle = location.state?.serviceTitle;

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!contractorId) {
            navigate("/services", { replace: true });
        }
    }, [contractorId, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const project = await createProject({
                ...form,
                client_id: user.id,
                contractor_id: contractorId,
            });
            navigate(`/projects/${project.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Could not create project");
        } finally {
            setLoading(false);
        }
    };

    if (!contractorId) return null;

    return (
        <section className="form-page">
            <h1>Post a Project</h1>
            {serviceTitle && (
                <p className="muted">Requesting the contractor behind "{serviceTitle}"</p>
            )}
            <form onSubmit={handleSubmit}>
                <label>
                    Title
                    <input type="text" name="title" value={form.title} onChange={handleChange} required />
                </label>
                <label>
                    Description
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
                </label>
                <label>
                    Budget
                    <input type="number" name="price" value={form.price} onChange={handleChange} step="0.01" />
                </label>
                <label>
                    Location
                    <input type="text" name="location" value={form.location} onChange={handleChange} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Posting..." : "Post Project"}
                </button>
            </form>
        </section>
    );
}

export default CreateProject;
