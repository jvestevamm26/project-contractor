import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <Link to="/" className="brand">Project Contractor</Link>
            <nav>
                {user ? (
                    <>
                        <Link to="/services">Browse Services</Link>
                        <Link to="/assistant">AI Assistant</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <button type="button" onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Log in</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
