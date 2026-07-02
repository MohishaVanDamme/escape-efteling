import { useState } from "react";
import Sidebar from "./Sidebar";
import { Teams } from "./Teams";
import { Leaderboard } from "./Leaderboard";
import { Button, Drawer } from "@heroui/react";
import { Bars } from "@gravity-ui/icons";
import { SecretWord } from "./SecretWord";

export default function AdminDashboard({ handleLogout }: { handleLogout: () => Promise<void>; }) {
  const [activePage, setActivePage] = useState("teams");

  return (
    <div className="w-full">
      {/* Mobile top bar */}
      <div className="md:hidden flex flex-col  p-2">
        <Drawer>
          <Button variant="secondary">
            <Bars />
          </Button>
          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog className="bg-accent">
                <Drawer.CloseTrigger />
                <Drawer.Body>
                  <Sidebar
                    handleLogout={handleLogout}
                    activePage={activePage}
                    setActivePage={setActivePage}
                  />
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
      {/* Desktop sidebar */}
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar
            handleLogout={handleLogout}
            activePage={activePage}
            setActivePage={setActivePage}
          />
        </div>
        <div className="w-full">
          {activePage === "teams" && <Teams />}
          {activePage === "leaderboard" && <Leaderboard />}
          {activePage === "secret-word" && <SecretWord />}
        </div>
      </div>
    </div>
  )
}