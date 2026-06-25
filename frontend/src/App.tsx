import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Game from "./pages/Game";
import type { Team } from "./types/database";
import { fetchTeamById } from "./services/teamService";

function App() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTeamId = localStorage.getItem("teamId");
    if (!savedTeamId) {
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;

  if (!team) return <Login onStart={setTeam} />;

  return <Game team={team} />;
}

export default App;