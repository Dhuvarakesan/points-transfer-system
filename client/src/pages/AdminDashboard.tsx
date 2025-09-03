import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { logoutUser } from "@/store/slices/authSlice";
import { fetchAllTransactions } from "@/store/slices/transactionsSlice";
import {
  createUser,
  deleteUser,
  fetchUsers,
  setSearchTerm,
} from "@/store/slices/usersSlice";
import { User } from "@/types/user";
import {
  Activity,
  CreditCard,
  Edit3,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AdminDashboard = () => {
  // Transaction filter state
  const [transactionFilter, setTransactionFilter] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
  });
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users, searchTerm, isLoading } = useSelector(
    (state: RootState) => state.users
  );
  const { transactions: transactionsFromState } = useSelector(
    (state: RootState) => state.transactions
  );

  const transactions = Array.isArray(transactionsFromState) ? transactionsFromState : [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    points_balance: 0,
    status: "active" as "active" | "inactive",
    password: "", // Add password field
  });

  useEffect(() => {
  dispatch(fetchUsers({}));
  dispatch(fetchAllTransactions());
  }, [dispatch]);

  const usersArray = Array.isArray(users) ? (users as unknown as User[]) : [];
  const validUsers = usersArray.filter(
    (u) => u && typeof u.name === "string" && typeof u.email === "string"
  );
  const filteredUsers = validUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPoints = validUsers.reduce((sum, user) => sum + (user.points || 0), 0);
  const activeUsers = validUsers.filter((u) => u.isActive).length;

  const handleCreateUser = async () => {
    // Encrypt password before sending
    
    const result = await dispatch(createUser(newUser));
    if (createUser.fulfilled.match(result) && result.payload.success) {
      setIsCreateDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        role: "user",
        points_balance: 0,
        status: "active",
        password: "",
      });
      toast({ title: "Success", description: result.payload.message });
    } else {
      const errorMsg = result.payload?.message || "Failed to create user";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const result = await dispatch(deleteUser(userId));
      if (deleteUser.fulfilled.match(result) && result.payload.success) {
        toast({ title: "Success", description: result.payload.message });
      } else {
        const errorMsg = result.payload?.message || "Failed to delete user";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage users and monitor transactions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPoints.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Points in circulation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">Total transfers</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Create, edit, and manage user accounts
                </CardDescription>
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="gradient">
                    <Plus className="w-4 h-4" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="User name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "admin" | "user") =>
                          setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points">Initial Points</Label>
                      <Input
                        id="points"
                        type="number"
                        placeholder="0"
                        value={newUser.points_balance}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            points_balance: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <Button
                      onClick={handleCreateUser}
                      className="w-full"
                      variant="gradient"
                    >
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="pl-10"
              />
            </div>

            {/* Users Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(user.points ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions with filter */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>
              Latest point transfers in the system
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <Input
                placeholder="Search sender or receiver..."
                value={transactionFilter.search}
                onChange={(e) =>
                  setTransactionFilter((f) => ({
                    ...f,
                    search: e.target.value,
                  }))
                }
                className="md:w-1/3"
              />
              <Select
                value={transactionFilter.status}
                onValueChange={(val) =>
                  setTransactionFilter((f) => ({ ...f, status: val }))
                }
              >
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              {/* <Input
                type="date"
                value={transactionFilter.startDate}
                onChange={e => setTransactionFilter(f => ({ ...f, startDate: e.target.value }))}
                className="md:w-1/5"
                placeholder="Start date"
              />
              <Input
                type="date"
                value={transactionFilter.endDate}
                onChange={e => setTransactionFilter(f => ({ ...f, endDate: e.target.value }))}
                className="md:w-1/5"
                placeholder="End date"
              /> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((t) => {
                      const search = transactionFilter.search.toLowerCase();
                      const matchesSearch =
                        t.senderName?.toLowerCase().includes(search) ||
                        t.receiverName?.toLowerCase().includes(search);
                      const matchesStatus =
                        transactionFilter.status === "all" ||
                        t.status === transactionFilter.status;
                      const txDate = t.timestamp ? new Date(t.timestamp) : null;
                      const startDate = transactionFilter.startDate
                        ? new Date(transactionFilter.startDate)
                        : null;
                      const endDate = transactionFilter.endDate
                        ? new Date(transactionFilter.endDate)
                        : null;
                      const matchesDate =
                        (!startDate || (txDate && txDate >= startDate)) &&
                        (!endDate || (txDate && txDate <= endDate));
                      return matchesSearch && matchesStatus && matchesDate;
                    })
                    .slice(0, 10)
                    .map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>{transaction.senderName}</TableCell>
                        <TableCell>{transaction.receiverName}</TableCell>
                        <TableCell className="font-medium">
                          {transaction.amount} points
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleDateString()}
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
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
