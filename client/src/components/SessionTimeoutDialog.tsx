import React, { useEffect, useRef, useState } from "react";
import LogoutDialog from "./LogoutDialog";

interface SessionTimeoutDialogProps {
  onLogout: () => void;
  timeoutMinutes?: number;
}

const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({ onLogout, timeoutMinutes = 5 }) => {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(timeoutMinutes * 60);
  const lastActivityRef = useRef(Date.now());

  // Reset timer on user activity
  useEffect(() => {
    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      setCountdown(timeoutMinutes * 60);
      if (open) setOpen(false);
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [open, timeoutMinutes]);

  // Countdown logic
  useEffect(() => {
    if (timer) clearInterval(timer);
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - lastActivityRef.current) / 1000);
      setCountdown(timeoutMinutes * 60 - diff);
      if (diff >= timeoutMinutes * 60) {
        setOpen(true);
        clearInterval(interval);
      }
    }, 1000);
    setTimer(interval);
    return () => clearInterval(interval);
  }, [timeoutMinutes]);

  // Handle dialog actions
  const handleStayConnected = () => {
    lastActivityRef.current = Date.now();
    setCountdown(timeoutMinutes * 60);
    setOpen(false);
  };
  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <LogoutDialog
      open={open}
      onConfirm={handleLogout}
      onCancel={handleStayConnected}
      title="Session Timeout"
      description={`You have been inactive for ${timeoutMinutes} minutes. Do you want to stay connected?`}
    />
  );
};

export default SessionTimeoutDialog;
