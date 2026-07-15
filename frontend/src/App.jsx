import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import CreateService from "./pages/CreateService";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import CreateContractorProfile from "./pages/CreateContractorProfile";
import Assistant from "./pages/Assistant";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="services" element={<Services />} />
                <Route path="services/:id" element={<ServiceDetail />} />
                <Route
                    path="services/new"
                    element={
                        <ProtectedRoute>
                            <CreateService />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="projects/new"
                    element={
                        <ProtectedRoute>
                            <CreateProject />
                        </ProtectedRoute>
                    }
                />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="contractors/profile/new"
                    element={
                        <ProtectedRoute>
                            <CreateContractorProfile />
                        </ProtectedRoute>
                    }
                />
                <Route path="assistant" element={<Assistant />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
