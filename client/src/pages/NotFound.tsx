import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, CreditCard } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-large bg-gradient-card text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
            <CardDescription className="text-lg">
              Oops! The page you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The route <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> could not be found.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="gradient" asChild className="flex-1">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
