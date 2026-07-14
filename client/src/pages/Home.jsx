import { Link } from "react-router-dom";

function Home() {
    return (
        <section className="hero">
            <h1>Find the right contractor for your project</h1>
            <p>Browse services, post your project, and hire with confidence.</p>
            <div className="hero-actions">
                <Link to="/services" className="btn btn-primary">Browse Services</Link>
                <Link to="/register" className="btn btn-secondary">Get Started</Link>
            </div>
        </section>
    );
}

export default Home;
