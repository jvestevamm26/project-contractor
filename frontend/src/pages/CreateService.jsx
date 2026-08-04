import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createService } from "../api/services";
import { getContractorProfileByUserId } from "../api/contractors";
import { useAuth } from "../context/AuthContext";

function CreateService() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [form, setForm] = useState({
        title: "",
        category: "",
        description: "",
        price: "",
        location: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getContractorProfileByUserId(user.id)
            .then(setProfile)
            .catch(() => setProfile(null))
            .finally(() => setProfileLoading(false));
    }, [user.id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const service = await createService({ ...form, contractor_id: profile.id });
            navigate(`/services/${service.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Could not create service");
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading) return <p>Loading...</p>;

    if (!profile) {
        return (
            <section className="form-page">
                <h1>Set Up Your Profile</h1>
                <p className="muted">
                    You need a contractor profile before you can post a service.
                </p>
                <Link to="/contractors/profile/new" className="btn btn-primary">
                    Create Contractor Profile
                </Link>
            </section>
        );
    }

    return (
        <section className="form-page">
            <h1>Post a Service</h1>
            <form onSubmit={handleSubmit}>
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
                    <input type="number" name="price" value={form.price} onChange={handleChange} step="0.01" min="0" />
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
