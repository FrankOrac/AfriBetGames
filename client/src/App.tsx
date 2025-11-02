import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CountryProvider } from "@/providers/CountryProvider";
import Home from "@/pages/Home";
import PlayGame from "@/pages/PlayGame";
import MainGame from "@/pages/MainGame";
import NoonGame from "@/pages/NoonGame";
import NightGame from "@/pages/NightGame";
import VirtualBetting from "@/pages/VirtualBetting";
import Results from "@/pages/Results";
import Dashboard from "@/pages/Dashboard";
import Forum from "@/pages/Forum";
import NotFound from "@/pages/not-found";

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
            <Router />
          </TooltipProvider>
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
