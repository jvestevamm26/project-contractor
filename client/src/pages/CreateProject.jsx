import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/projects";
import { useAuth } from "../context/AuthContext";

function CreateProject() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        client_id: user?.id || "",
        contractor_id: "",
        title: "",
        description: "",
        price: "",
        location: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const project = await createProject(form);
            navigate(`/projects/${project.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Could not create project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-page">
            <h1>Post a Project</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Your Client ID
                    <input type="number" name="client_id" value={form.client_id} onChange={handleChange} required />
                </label>
                <label>
                    Contractor Profile ID
                    <input type="number" name="contractor_id" value={form.contractor_id} onChange={handleChange} required />
                </label>
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
