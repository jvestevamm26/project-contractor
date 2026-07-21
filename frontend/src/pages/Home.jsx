import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
    const { user } = useAuth();

    return (
        <section className="hero">
            <h1>Find the right contractor for your project</h1>
            <p>Browse services, post your project, and hire with confidence.</p>
            <div className="hero-actions">
                {user ? (
                    <Link to="/services" className="btn btn-primary">Browse Services</Link>
                ) : (
                    <>
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                        <Link to="/login" className="btn btn-secondary">Log In</Link>
                    </>
                )}
            </div>
        </section>
    );
}

export default Home;
