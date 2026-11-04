import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, TrendingUp, Wallet } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getTicketIds } from "@/lib/tickets";
import type { Bet, Game, Result, Winning } from "@shared/schema";

type TicketOutcome = {
  bet: Bet;
  game: Game;
  result: Result | null;
  winning: Winning | null;
  status: string;
};

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ticketIds = getTicketIds();
  const outcomesQuery = useQuery<TicketOutcome[]>({
    queryKey: ["local-ticket-outcomes", ...ticketIds],
    queryFn: async () => {
      const outcomes = await Promise.all(ticketIds.map(async (ticketId) => {
        const response = await fetch(`/api/bets/${encodeURIComponent(ticketId)}/outcome`);
        return response.ok ? await response.json() as TicketOutcome : null;
      }));
      return outcomes.filter((outcome): outcome is TicketOutcome => outcome !== null);
    },
    staleTime: 30_000,
  });

  const outcomes = outcomesQuery.data ?? [];
  const totalStaked = outcomes.reduce((sum, { bet }) => sum + bet.stakeAmount, 0);
  const totalWon = outcomes.reduce((sum, { winning }) => sum + (winning?.winningAmount ?? 0), 0);
  const pendingBets = outcomes.filter(({ bet }) => bet.status === "pending").length;

  async function checkResult(ticketId: string) {
    const response = await fetch(`/api/winnings/check/${encodeURIComponent(ticketId)}`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      toast({
        title: response.status === 404 ? "Result not published yet" : "Unable to check result",
        description: data.error ?? "Please try again later.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: data.won ? "Winning ticket" : "Ticket settled",
      description: data.message,
    });
    await outcomesQuery.refetch();
    await queryClient.invalidateQueries({ queryKey: ["/api/demo/wallet"] });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">My Tickets</h1>
            <p className="text-xl text-muted-foreground">
              Tickets saved on this device. Keep the full ticket ID or QR code as your private receipt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard icon={<Wallet className="w-6 h-6 text-primary" />} label="Total staked" value={`₦${totalStaked.toLocaleString()}`} />
            <SummaryCard icon={<TrendingUp className="w-6 h-6 text-chart-1" />} label="Total won" value={`₦${totalWon.toLocaleString()}`} />
            <SummaryCard icon={<Clock className="w-6 h-6 text-chart-2" />} label="Pending tickets" value={pendingBets.toString()} />
          </div>

          <Card className="p-6">
            <h2 className="font-display font-semibold text-2xl mb-6">Saved tickets</h2>
            {outcomesQuery.isLoading ? (
              <p className="text-muted-foreground py-8 text-center">Loading your tickets…</p>
            ) : outcomes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No tickets are saved on this device.</p>
                <Button asChild><Link href="/#games">Choose a game</Link></Button>
              </div>
            ) : (
              <div className="space-y-4">
                {outcomes.map(({ bet, game, winning }) => {
                  const selectedNumbers = JSON.parse(bet.selectedNumbers) as number[];
                  return (
                    <Card key={bet.id} className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{game.name}</h3>
                            <Badge variant={bet.status === "pending" ? "secondary" : "default"}>
                              {bet.status === "won" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {bet.status}
                            </Badge>
                            {bet.isDemo && <Badge variant="outline">Demo · no cash value</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedNumbers.map((number) => <Badge key={number} variant="outline">{number}</Badge>)}
                            {bet.bonusNumber !== null && <Badge variant="secondary">Bonus: {bet.bonusNumber}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground break-all">
                            {new Date(bet.createdAt).toLocaleString("en-NG")} · ₦{bet.stakeAmount.toLocaleString()} · {bet.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {winning && <strong className="text-chart-1">₦{winning.winningAmount.toLocaleString()}</strong>}
                          {bet.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => checkResult(bet.id)}>Check result</Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-6">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}
