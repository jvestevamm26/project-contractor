import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Contractors from "./pages/Contractors";
import ContractorDetail from "./pages/ContractorDetail";
import CreateService from "./pages/CreateService";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import CreateContractorProfile from "./pages/CreateContractorProfile";
import CreateReview from "./pages/CreateReview";
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
                <Route
                    path="services"
                    element={
                        <ProtectedRoute>
                            <Services />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="services/:id"
                    element={
                        <ProtectedRoute>
                            <ServiceDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="services/new"
                    element={
                        <ProtectedRoute role="contractor">
                            <CreateService />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="projects/new"
                    element={
                        <ProtectedRoute role="client">
                            <CreateProject />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="projects/:id"
                    element={
                        <ProtectedRoute>
                            <ProjectDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="projects/:id/review"
                    element={
                        <ProtectedRoute role="client">
                            <CreateReview />
                        </ProtectedRoute>
                    }
                />
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
                        <ProtectedRoute role="contractor">
                            <CreateContractorProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="contractors"
                    element={
                        <ProtectedRoute>
                            <Contractors />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="contractors/:id"
                    element={
                        <ProtectedRoute>
                            <ContractorDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="assistant"
                    element={
                        <ProtectedRoute>
                            <Assistant />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
