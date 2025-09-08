import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import React from "react";

interface LogoutDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ open, onConfirm, onCancel, title = "Logout", description = "Are you sure you want to logout?" }) => (
  <Dialog open={open} onOpenChange={open => !open && onCancel()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>
          <LogOut className="w-4 h-4 mr-2" />Logout
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default LogoutDialog;
