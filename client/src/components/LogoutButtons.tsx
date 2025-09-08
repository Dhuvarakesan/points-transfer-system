import { Button } from "@/components/ui/button";
import { AppDispatch } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { LogOut } from "lucide-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import LogoutDialog from "./LogoutDialog";
import SessionTimeoutDialog from "./SessionTimeoutDialog";

interface LogoutButtonsProps {
  onSessionLogout?: () => void;
}

const LogoutButtons: React.FC<LogoutButtonsProps> = ({ onSessionLogout }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [sessionLogout, setSessionLogout] = useState(false);

  // Handler for normal logout
  const handleLogout = () => {
    setLogoutDialogOpen(false);
    dispatch(logoutUser());
  };

  // Handler for session logout
  const handleSessionLogout = () => {
    setSessionLogout(false);
    if (onSessionLogout) onSessionLogout();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setLogoutDialogOpen(true)}>
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:block">Logout</span>
      </Button>
      {/* <Button variant="destructive" onClick={() => setSessionLogout(true)}>
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:block">Session Logout</span>
      </Button> */}
      <LogoutDialog
        open={logoutDialogOpen}
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
      <SessionTimeoutDialog
        onLogout={handleSessionLogout}
        timeoutMinutes={5}
        // Only show dialog when sessionLogout is true
      />
    </div>
  );
};

export default LogoutButtons;
