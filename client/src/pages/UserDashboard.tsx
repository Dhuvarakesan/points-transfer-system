import CelebrationAnimation from "@/components/CelebrationAnimation";
import LogoutButtons from "@/components/LogoutButtons";
import SessionTimeoutDialog from "@/components/SessionTimeoutDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/store";
import { logoutUser, updateUserPoints } from "@/store/slices/authSlice";
import {
  fetchTransactions,
  transferPoints,
} from "@/store/slices/transactionsSlice";
import {
  fetchUserPoints,
  fetchUsers,
  resetAnimation,
  updateUserPoints as updateOtherUserPoints
} from "@/store/slices/usersSlice";
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  CreditCard,
  RefreshCw,
  Search,
  Send,
  TrendingDown
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from '../components/Loader';

const UserDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users, showBalanceAnimation, balanceChangeAmount, lastPolledBalance, balanceChangeType } = useSelector((state: RootState) => state.users);
  const { transactions, isLoading } = useSelector((state: RootState) => state.transactions);
  // Transaction filter state
  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "sent" | "received"
  >("all");
  // Show celebration animation only once per session
  const [showCelebration, setShowCelebration] = useState(() => {
    return !window.localStorage.getItem("dashboardCelebrationShown");
  });
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showBalancePreview, setShowBalancePreview] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  // Transaction search state
  const [transactionSearch, setTransactionSearch] = useState("");
  const [amountSearch, setAmountSearch] = useState("");
  const [isSendingNOX, setIsSendingNOX] = useState(false);
  const [showTransferAnimation, setShowTransferAnimation] = useState(false)

  // Live data state
  // Poll live data APIs every 1 minute (not every 1s, to avoid duplicate polling)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const fetchLiveData = async () => {
      try {
        dispatch(fetchTransactions(user._id));
        dispatch(fetchUsers({ page: 1 }));
        // Fetch user NOX balance for polling/animation
        if (user?._id) {
          dispatch(fetchUserPoints(user._id));
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    if (user) {
      fetchLiveData();
      intervalId = setInterval(fetchLiveData, 60000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dispatch, user]);


  useEffect(()=>{
    if(showBalanceAnimation){
  setShowTransferAnimation(true)
}
  },[showBalanceAnimation, balanceChangeType])



  const transferAmountNum = parseInt(transferAmount) || 0;
  const newBalance = user ? user.nox_balance - transferAmountNum : 0;
  const isValidTransfer =
    transferAmountNum > 0 &&
    transferAmountNum <= (user?.nox_balance || 0) &&
    selectedRecipient;

  // Show balance preview when amount is entered
  React.useEffect(() => {
    setShowBalancePreview(transferAmountNum > 0);
  }, [transferAmountNum]);






  // Hide celebration after animation completes
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    window.localStorage.setItem("dashboardCelebrationShown", "true");
  };


  const filteredUsers = users.filter(
    (u) =>
      u._id !== user?._id &&
      u.status === "active" &&
      u.role === "user" &&
      (u.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(recipientSearch.toLowerCase()))
  );

  const userTransactions = Array.isArray(transactions) ? transactions : [];
  const sentTransactions = userTransactions.filter(
    (t) => t.senderId === user?._id
  );
  const receivedTransactions = userTransactions.filter(
    (t) => t.receiverId === user?._id
  );

  // Filtered transactions for table
  const filteredTransactions = (
    transactionFilter === "all"
      ? userTransactions
      : transactionFilter === "sent"
      ? sentTransactions
      : receivedTransactions
  ).filter((transaction) => {
    // Filter by user name/email
    const counterpart =
      transaction.senderId === user._id
        ? transaction.receiverName + " " + (transaction.receiverId || "")
        : transaction.senderName;
    const matchesUser = (counterpart ?? "")

      .toLowerCase()
      .includes(transactionSearch.toLowerCase());
    // Filter by amount
    const matchesAmount = amountSearch
      ? transaction.amount.toString().includes(amountSearch)
      : true;
    return matchesUser && matchesAmount;
  });

  const handleTransfer = async () => {

    setIsSendingNOX(true); // Show loader
  
    // console.log("transfer", transfer, user);
    if (!user || transferAmountNum <= 0 || !selectedRecipient?._id) {
      toast({
        title: "Error",
        description: "Please fill all fields correctly",
        variant: "destructive",
      });
      setIsSendingNOX(false); // Hide loader
      return;
    }

    if (transferAmountNum > user.nox_balance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      setIsSendingNOX(false); // Hide loader
      return;
    }

    const receiver = users.find((u) => u._id === selectedRecipient._id);

    if (!receiver) {
      toast({
        title: "Error",
        description: "Receiver not found",
        variant: "destructive",
      });
      setIsSendingNOX(false); // Hide loader
      return;
    }
        setIsTransferDialogOpen(false)

    try {
      await dispatch(
        transferPoints({
          _id: user._id,
          receiverId: selectedRecipient._id,
          amount: transferAmountNum,
        })
      );

      // Update balances
      dispatch(updateUserPoints(user!.nox_balance - transferAmountNum));
      dispatch(
        updateOtherUserPoints({
          userId: selectedRecipient._id,
          nox_balance: selectedRecipient.nox_balance + transferAmountNum,
        })
      );

     await dispatch( fetchTransactions(user._id))

      setIsTransferDialogOpen(false);
      setTransferAmount("");
      setSelectedRecipient(null);
      setRecipientSearch("");
      setShowBalancePreview(false);
      toast({
        title: "Transfer Successful",
        description: `${transferAmountNum} NOX sent to ${selectedRecipient.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Transfer failed",
        variant: "destructive",
      });
    } finally {
      setIsSendingNOX(false); // Hide loader
    }
  };

  const handleDialogClose = () => {
    setIsTransferDialogOpen(false);
    setTransferAmount("");
    setSelectedRecipient(null);
    setRecipientSearch("");
    setShowBalancePreview(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Animation timing effect
  useEffect(() => {
    if (showTransferAnimation) {
      const timer = setTimeout(() => {
        setShowTransferAnimation(false);
        dispatch(resetAnimation());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showTransferAnimation, dispatch]);

  useEffect(() => {
    if (isTransferDialogOpen) {
      dispatch(fetchUserPoints(user._id));
    }
  }, [isTransferDialogOpen]);

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isSendingNOX && <Loader />}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                {/* <User className="w-6 h-6 text-white" /> */}
                <img
                  src="/favicon.ico"
                  alt="App Logo"
                  className="rounded-2xl"
                />
              </div>
              <div className="">
                <h1 className="text-2xl font-bold hidden sm:block">
                  ASCENSION
                </h1>
                {/* <p className="text-sm text-muted-foreground">
                  Manage your NOX and transfers
                </p> */}
                <span className="text-sm text-muted-foreground">
                  {user?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LogoutButtons onSessionLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Balance Card */}
        <Card className="bg-gradient-primary text-white shadow-glow">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium mb-2">
                  Current Balance
                </p>
                <div className="flex flex-row gap-2 items-center mb-4">
                  <p className="text-4xl font-bold">
                    {lastPolledBalance?.toLocaleString() ||
                      user.nox_balance?.toLocaleString() ||
                      0}{" "}
                    NOX
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={async () => {
                      setIsSendingNOX(true);
                      await dispatch(fetchUserPoints(user._id));
                      await dispatch(fetchUsers({ page: 1 }));
                      await dispatch(fetchTransactions(user._id));
                      setIsSendingNOX(false);
                    }}
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <span className="flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {sentTransactions.length} sent
                  </span>
                  <span className="flex items-center">
                    <ArrowDownLeft className="w-4 h-4 mr-1" />
                    {receivedTransactions.length} received
                  </span>
                </div>
              </div>
              <div className="sm:text-right mt-6 sm:mt-0 flex-shrink-0">
                <Dialog
                  open={isTransferDialogOpen}
                  onOpenChange={setIsTransferDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      <Send className="w-4 h-4" />
                      Send NOX
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-xs sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send NOX</span>
                      </DialogTitle>
                      <DialogDescription>
                        Transfer NOX to another user securely
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Current Balance Display */}
                      <div className="p-3 sm:p-4 bg-gradient-card rounded-lg border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">
                              Current Balance
                            </span>
                          </div>
                          <span className="text-lg font-bold">
                            {lastPolledBalance?.toLocaleString() ||
                              user.nox_balance?.toLocaleString()}{" "}
                            pts
                          </span>
                        </div>

                        {/* Balance Preview */}
                        {showBalancePreview && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
                                <div className="flex items-center space-x-2">
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                  <span className="text-muted-foreground">
                                    Amount to send:
                                  </span>
                                </div>
                                <span className="font-medium text-red-600">
                                  -{transferAmountNum.toLocaleString()} pts
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm font-medium gap-2">
                                <div className="flex items-center space-x-2">
                                  {newBalance >= 0 ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span>New balance:</span>
                                </div>
                                <span
                                  className={
                                    newBalance >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {newBalance.toLocaleString()} pts
                                </span>
                              </div>
                              {newBalance < 0 && (
                                <div className="text-xs text-red-600 flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>
                                    Insufficient balance for this transfer
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recipient Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Select Recipient</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="recipient"
                            placeholder="Search users by name or email..."
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        {recipientSearch && (
                          <div className="border rounded-lg max-h-40 overflow-y-auto">
                            {filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className={`p-3 cursor-pointer hover:bg-accent transition-smooth ${
                                  selectedRecipient?._id === user._id
                                    ? "bg-accent"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSelectedRecipient(user);
                                  setRecipientSearch(user.name);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {user.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {user.email}
                                    </div>
                                  </div>
                                  <Badge variant="secondary">
                                    {(user.nox_balance ?? 0).toLocaleString()}{" "}
                                    pts
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {filteredUsers.length === 0 && (
                              <div className="p-3 text-center text-muted-foreground">
                                No users found
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Amount Input */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Send</Label>
                        <div className="relative">
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            min="1"
                            max={lastPolledBalance || user?.nox_balance || 0}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                            pts
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Maximum:{" "}
                          {lastPolledBalance?.toLocaleString() ||
                            user?.nox_balance?.toLocaleString()}{" "}
                          NOX
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={handleDialogClose}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleTransfer}
                          disabled={!isValidTransfer}
                          className="flex-1"
                          variant="gradient"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send NOX
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <ArrowUpRight className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sentTransactions
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {sentTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Received
              </CardTitle>
              <ArrowDownLeft className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {receivedTransactions
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {receivedTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userTransactions.length}
              </div>
              <p className="text-xs text-muted-foreground">All transfers</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="shadow-medium !sticky !top-0">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full ">
              <div className="flex items-center space-x-2">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Transaction History</span>
                </CardTitle>
                {/* Filter Dropdown */}
                <select
                  className="ml-2 border rounded px-2 py-1 text-sm bg-background text-foreground"
                  value={transactionFilter}
                  onChange={(e) =>
                    setTransactionFilter(
                      e.target.value as "all" | "sent" | "received"
                    )
                  }
                >
                  <option value="all">All</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                </select>
              </div>
              {/* Search by user name/email */}
              <input
                type="text"
                className="mt-2 sm:mt-0 border rounded px-2 py-1 text-sm bg-background text-foreground"
                placeholder="Search by user name or email"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                style={{ minWidth: 180 }}
              />
              {/* Search by amount */}
              <input
                type="number"
                className="mt-2 sm:mt-0 border rounded px-2 py-1 text-sm bg-background text-foreground"
                placeholder="Search by amount"
                value={amountSearch}
                onChange={(e) => setAmountSearch(e.target.value)}
                style={{ minWidth: 120 }}
              />
            </div>
            {/* <CardDescription>
              Your recent point transfers and receipts
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">
                  Your transfers will appear here
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Counterpart</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((transaction) => {
                        const isSent = transaction.senderId === user._id;
                        return (
                          <TableRow key={transaction._id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {isSent ? (
                                  <ArrowUpRight className="w-4 h-4 text-destructive" />
                                ) : (
                                  <ArrowDownLeft className="w-4 h-4 text-success" />
                                )}
                                <span
                                  className={
                                    isSent ? "text-destructive" : "text-success"
                                  }
                                >
                                  {isSent ? "Sent" : "Received"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {isSent
                                ? transaction.receiverName
                                : transaction.senderName}
                            </TableCell>
                            <TableCell className="font-medium">
                              <span
                                className={
                                  isSent ? "text-destructive" : "text-success"
                                }
                              >
                                {isSent ? "-" : "+"}
                                {transaction.amount} NOX
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                transaction.timestamp
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === "completed"
                                    ? "default"
                                    : transaction.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Show celebration animation only once on first visit */}
      {!isAdmin && showCelebration && (
        <CelebrationAnimation
          isUserDashboard={true}
          isVisible={true}
          onComplete={handleCelebrationComplete}
          changeType={undefined} // No credit/debit, triggers welcome
        />
      )}

{/*       {showTransferAnimation && (
        <CelebrationAnimation
          isUserDashboard={true}
          isVisible={true}
          onComplete={() => setShowTransferAnimation(false)}
          changeType={balanceChangeType}
          pointsAdded={balanceChangeAmount}
        />
      )} */}
      <SessionTimeoutDialog onLogout={handleLogout} timeoutMinutes={5} />
    </div>
  );
};

export default UserDashboard;
