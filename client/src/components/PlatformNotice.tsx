import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

type Capabilities = {
  bettingEnabled: boolean;
  communityPostingEnabled: boolean;
  realMoneyPaymentsEnabled: boolean;
};

export default function PlatformNotice() {
  const [location] = useLocation();
  const { data } = useQuery<Capabilities>({ queryKey: ["/api/capabilities"] });
  if (location === "/admin" || !data || data.bettingEnabled) return null;

  return (
    <div role="status" className="bg-amber-100 text-amber-950 border-b border-amber-300 px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Preview mode: real-money bet placement is disabled until licensing and compliance checks are complete.</span>
      </div>
    </div>
  );
}
