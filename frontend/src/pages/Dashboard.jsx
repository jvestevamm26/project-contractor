import { useAuth } from "../context/AuthContext";
import ContractorDashboard from "./ContractorDashboard";
import ClientDashboard from "./ClientDashboard";

function Dashboard() {
    const { user } = useAuth();

    if (user.role === "contractor") {
        return <ContractorDashboard />;
    }

    return <ClientDashboard />;
}

export default Dashboard;
