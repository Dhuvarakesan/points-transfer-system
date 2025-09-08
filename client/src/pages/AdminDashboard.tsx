import CelebrationAnimation from "@/components/CelebrationAnimation";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  DialogTitle
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
import { decryptString } from "@/lib/cryptoUtils";
import { AppDispatch, RootState } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { fetchAllTransactions } from "@/store/slices/transactionsSlice";
import {
  addPointsToUser,
  createUser,
  deleteUser,
  fetchUsers,
  setSearchTerm,
  updateUser,
} from "@/store/slices/usersSlice";
import { User } from "@/types/user";
import {
  Activity,
  Coins,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  Users
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
  const [isAddNOXDialogOpen, setIsAddNOXDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [NOXToAdd, setNOXToAdd] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationNOX, setCelebrationNOX] = useState(0);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    nox_balance: 0,
    status: "active" as "active" | "inactive",
    password: "", // Add password field
  });
  // Edit user state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    nox_balance: 0,
    status: "active" as "active" | "inactive",
    password: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [operationType, setOperationType] = useState<'add' | 'subtract'>('add');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA; // Sort in descending order
  });

  const paginatedTransactions = sortedTransactions
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
    .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage);

  const openEditDialog = (user: User) => {
    setEditUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role,
      nox_balance: user.nox_balance,
      status: user.status as "active" | "inactive",
      password: user.password || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    const result = await dispatch(
      updateUser({
        _id: editUser._id,
    ...editUserData,
      })
    );
    if (updateUser.fulfilled.match(result) && result.payload) {
      setIsEditDialogOpen(false);
      setEditUser(null);
      toast({ title: "Success", description: "User Update Succesfully" });
    } else {
      const errorMsg ="Failed to update user";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
  dispatch(fetchUsers({}));
  dispatch(fetchAllTransactions());
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchUsers({}));
        dispatch(fetchAllTransactions());
    }, 30000); // Auto-refresh every 30 seconds

    return () => clearInterval(intervalId);
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
  const totalNOX = validUsers.reduce((sum, user) => sum + (user.nox_balance || 0), 0);
  const activeUsers = validUsers.filter((u) => u.isActive).length;

  const handleCreateUser = async () => {
    // Encrypt password before sending
    
    const result = await dispatch(createUser({ ...newUser, status: newUser.status as "active" | "inactive" }));
    if (createUser.fulfilled.match(result) && result.payload.success) {
      setIsCreateDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        role: "user",
        nox_balance: 0,
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

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete));
        toast({ title: "Success", description: "User deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const openPointsDialog = (user: User, type: 'add' | 'subtract' = 'add') => {
    setSelectedUser(user);
    setNOXToAdd(0);
    setOperationType(type);
    setIsAddNOXDialogOpen(true);
  };

  const handlePointsOperation = async () => {
    if (selectedUser && NOXToAdd > 0) {
      try {
        const points = operationType === 'add' ? NOXToAdd : -NOXToAdd;
        await dispatch(
          addPointsToUser({ userId: selectedUser._id, points })
        );
        setIsAddNOXDialogOpen(false);
        console.log('points test1:',NOXToAdd)
        setCelebrationNOX(NOXToAdd);
        setShowCelebration(operationType === 'add');
        toast({
          title: 'Success',
          description: `${operationType === 'add' ? 'Added' : 'Subtracted'} ${NOXToAdd} points to ${selectedUser.name}`,
        });
        // Refresh users data
        await dispatch(fetchUsers({}));
        setSelectedUser(null);
        setNOXToAdd(0);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to ${operationType} points`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const visiblePageNumbers = () => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = visiblePageNumbers();

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
                <h1 className="text-2xl font-bold">
                  {" "}
                  Ascension Admin
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage users and monitor transactions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.name}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
              <ThemeToggle />
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
              <CardTitle className="text-sm font-medium">Total NOX</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalNOX.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                NOX in circulation
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
              <Button
                variant="gradient"
                className="hover:opacity-80 transition-smooth"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Create User
              </Button>
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
                    <TableHead>NOX</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="!pl-8">Actions</TableHead>
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
                        {(user.nox_balance ?? 0).toLocaleString()}
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
                        <div className="flex space-x-2 pe-8 ">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPointsDialog(user, "add")}
                          >
                            <Coins className="w-4 h-4" /> Add
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPointsDialog(user, "subtract")}
                          >
                            <Coins className="w-4 h-4" /> Subtract
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openEditDialog({
                                ...user,
                                password: decryptString(user.password),
                              })
                            }
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user._id)}
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

        {/* Recent Transactions */}
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
              {/* <Select
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
              </Select> */}
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
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{transaction.senderName}</TableCell>
                      <TableCell>{transaction.receiverName}</TableCell>
                      <TableCell className="font-medium">
                        {transaction.amount} NOX
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
            <div className="flex justify-center items-center mt-4 space-x-2">
              {currentPage > 1 && (
                <Button variant="outline" onClick={handlePreviousPage}>
                  Previous
                </Button>
              )}
              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              {currentPage < totalPages && (
                <Button variant="outline" onClick={handleNextPage}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowEditPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {!showEditPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
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
              <Label htmlFor="points">Initial NOX</Label>
              <Input
                id="points"
                type="number"
                placeholder="0"
                value={newUser.nox_balance}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    nox_balance: Number(e.target.value),
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for {editUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData({
                    ...editUserData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData({
                    ...editUserData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editUserData.password}
                  onChange={(e) => {
                    setEditUserData({
                      ...editUserData,
                      password: e.target.value,
                    });
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowEditPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {!showEditPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editUserData.role}
                onValueChange={(value: "admin" | "user") =>
                  setEditUserData({
                    ...editUserData,
                    role: value,
                  })
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editUserData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setEditUserData({
                    ...editUserData,
                    status: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-points">NOX</Label>
              <Input
                id="edit-points"
                type="number"
                value={editUserData.nox_balance}
                onChange={(e) =>
                  setEditUserData({
                    ...editUserData,
                    nox_balance: Number(e.target.value),
                  })
                }
              />
            </div>
            <Button
              onClick={handleEditUser}
              className="w-full"
              variant="gradient"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Points Dialog */}
      <Dialog open={isAddNOXDialogOpen} onOpenChange={setIsAddNOXDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {operationType === "add" ? "Add" : "Subtract"} NOX to User
            </DialogTitle>
            <DialogDescription>
              {operationType === "add" ? "Add NOX to" : "Remove NOX from"}{" "}
              {selectedUser?.name}'s account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Balance:
                </span>
                <span className="font-medium">
                  {selectedUser?.points?.toLocaleString()} NOX
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">
                NOX to {operationType === "add" ? "Add" : "Subtract"}
              </Label>
              <Input
                id="points"
                type="number"
                placeholder={`Enter NOX amount to ${
                  operationType === "add" ? "add" : "subtract"
                }`}
                value={NOXToAdd}
                onChange={(e) => setNOXToAdd(Number(e.target.value))}
                min="1"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddNOXDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePointsOperation}
                className="flex-1"
                variant="gradient"
                disabled={NOXToAdd <= 0}
              >
                <Coins className="w-4 h-4 mr-2" />
                {operationType === "add" ? "Add NOX" : "Subtract NOX"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Celebration Animation */}
      <CelebrationAnimation
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        pointsAdded={celebrationNOX}
      />
    </div>
  );
};

export default AdminDashboard;
