import { useState } from "react";
import { Link } from "react-router-dom";
import { askAssistant } from "../api/ai";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function toApiMessages(messages) {
    return messages.map((message) => {
        if (!message.imageDataUrl) {
            return { role: message.role, content: message.text };
        }

        return {
            role: message.role,
            content: [
                { type: "text", text: message.text || "What's wrong in this picture?" },
                { type: "image_url", image_url: { url: message.imageDataUrl } },
            ],
        };
    });
}

function Assistant() {
    const [messages, setMessages] = useState([]);
    const [matches, setMatches] = useState([]);
    const [resolved, setResolved] = useState(false);
    const [input, setInput] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        e.target.value = "";

        if (!file) return;

        if (file.size > MAX_IMAGE_BYTES) {
            setError("Image is too large (max 5MB)");
            return;
        }

        setError("");
        setImagePreview(await fileToDataUrl(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim() && !imagePreview) return;

        const userMessage = { role: "user", text: input, imageDataUrl: imagePreview || undefined };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput("");
        setImagePreview("");
        setError("");
        setLoading(true);

        try {
            const response = await askAssistant(toApiMessages(nextMessages));

            if (response.needs_more_info) {
                setMessages([...nextMessages, { role: "assistant", text: response.question }]);
                setMatches([]);
                setResolved(false);
            } else {
                const text = response.suggestions
                    ? `${response.explanation} Tip: ${response.suggestions}`
                    : response.explanation;
                setMessages([...nextMessages, { role: "assistant", text }]);
                setMatches(response.matches);
                setResolved(true);
            }
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
                Tell us what's going on (a photo helps) and we'll explain what's likely wrong and match you with the right kind of contractor.
            </p>

            <div className="chat-log">
                {messages.map((message, index) => (
                    <div className={`chat-bubble chat-bubble-${message.role}`} key={index}>
                        {message.imageDataUrl && (
                            <img src={message.imageDataUrl} alt="Attached problem" className="chat-image" />
                        )}
                        {message.text}
                    </div>
                ))}
                {loading && <div className="chat-bubble chat-bubble-assistant">Thinking...</div>}
            </div>

            {imagePreview && (
                <div className="chat-attachment-preview">
                    <img src={imagePreview} alt="Selected attachment" />
                    <button type="button" className="btn btn-secondary" onClick={() => setImagePreview("")}>
                        Remove photo
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="chat-input">
                <label className="chat-attach btn btn-secondary">
                    Add Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} hidden />
                </label>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={messages.length === 0 ? "e.g. My kitchen sink is leaking under the cabinet" : ""}
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
            {resolved && matches.length === 0 && !loading && (
                <p className="muted">No matching services posted yet for that category.</p>
            )}
        </section>
    );
}

export default Assistant;
