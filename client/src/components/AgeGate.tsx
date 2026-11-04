import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "afribet.ageConfirmed.v1";

type Capabilities = {
  bettingEnabled: boolean;
};

export default function AgeGate() {
  const { data } = useQuery<Capabilities>({ queryKey: ["/api/capabilities"] });
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== "true");
  const [confirmed, setConfirmed] = useState(false);

  // The public preview is read-only, so it must remain freely explorable.
  // Show this acknowledgement only when the server explicitly enables bets.
  if (data?.bettingEnabled !== true) return null;

  function continueToSite() {
    if (!confirmed) return;
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={(event) => event.preventDefault()} onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center text-2xl">Age and location check</DialogTitle>
          <DialogDescription className="text-center">
            Betting involves financial risk. Continue only if you meet the legal gambling age where you are located and participation is lawful there.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <Checkbox id="age-confirmation" checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} />
          <Label htmlFor="age-confirmation" className="leading-5 cursor-pointer">
            I am at least 18 (or the higher legal age in my jurisdiction), I am participating voluntarily, and I understand that I can lose money.
          </Label>
        </div>
        <Button onClick={continueToSite} disabled={!confirmed} className="w-full">Continue responsibly</Button>
        <p className="text-xs text-center text-muted-foreground">
          This confirmation does not replace identity, age, location, or regulatory verification required before real-money launch.
        </p>
      </DialogContent>
    </Dialog>
  );
}
