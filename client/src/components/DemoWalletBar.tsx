import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoHeaders } from "@/lib/demo";
import { useToast } from "@/hooks/use-toast";

type Capabilities = { demoModeEnabled: boolean };
type DemoWalletResponse = {
  wallet: { balance: number };
  currency: string;
  withdrawable: false;
};

export default function DemoWalletBar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const capabilities = useQuery<Capabilities>({ queryKey: ["/api/capabilities"] });
  const demoEnabled = capabilities.data?.demoModeEnabled === true;
  const wallet = useQuery<DemoWalletResponse>({
    queryKey: ["/api/demo/wallet"],
    enabled: demoEnabled,
    queryFn: async () => {
      const response = await fetch("/api/demo/wallet", { headers: demoHeaders() });
      if (!response.ok) throw new Error("Unable to load demo wallet");
      return response.json();
    },
  });
  const topUp = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch("/api/demo/wallet/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...demoHeaders() },
        body: JSON.stringify({ amount }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Unable to add demo funds");
      return payload as DemoWalletResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/demo/wallet"], data);
      toast({ title: "Demo funds added", description: "These credits have no cash value and cannot be withdrawn." });
    },
    onError: (error) => toast({ title: "Demo top-up failed", description: error.message, variant: "destructive" }),
  });

  if (!demoEnabled) return null;

  return (
    <div className="bg-sky-950 text-sky-50 border-b border-sky-700 px-4 py-3" role="status">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-sky-300" aria-hidden="true" />
          <div>
            <p className="font-semibold">Demo sandbox — no real money</p>
            <p className="text-xs text-sky-200">Test credits and winnings cannot be deposited, transferred, or withdrawn.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-md bg-sky-900 px-3 py-2 font-semibold">
            <WalletCards className="w-4 h-4" /> Demo ₦{(wallet.data?.wallet.balance ?? 0).toLocaleString()}
          </span>
          <Button size="sm" variant="secondary" onClick={() => topUp.mutate(10_000)} disabled={topUp.isPending}>
            <Plus /> Add ₦10,000 demo
          </Button>
          <Button size="sm" variant="outline" className="border-sky-500 text-sky-50" onClick={() => topUp.mutate(50_000)} disabled={topUp.isPending}>
            <Plus /> Add ₦50,000 demo
          </Button>
        </div>
      </div>
    </div>
  );
}
