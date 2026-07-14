import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createService } from "../api/services";
import { useAuth } from "../context/AuthContext";

function CreateService() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        contractor_id: "",
        title: "",
        category: "",
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
            const service = await createService(form);
            navigate(`/services/${service.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Could not create service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-page">
            <h1>Post a Service</h1>
            <p className="muted">
                Logged in as {user?.role}. Contractor profile lookup isn't wired up
                yet (Phase 4 dashboards) — enter your contractor profile ID manually for now.
            </p>
            <form onSubmit={handleSubmit}>
                <label>
                    Contractor Profile ID
                    <input type="number" name="contractor_id" value={form.contractor_id} onChange={handleChange} required />
                </label>
                <label>
                    Title
                    <input type="text" name="title" value={form.title} onChange={handleChange} required />
                </label>
                <label>
                    Category
                    <input type="text" name="category" value={form.category} onChange={handleChange} required />
                </label>
                <label>
                    Description
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
                </label>
                <label>
                    Price
                    <input type="number" name="price" value={form.price} onChange={handleChange} step="0.01" />
                </label>
                <label>
                    Location
                    <input type="text" name="location" value={form.location} onChange={handleChange} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Posting..." : "Post Service"}
                </button>
            </form>
        </section>
    );
}

export default CreateService;
