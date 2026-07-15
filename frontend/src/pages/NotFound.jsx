import { Link } from "react-router-dom";

function NotFound() {
    return (
        <section className="form-page">
            <h1>Page not found</h1>
            <Link to="/">Back home</Link>
        </section>
    );
}

export default NotFound;
