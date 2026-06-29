import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Game from "./pages/Game";
import type { Team } from "./types/database";
import { fetchTeamById } from "./services/teamService";
import SparkleBackground from "./components/ui/SparkleBackground";
import { Spinner, Toast } from "@heroui/react";

function App() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(localStorage.getItem("teamId"));
  });

  useEffect(() => {
    const savedTeamId = localStorage.getItem("teamId");
    if (!savedTeamId) {
      return;
    }

    fetchTeamById(savedTeamId)
      .then((team) => {
        if (team) setTeam(team);
      })
      .catch((error) => {
        console.error("Failed to restore team from DB", error);
        localStorage.removeItem("teamId");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#F8F1E7" }}>
      <SparkleBackground
        backgroundColor="#B71234"
        sparkleColor="#ffffff"
        sparkleCount={140}
      />
      <Toast.Provider />
      <div className="relative z-10 min-h-screen">
        {loading ? (
          <div className="flex min-h-screen items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : !team ? (
          <Login onStart={setTeam} />
        ) : (
          <Game team={team} />
        )}
      </div>
    </div>
  );
}

export default App;