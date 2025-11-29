import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function Dashboard() {
  const user = useContext(UserContext);

  return (
    <div className="text-center p-6">
      <h1 className="text-3xl font-bold">
        🎉 Welcome {user.firstname} ({user.role})
      </h1>
    </div>
  );
}

export default Dashboard;
