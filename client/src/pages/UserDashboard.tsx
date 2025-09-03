import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import { logoutUser, updateUserPoints } from '@/store/slices/authSlice';
import { fetchTransactions, transferPoints } from '@/store/slices/transactionsSlice';
import { fetchUsers, updateUserPoints as updateOtherUserPoints } from '@/store/slices/usersSlice';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  LogOut,
  Send,
  Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const UserDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  const { transactions, isLoading } = useSelector((state: RootState) => state.transactions);

  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transfer, setTransfer] = useState({
    receiverId: '',
    amount: 0,
  });

  useEffect(() => {
    if (user) {
      console.log('user',users)
      dispatch(fetchTransactions(user._id));
      dispatch(fetchUsers({ page: 1 })); // Provide default page argument
    }
  }, [dispatch, user]);

  const eligibleReceivers = users.filter(
    (u) => u._id && u._id !== user?._id && u.status === 'active' && u.role === 'user'
  );

  const userTransactions = Array.isArray(transactions) ? transactions : [];
  const sentTransactions = userTransactions.filter((t) => t.senderId === user?._id);
  const receivedTransactions = userTransactions.filter((t) => t.receiverId === user?._id);

  const handleTransfer = async () => {
    if (!user || transfer.amount <= 0 || !transfer.receiverId) {
      toast({ title: 'Error', description: 'Please fill all fields correctly', variant: 'destructive' });
      return;
    }

    if (transfer.amount > user.points_balance) {
      toast({ title: 'Error', description: 'Insufficient balance', variant: 'destructive' });
      return;
    }

    const receiver = users.find((u) => u._id === transfer.receiverId);
    if (!receiver) {
      toast({ title: 'Error', description: 'Receiver not found', variant: 'destructive' });
      return;
    }

    try {
      await dispatch(
        transferPoints({
          _id:user._id,
          receiverId: transfer.receiverId,
          amount: transfer.amount,
        })
      );
      dispatch(updateUserPoints(user.points_balance - transfer.amount));
      dispatch(
        updateOtherUserPoints({
          userId: receiver._id,
          points_balance: receiver.points_balance + transfer.amount,
        })
      );
      setIsTransferDialogOpen(false);
      setTransfer({ receiverId: '', amount: 0 });
      toast({ title: 'Success', description: `Successfully transferred ${transfer.amount} points to ${receiver.name}`, variant: 'default' });
    } catch (error) {
      console.log('error:',error)
      toast({ title: 'Error', description: 'Transfer failed', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium">Welcome, {user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Balance Card */}
        <Card className="bg-gradient-primary text-white shadow-glow">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">Current Balance</p>
                <p className="text-4xl font-bold mb-4">{user.points_balance?.toLocaleString() || 0} Points</p>
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
              <div className="text-right">
                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                      <Send className="w-4 h-4" />
                      Send Points
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Transfer Points</DialogTitle>
                      <DialogDescription>
                        Send points to another user securely
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="receiver">Select Recipient</Label>
                        <Select value={transfer.receiverId} onValueChange={(value) => setTransfer({ ...transfer, receiverId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleReceivers.map((u) => (
                              <SelectItem key={u._id} value={u._id}>
                                <div className="flex items-center space-x-2">
                                  <span>{u.name}</span>
                                  <span className="text-muted-foreground text-sm">({u.points_balance} points_balance)</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          min="1"
                          max={user?.points_balance || 0}
                          value={transfer.amount || ''}
                          onChange={(e) => setTransfer({ ...transfer, amount: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Available balance: {user?.points_balance?.toLocaleString() || 0} points
                        </p>
                      </div>
                      <Button 
                        onClick={handleTransfer} 
                        className="w-full" 
                        variant="gradientSuccess"
                        disabled={isLoading || transfer.amount <= 0 || !transfer.receiverId}
                      >
                        {isLoading ? 'Processing...' : `Transfer ${transfer.amount || 0} Points`}
                      </Button>
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
                {sentTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {sentTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <ArrowDownLeft className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {receivedTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {receivedTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                All transfers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Transaction History</span>
            </CardTitle>
            <CardDescription>
              Your recent point transfers and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Your transfers will appear here</p>
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
                    {userTransactions.map((transaction) => {
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
                              <span className={isSent ? 'text-destructive' : 'text-success'}>
                                {isSent ? 'Sent' : 'Received'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSent ? transaction.receiverName : transaction.senderName}
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className={isSent ? 'text-destructive' : 'text-success'}>
                              {isSent ? '-' : '+'}{transaction.amount} points
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' : 
                              transaction.status === 'pending' ? 'secondary' : 'destructive'
                            }>
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
    </div>
  );
};

export default UserDashboard;