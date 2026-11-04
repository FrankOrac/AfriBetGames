import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CountryProvider } from "@/providers/CountryProvider";
import AgeGate from "@/components/AgeGate";
import PlatformNotice from "@/components/PlatformNotice";

const Home = lazy(() => import("@/pages/Home"));
const PlayGame = lazy(() => import("@/pages/PlayGame"));
const MainGame = lazy(() => import("@/pages/MainGame"));
const NoonGame = lazy(() => import("@/pages/NoonGame"));
const NightGame = lazy(() => import("@/pages/NightGame"));
const VirtualBetting = lazy(() => import("@/pages/VirtualBetting"));
const Results = lazy(() => import("@/pages/Results"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Forum = lazy(() => import("@/pages/Forum"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/main" component={MainGame} />
      <Route path="/noon" component={NoonGame} />
      <Route path="/night" component={NightGame} />
      <Route path="/virtual" component={VirtualBetting} />
      <Route path="/play/:gameType" component={PlayGame} />
      <Route path="/results" component={Results} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/forum" component={Forum} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CountryProvider>
          <TooltipProvider>
            <Toaster />
            <AgeGate />
            <PlatformNotice />
            <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>}>
              <Router />
            </Suspense>
          </TooltipProvider>
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
