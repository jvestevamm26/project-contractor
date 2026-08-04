import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById, getProjectImages, uploadProjectImage } from "../api/projects";
import { getProjectMessages } from "../api/messages";
import { API_BASE_URL } from "../api/client";
import { getSocket } from "../socket";
import { useAuth } from "../context/AuthContext";

function ProjectDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatError, setChatError] = useState("");
    const chatLogRef = useRef(null);

    useEffect(() => {
        getProjectById(id)
            .then(setProject)
            .catch(() => setError("Project not found"));

        getProjectImages(id).then(setImages).catch(() => setImages([]));
    }, [id]);

    useEffect(() => {
        const socket = getSocket();
        socket.connect();
        socket.emit("join_project", id);

        getProjectMessages(id).then(setMessages).catch(() => setMessages([]));

        const handleNewMessage = (message) => {
            if (String(message.project_id) === String(id)) {
                setMessages((current) => [...current, message]);
            }
        };

        const handleChatError = (payload) => {
            setChatError(payload.message);
        };

        socket.on("new_message", handleNewMessage);
        socket.on("chat_error", handleChatError);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("chat_error", handleChatError);
            socket.disconnect();
        };
    }, [id]);

    useEffect(() => {
        chatLogRef.current?.scrollTo(0, chatLogRef.current.scrollHeight);
    }, [messages]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        e.target.value = "";

        if (!file) return;

        setUploadError("");
        setUploading(true);

        try {
            const image = await uploadProjectImage(id, file);
            setImages((current) => [image, ...current]);
        } catch (err) {
            setUploadError(err.response?.data?.message || "Could not upload photo");
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!chatInput.trim()) return;

        setChatError("");
        getSocket().emit("send_message", { projectId: id, message: chatInput.trim() });
        setChatInput("");
    };

    if (error) return <p className="error">{error}</p>;
    if (!project) return <p>Loading...</p>;

    return (
        <section className="detail">
            <h1>{project.title}</h1>
            <p className="muted">Status: {project.status} · {project.location}</p>
            <p>{project.description}</p>
            <p className="price">${project.price}</p>

            <h2>Photos</h2>
            {images.length === 0 ? (
                <p>No photos uploaded yet.</p>
            ) : (
                <div className="card-grid">
                    {images.map((image) => (
                        <img
                            key={image.id}
                            src={`${API_BASE_URL}${image.image_url}`}
                            alt={image.description || "Project photo"}
                            className="project-photo"
                        />
                    ))}
                </div>
            )}

            <label className="chat-attach btn btn-secondary">
                {uploading ? "Uploading..." : "Add Photo"}
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} hidden />
            </label>
            {uploadError && <p className="error">{uploadError}</p>}

            <h2>Messages</h2>
            <div className="chat-log" ref={chatLogRef}>
                {messages.length === 0 && <p className="muted">No messages yet.</p>}
                {messages.map((message) => (
                    <div
                        className={`chat-bubble ${message.sender_id === user.id ? "chat-bubble-mine" : "chat-bubble-theirs"}`}
                        key={message.id}
                    >
                        {message.message}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
            {chatError && <p className="error">{chatError}</p>}
        </section>
    );
}

export default ProjectDetail;
