import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createContractorProfile } from "../api/contractors";
import { useAuth } from "../context/AuthContext";

function CreateContractorProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        business_name: "",
        phone: "",
        availability: "",
        description: "",
        skills: "",
        experience_years: "",
        hourly_rate: "",
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
            await createContractorProfile({ ...form, user_id: user.id });
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Could not create profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-page">
            <h1>Set Up Your Contractor Profile</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Business Name
                    <input type="text" name="business_name" value={form.business_name} onChange={handleChange} required />
                </label>
                <label>
                    Phone
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>
                    Availability
                    <input type="text" name="availability" value={form.availability} onChange={handleChange} placeholder="e.g. weekdays" />
                </label>
                <label>
                    Description
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
                </label>
                <label>
                    Skills
                    <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. plumbing, electrical" />
                </label>
                <label>
                    Years of Experience
                    <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} min="0" />
                </label>
                <label>
                    Hourly Rate
                    <input type="number" name="hourly_rate" value={form.hourly_rate} onChange={handleChange} step="0.01" min="0" />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Profile"}
                </button>
            </form>
        </section>
    );
}

export default CreateContractorProfile;
