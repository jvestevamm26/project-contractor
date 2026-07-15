import { useState } from "react";
import { Link } from "react-router-dom";
import { askAssistant } from "../api/ai";

function Assistant() {
    const [messages, setMessages] = useState([]);
    const [matches, setMatches] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        const nextMessages = [...messages, { role: "user", content: input }];
        setMessages(nextMessages);
        setInput("");
        setError("");
        setLoading(true);

        try {
            const response = await askAssistant(nextMessages);
            setMessages([...nextMessages, { role: "assistant", content: response.explanation }]);
            setMatches(response.matches);
        } catch (err) {
            setError(err.response?.data?.message || "Could not reach the assistant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="assistant">
            <h1>Describe Your Problem</h1>
            <p className="muted">
                Tell us what's going on and we'll explain what's likely wrong and match you with the right kind of contractor.
            </p>

            <div className="chat-log">
                {messages.map((message, index) => (
                    <div className={`chat-bubble chat-bubble-${message.role}`} key={index}>
                        {message.content}
                    </div>
                ))}
                {loading && <div className="chat-bubble chat-bubble-assistant">Thinking...</div>}
            </div>

            <form onSubmit={handleSubmit} className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. My kitchen sink is leaking under the cabinet"
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    Send
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {matches.length > 0 && (
                <>
                    <h2>Matching Services</h2>
                    <div className="card-grid">
                        {matches.map((service) => (
                            <Link to={`/services/${service.id}`} key={service.id} className="card">
                                <h2>{service.title}</h2>
                                <p className="muted">{service.category} · {service.location}</p>
                                <p className="price">${service.price}</p>
                            </Link>
                        ))}
                    </div>
                </>
            )}
            {matches.length === 0 && messages.some((m) => m.role === "assistant") && !loading && (
                <p className="muted">No matching services posted yet for that category.</p>
            )}
        </section>
    );
}

export default Assistant;
