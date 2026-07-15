import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("token");
        return stored ? decodeToken(stored) : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            setUser(decodeToken(token));
        } else {
            localStorage.removeItem("token");
            setUser(null);
        }
    }, [token]);

    const login = async (credentials) => {
        const result = await loginUser(credentials);
        setToken(result.token);
        return result;
    };

    const register = (data) => registerUser(data);

    const logout = () => setToken(null);

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
