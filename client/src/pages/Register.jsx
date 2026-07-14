import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "client",
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
            await register(form);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-page">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name
                    <input type="text" name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
                </label>
                <label>
                    I am a
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="client">Client — hiring for a project</option>
                        <option value="contractor">Contractor — offering services</option>
                    </select>
                </label>
                <label>
                    Location
                    <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="City, State" />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </section>
    );
}

export default Register;
