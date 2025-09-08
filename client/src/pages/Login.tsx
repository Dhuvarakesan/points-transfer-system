import ThemeToggle from "@/components/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/store";
import { clearError, loginUser } from "@/store/slices/authSlice";
import { Eye, EyeOff, Loader2, Shield, Users } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginUser({ email, password }));
  };

  const demoCredentials = [
    {
      label: "Admin Account",
      email: "admin@admin.com",
      password: "admin@admin",
      icon: Shield,
    },
    {
      label: "User Account",
      email: "user@user.com",
      password: "user@user",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-transparent rounded-xl flex items-center justify-center shadow-glow">
              {/* <CreditCard className="w-8 h-8 text-white" /> */}
              <img src="/favicon.ico" alt="App Logo" className="w-16 h-16 rounded-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ASCENSION</h1>
          {/* <p className="text-muted-foreground">
            Secure point transfers made simple
          </p> */}
        </div>

        {/* Login Form */}
        <Card className="shadow-large bg-gradient-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  required
                  disabled={isLoading}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="gradientHero"
                disabled={isLoading || !!emailError || !!passwordError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>
              Use these credentials to test the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred) => (
              <div
                key={cred.email}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-fast"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                  setEmailError("");
                  setPasswordError("");
                }}
              >
                <div className="flex items-center space-x-3">
                  <cred.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{cred.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cred.email}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Use
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="fixed left-4 bottom-4 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Login;
