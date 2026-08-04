import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReview } from "../api/reviews";

function CreateReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ rating: "5", comment: "" });
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
            await createReview({
                project_id: id,
                rating: Number(form.rating),
                comment: form.comment,
            });
            navigate(`/projects/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Could not submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="form-page">
            <h1>Leave a Review</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Rating
                    <select name="rating" value={form.rating} onChange={handleChange}>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Below Average</option>
                        <option value="1">1 - Poor</option>
                    </select>
                </label>
                <label>
                    Comment
                    <textarea name="comment" value={form.comment} onChange={handleChange} rows={4} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Review"}
                </button>
            </form>
        </section>
    );
}

export default CreateReview;
