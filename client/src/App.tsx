import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Materials from "@/pages/Materials";
import Quizzes from "@/pages/Quizzes";
import QuizAttempt from "@/pages/QuizAttempt";
import Summaries from "@/pages/Summaries";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Create a mock user for development
const mockUser = {
  id: 12345,
  username: "testuser",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: undefined,
  isAdmin: false,
  provider: "dev",
};

function Router() {
  const { user, loading, setUser } = useAuth();
  
  // Automatically set the mock user to bypass login
  useEffect(() => {
    if (!user) {
      console.log("Setting mock user for development");
      setUser(mockUser);
    }
  }, [user, setUser]);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Always render Dashboard for development
  return (
    <Switch>
      {/* Always go to dashboard regardless of route */}
      <Route path="/">
        <Dashboard />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/materials">
        <Materials />
      </Route>
      <Route path="/quizzes">
        <Quizzes />
      </Route>
      <Route path="/quiz/:id">
        {params => <QuizAttempt id={params.id} />}
      </Route>
      <Route path="/summaries">
        <Summaries />
      </Route>
      <Route path="/progress">
        <Progress />
      </Route>
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/admin">
        <Admin />
      </Route>
      <Route path="/login">
        <Dashboard />
      </Route>
      <Route path="/signup">
        <Dashboard />
      </Route>

      {/* Fallback to Dashboard for development */}
      <Route>
        <Dashboard />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
