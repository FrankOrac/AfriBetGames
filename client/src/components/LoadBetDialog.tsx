import { useState } from 'react';
import { Search, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PrintTicket from '@/components/PrintTicket';
import { useToast } from '@/hooks/use-toast';

export default function LoadBetDialog() {
  const [open, setOpen] = useState(false);
  const [betCode, setBetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any | null>(null);
  const { toast } = useToast();

  const handleLoadBet = async () => {
    if (!betCode.trim()) {
      toast({
        title: 'Enter Bet Code',
        description: 'Please enter a bet ID or short code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let betId = betCode.trim();
      
      // If it's a short code (8 characters), search for the full bet ID first
      if (betId.length === 8) {
        const searchResponse = await fetch(`/api/bets/search/${betId}`);
        
        if (!searchResponse.ok) {
          throw new Error('Bet not found with that short code');
        }
        
        const searchData = await searchResponse.json();
        betId = searchData.betId;
      }
      
      // Now fetch the full ticket using the bet ID
      const response = await fetch(`/api/bets/${betId}/ticket`);
      
      if (!response.ok) {
        throw new Error('Bet not found');
      }

      const ticketData = await response.json();
      setTicket(ticketData);
      
      toast({
        title: 'Bet Found!',
        description: `Loaded ticket for ${ticketData.gameName}`,
      });
    } catch (error) {
      toast({
        title: 'Bet Not Found',
        description: 'No bet found with that ID or code. Please check and try again.',
        variant: 'destructive',
      });
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setBetCode('');
    setTicket(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-load-bet">
          <Ticket className="h-4 w-4" />
          Load Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Bet Ticket</DialogTitle>
          <DialogDescription>
            Enter your bet ID or short code to retrieve your ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Bet ID or Short Code (e.g., 1A2B3C4D)"
              value={betCode}
              onChange={(e) => setBetCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadBet()}
              disabled={loading}
              className="font-mono"
              data-testid="input-bet-code"
            />
            <Button 
              onClick={handleLoadBet} 
              disabled={loading}
              data-testid="button-search-bet"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Display Ticket if Found */}
          {ticket && (
            <Card className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center border-b-2 border-dashed pb-4">
                  <h2 className="font-display font-bold text-2xl">AfriBet Games</h2>
                  <p className="text-sm text-muted-foreground">Bet Ticket</p>
                </div>

                {/* Ticket Details */}
                <div className="space-y-3 text-sm">
                  <div className="bg-muted/50 p-3 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground font-medium">Ticket ID:</span>
                      <span className="font-mono font-bold">{ticket.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Short Code:</span>
                      <span className="font-mono font-semibold">{ticket.ticketId.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground font-medium">Game:</span>
                    <span className="font-bold">{ticket.gameName}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground font-medium">Date:</span>
                    <span className="font-semibold">{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Selected Numbers */}
                  <div className="border-t-2 border-dashed pt-3">
                    <p className="text-muted-foreground font-semibold mb-2">Your Numbers:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {ticket.selectedNumbers.map((num: number, idx: number) => (
                        <span key={idx} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg">
                          {num}
                        </span>
                      ))}
                      {ticket.bonusNumber && (
                        <>
                          <span className="flex items-center text-muted-foreground font-bold">+</span>
                          <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-lg">
                            {ticket.bonusNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="bg-muted/50 p-3 rounded space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Stake:</span>
                      <span className="font-bold text-lg">₦{ticket.stakeAmount.toLocaleString()}</span>
                    </div>
                    {ticket.potentialWinning && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Potential Win:</span>
                        <span className="font-semibold">₦{ticket.potentialWinning.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {ticket.status === 'won' && ticket.winning && (
                    <div className="bg-green-500/20 rounded p-4 border-2 border-green-500">
                      <div className="text-center space-y-2">
                        <p className="font-bold text-xl text-green-700 dark:text-green-400">🎉 WINNER! 🎉</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-700 dark:text-green-400">Payout:</span>
                          <span className="font-bold text-2xl text-green-700 dark:text-green-400">₦{ticket.winning.winningAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {ticket.status === 'lost' && (
                    <div className="bg-red-500/20 rounded p-3 border-2 border-red-500">
                      <p className="text-center font-bold text-red-700 dark:text-red-400">Not a Winner</p>
                    </div>
                  )}

                  {ticket.status === 'pending' && (
                    <div className="bg-yellow-500/20 rounded p-3 border-2 border-yellow-500">
                      <p className="text-center font-semibold text-yellow-700 dark:text-yellow-400">Results Pending</p>
                    </div>
                  )}

                  {/* Winning Numbers */}
                  {ticket.result && (
                    <div className="border-t-2 border-dashed pt-3">
                      <p className="text-muted-foreground font-semibold mb-2">Winning Numbers:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {ticket.result.winningNumbers.map((num: number, idx: number) => (
                          <span key={idx} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <PrintTicket betId={ticket.ticketId} />
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Help Text */}
          {!ticket && (
            <div className="text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded">
              <p className="font-medium mb-2">How to find your bet code:</p>
              <ul className="text-xs space-y-1">
                <li>• Check your printed ticket for the Short Code</li>
                <li>• Look in your Dashboard for recent bets</li>
                <li>• The code is shown after placing a bet</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
