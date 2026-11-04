import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Bet, ComplianceGate, ContactInquiry, Game, OperatorAuditLog, PlatformSettings, Result } from "@shared/schema";

type Capabilities = {
  bettingEnabled: boolean;
  demoModeEnabled: boolean;
  communityPostingEnabled: boolean;
  contactSubmissionsEnabled: boolean;
  realMoneyPaymentsEnabled: boolean;
  maintenanceMode: boolean;
};

type ControlPlane = {
  settings: PlatformSettings;
  complianceGates: ComplianceGate[];
  infrastructure: {
    persistentDatabase: boolean;
    operatorAuthentication: boolean;
    publicPreviewMode: boolean;
  };
  capabilities: Capabilities;
  launchBlockers: string[];
  metrics: {
    totalBets: number;
    pendingBets: number;
    totalStaked: number;
    totalPaid: number;
    publishedResults: number;
    openInquiries: number;
    demoBets: number;
    demoStaked: number;
    demoPaid: number;
  };
  games: Game[];
  recentBets: Bet[];
  recentResults: Result[];
  recentInquiries: ContactInquiry[];
  auditLogs: OperatorAuditLog[];
};

const keyStorageName = "afribet-admin-key";
const actorStorageName = "afribet-admin-actor";

function parseApiError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") return payload.error;
  return fallback;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(keyStorageName) ?? "");
  const [operatorName, setOperatorName] = useState(() => sessionStorage.getItem(actorStorageName) ?? "");
  const [control, setControl] = useState<ControlPlane | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${adminKey}`,
        "X-Admin-Actor": operatorName || "operator",
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(parseApiError(payload, `Request failed (${response.status})`));
    return payload;
  };

  const loadControlPlane = async () => {
    if (!adminKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch("/api/admin/control-plane");
      sessionStorage.setItem(keyStorageName, adminKey);
      sessionStorage.setItem(actorStorageName, operatorName || "operator");
      setControl(data as ControlPlane);
    } catch (caught) {
      setControl(null);
      setError(caught instanceof Error ? caught.message : "Unable to authenticate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) void loadControlPlane();
    // Only restore the session once; subsequent refreshes are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readiness = useMemo(() => {
    if (!control) return 0;
    const completed = control.complianceGates.filter((gate) => gate.status === "complete").length;
    return Math.round((completed / Math.max(control.complianceGates.length, 1)) * 100);
  }, [control]);

  const updateFeatures = async (update: Partial<PlatformSettings>) => {
    try {
      await adminFetch("/api/admin/features", { method: "PUT", body: JSON.stringify(update) });
      toast({ title: "Feature controls updated", description: "The change was recorded in the operator audit log." });
      await loadControlPlane();
    } catch (caught) {
      toast({ title: "Change blocked", description: caught instanceof Error ? caught.message : "Unable to update features", variant: "destructive" });
    }
  };

  if (!control) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-4">
        <Card className="w-full max-w-lg p-7 bg-slate-900 border-slate-800 text-slate-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center mb-5"><LockKeyhole /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Operator Control Centre</h1>
          <p className="text-slate-400 mb-6">Authenticate with the server-side operator key. The key is kept only for this browser tab.</p>
          <div className="space-y-4">
            <div><Label htmlFor="operator">Operator name</Label><Input id="operator" value={operatorName} onChange={(event) => setOperatorName(event.target.value)} placeholder="Your name" className="mt-2 bg-slate-950 border-slate-700" /></div>
            <div><Label htmlFor="admin-key">Admin API key</Label><Input id="admin-key" type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Paste ADMIN_API_KEY" className="mt-2 bg-slate-950 border-slate-700" /></div>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" onClick={loadControlPlane} disabled={loading || !adminKey.trim()}>
              {loading ? <RefreshCw className="animate-spin" /> : <KeyRound />} Access dashboard
            </Button>
            <Button asChild variant="ghost" className="w-full text-slate-300"><Link href="/">Return to site</Link></Button>
          </div>
        </Card>
      </main>
    );
  }

  const launchReady = control.launchBlockers.length === 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs uppercase tracking-[0.2em] text-emerald-400">AfriBet Operations</p><h1 className="font-display text-2xl font-bold">Control Centre</h1></div>
          <div className="flex items-center gap-2">
            <Badge className={launchReady ? "bg-emerald-600" : "bg-amber-600"}>{launchReady ? "Launch gates complete" : `${control.launchBlockers.length} blockers`}</Badge>
            <Button variant="outline" size="sm" onClick={loadControlPlane}><RefreshCw /> Refresh</Button>
            <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem(keyStorageName); setControl(null); setAdminKey(""); }}>Lock</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Metric label="Readiness" value={`${readiness}%`} icon={<ShieldCheck />} />
          <Metric label="Bets" value={control.metrics.totalBets.toLocaleString()} icon={<TicketCheck />} />
          <Metric label="Pending" value={control.metrics.pendingBets.toLocaleString()} icon={<RefreshCw />} />
          <Metric label="Total staked" value={`₦${control.metrics.totalStaked.toLocaleString()}`} icon={<BarChart3 />} />
          <Metric label="Total paid" value={`₦${control.metrics.totalPaid.toLocaleString()}`} icon={<CheckCircle2 />} />
          <Metric label="Open inquiries" value={control.metrics.openInquiries.toLocaleString()} icon={<ClipboardCheck />} />
        </section>

        <InfrastructureCard control={control} />

        <Tabs defaultValue="features" className="space-y-3">
          <TabsList className="bg-slate-900 border border-slate-800 h-auto flex-wrap justify-start">
            <TabsTrigger value="features">Feature controls</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="risk">Risk limits</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card className="p-4 bg-slate-900 border-slate-800 text-slate-100 space-y-2">
              <SectionTitle icon={<Settings2 />} title="Runtime feature controls" description="Stored in the production database and enforced by every write endpoint." />
              <FeatureSwitch label="Maintenance mode" description="Immediately disables betting, posting and contact submissions." checked={control.settings.maintenanceMode} active={control.capabilities.maintenanceMode} onChange={(value) => updateFeatures({ maintenanceMode: value })} />
              <FeatureSwitch label="Demo sandbox" description="Enables test-only wallets, demo bets and demo draws without completing real-money compliance gates." checked={control.settings.demoModeEnabled} active={control.capabilities.demoModeEnabled} onChange={(value) => updateFeatures({ demoModeEnabled: value })} />
              <FeatureSwitch label="Bet placement" description="Can only become active when every launch gate and infrastructure prerequisite is complete." checked={control.settings.bettingEnabled} active={control.capabilities.bettingEnabled} onChange={(value) => updateFeatures({ bettingEnabled: value })} />
              <FeatureSwitch label="Community posting" description="Requires authenticated player identity and moderation controls." checked={control.settings.communityPostingEnabled} active={control.capabilities.communityPostingEnabled} onChange={(value) => updateFeatures({ communityPostingEnabled: value })} />
              <FeatureSwitch label="Contact submissions" description="Enables investor and general contact forms outside public preview mode." checked={control.settings.contactSubmissionsEnabled} active={control.capabilities.contactSubmissionsEnabled} onChange={(value) => updateFeatures({ contactSubmissionsEnabled: value })} />
              <FeatureSwitch label="Real-money payments" description="Locked until a payment provider and audited ledger are implemented in this codebase." checked={false} active={false} disabled onChange={() => undefined} />
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid xl:grid-cols-2 gap-3">
              {control.complianceGates.map((gate) => <ComplianceGateEditor key={gate.key} gate={gate} adminFetch={adminFetch} onSaved={loadControlPlane} />)}
            </div>
          </TabsContent>

          <TabsContent value="risk"><RiskEditor settings={control.settings} adminFetch={adminFetch} onSaved={loadControlPlane} /></TabsContent>
          <TabsContent value="operations"><Operations control={control} adminFetch={adminFetch} onSaved={loadControlPlane} /></TabsContent>
          <TabsContent value="audit"><AuditLog entries={control.auditLogs} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card className="p-3 bg-slate-900 border-slate-800 text-slate-100"><div className="text-emerald-400 mb-1 [&>svg]:size-4">{icon}</div><p className="text-[11px] text-slate-400">{label}</p><p className="text-lg font-bold">{value}</p></Card>;
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="flex gap-3"><div className="text-emerald-400 mt-1">{icon}</div><div><h2 className="text-xl font-bold">{title}</h2><p className="text-sm text-slate-400">{description}</p></div></div>;
}

function InfrastructureCard({ control }: { control: ControlPlane }) {
  const items = [
    ["Persistent PostgreSQL", control.infrastructure.persistentDatabase],
    ["Operator authentication", control.infrastructure.operatorAuthentication],
    ["Public preview disabled", !control.infrastructure.publicPreviewMode],
  ] as const;
  return <Card className="p-4 bg-slate-900 border-slate-800 text-slate-100"><div className="flex flex-wrap items-center justify-between gap-3"><SectionTitle icon={<ShieldCheck />} title="Infrastructure gates" description="These cannot be bypassed by a dashboard switch." /><div className="flex flex-wrap gap-1.5">{items.map(([label, ok]) => <Badge key={label} variant="outline" className={ok ? "border-emerald-600 text-emerald-300" : "border-amber-600 text-amber-300"}>{ok ? <CheckCircle2 /> : <AlertTriangle />} {label}</Badge>)}</div></div></Card>;
}

function FeatureSwitch({ label, description, checked, active, disabled, onChange }: { label: string; description: string; checked: boolean; active: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3"><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{label}</h3><Badge variant="outline" className={active ? "border-emerald-600 text-emerald-300" : "border-slate-700 text-slate-400"}>{active ? "Active" : "Inactive"}</Badge></div><p className="text-xs text-slate-400 mt-0.5">{description}</p></div><Switch checked={checked} disabled={disabled} onCheckedChange={onChange} aria-label={`Toggle ${label}`} /></div>;
}

function ComplianceGateEditor({ gate, adminFetch, onSaved }: { gate: ComplianceGate; adminFetch: (url: string, options?: RequestInit) => Promise<unknown>; onSaved: () => Promise<void> }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(gate.status);
  const [evidence, setEvidence] = useState(gate.evidence ?? "");
  const [reviewedBy, setReviewedBy] = useState(gate.reviewedBy ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await adminFetch(`/api/admin/compliance/${gate.key}`, { method: "PUT", body: JSON.stringify({ status, evidence: evidence || null, reviewedBy: reviewedBy || null }) });
      toast({ title: "Compliance gate saved", description: gate.label });
      await onSaved();
    } catch (caught) {
      toast({ title: "Unable to save gate", description: caught instanceof Error ? caught.message : "Request failed", variant: "destructive" });
    } finally { setSaving(false); }
  };
  return <Card className="p-4 bg-slate-900 border-slate-800 text-slate-100"><div className="grid lg:grid-cols-[1fr_150px] gap-3"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{gate.category}</Badge><h3 className="font-semibold text-base">{gate.label}</h3></div><p className="text-xs text-slate-400 mt-1">{gate.description}</p><div className="grid md:grid-cols-2 gap-2 mt-3"><div><Label>Evidence / approval reference</Label><Textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} className="mt-1 min-h-16 bg-slate-950 border-slate-700" placeholder="Document URL, approval ID, test report or signed decision" /></div><div><Label>Reviewed by</Label><Input value={reviewedBy} onChange={(event) => setReviewedBy(event.target.value)} className="mt-1 bg-slate-950 border-slate-700" placeholder="Accountable owner" /></div></div></div><div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="blocked">Blocked</SelectItem><SelectItem value="complete">Complete</SelectItem></SelectContent></Select><Button className="w-full" onClick={save} disabled={saving}><Save /> Save gate</Button></div></div></Card>;
}

function RiskEditor({ settings, adminFetch, onSaved }: { settings: PlatformSettings; adminFetch: (url: string, options?: RequestInit) => Promise<unknown>; onSaved: () => Promise<void> }) {
  const { toast } = useToast();
  const [houseEdgePercentage, setHouseEdge] = useState(String(settings.houseEdgePercentage));
  const [maxDailyPayoutRatio, setPayoutRatio] = useState(String(settings.maxDailyPayoutRatio));
  const [maxSingleWinMultiplier, setMultiplier] = useState(String(settings.maxSingleWinMultiplier));
  const save = async () => {
    try {
      await adminFetch("/api/config", { method: "PUT", body: JSON.stringify({ houseEdgePercentage: Number(houseEdgePercentage), maxDailyPayoutRatio: Number(maxDailyPayoutRatio), maxSingleWinMultiplier: Number(maxSingleWinMultiplier) }) });
      toast({ title: "Risk limits updated" }); await onSaved();
    } catch (caught) { toast({ title: "Unable to update risk limits", description: caught instanceof Error ? caught.message : "Request failed", variant: "destructive" }); }
  };
  return <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100"><SectionTitle icon={<BarChart3 />} title="Risk and payout limits" description="Versioned operator values used by settlement calculations." /><div className="grid md:grid-cols-3 gap-4 mt-6"><Field label="House edge (%)" value={houseEdgePercentage} onChange={setHouseEdge} /><Field label="Daily payout ratio (0–1)" value={maxDailyPayoutRatio} onChange={setPayoutRatio} /><Field label="Max single-win multiplier" value={maxSingleWinMultiplier} onChange={setMultiplier} /></div><Button className="mt-5" onClick={save}><Save /> Save risk limits</Button></Card>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <div><Label>{label}</Label><Input type="number" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 bg-slate-950 border-slate-700" /></div>; }

function Operations({ control, adminFetch, onSaved }: { control: ControlPlane; adminFetch: (url: string, options?: RequestInit) => Promise<unknown>; onSaved: () => Promise<void> }) {
  const { toast } = useToast();
  const [gameId, setGameId] = useState(control.games[0]?.id ?? "");
  const [numbers, setNumbers] = useState("");
  const [odds, setOdds] = useState("");
  const [bonus, setBonus] = useState("");
  const [code, setCode] = useState("");
  const publish = async () => {
    try {
      await adminFetch("/api/results", { method: "POST", body: JSON.stringify({ gameId, drawDate: new Date().toISOString(), winningNumbers: numbers.split(",").map(Number), odds: odds.split(",").map(Number), ...(bonus ? { bonusNumber: Number(bonus) } : {}) }) });
      toast({ title: "Result published" }); setNumbers(""); setOdds(""); setBonus(""); await onSaved();
    } catch (caught) { toast({ title: "Result rejected", description: caught instanceof Error ? caught.message : "Request failed", variant: "destructive" }); }
  };
  const createCode = async () => {
    try { await adminFetch("/api/codes", { method: "POST", body: JSON.stringify({ code, gameId: gameId || null, usesRemaining: 100 }) }); toast({ title: "Promotion code created" }); setCode(""); }
    catch (caught) { toast({ title: "Code rejected", description: caught instanceof Error ? caught.message : "Request failed", variant: "destructive" }); }
  };
  const generateDemoDraw = async () => {
    try {
      await adminFetch(`/api/results/generate/${gameId}`, { method: "POST" });
      toast({ title: "Demo draw generated", description: "Only demo tickets can settle against this draw." });
      await onSaved();
    } catch (caught) { toast({ title: "Demo draw failed", description: caught instanceof Error ? caught.message : "Request failed", variant: "destructive" }); }
  };
  return <div className="grid lg:grid-cols-2 gap-5"><Card className="p-6 bg-slate-900 border-slate-800 text-slate-100"><SectionTitle icon={<TicketCheck />} title="Draw operations" description="Official publication is validated; generated sandbox draws settle demo tickets only." /><div className="space-y-3 mt-5"><Select value={gameId} onValueChange={setGameId}><SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue placeholder="Select game" /></SelectTrigger><SelectContent>{control.games.map((game) => <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>)}</SelectContent></Select><Button variant="outline" className="w-full" onClick={generateDemoDraw} disabled={!control.capabilities.demoModeEnabled}>Generate demo draw</Button><Input value={numbers} onChange={(event) => setNumbers(event.target.value)} placeholder="Official winning numbers, comma separated" className="bg-slate-950 border-slate-700" /><Input value={odds} onChange={(event) => setOdds(event.target.value)} placeholder="Matching odds, comma separated" className="bg-slate-950 border-slate-700" /><Input value={bonus} onChange={(event) => setBonus(event.target.value)} placeholder="Bonus number (optional)" className="bg-slate-950 border-slate-700" /><Button onClick={publish}>Publish official result</Button></div></Card><Card className="p-6 bg-slate-900 border-slate-800 text-slate-100"><SectionTitle icon={<KeyRound />} title="Promotion codes" description="Create an auditable, limited-use game code." /><div className="space-y-3 mt-5"><Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="PROMO_CODE" className="bg-slate-950 border-slate-700" /><Button onClick={createCode} disabled={!code}>Create 100-use code</Button></div><div className="border-t border-slate-800 mt-6 pt-5"><h3 className="font-semibold mb-3">Demo activity</h3><p className="text-sm text-slate-300">{control.metrics.demoBets} bets · Demo ₦{control.metrics.demoStaked.toLocaleString()} staked · Demo ₦{control.metrics.demoPaid.toLocaleString()} paid</p></div><div className="border-t border-slate-800 mt-6 pt-5"><h3 className="font-semibold mb-3">Recent inquiries</h3>{control.recentInquiries.length === 0 ? <p className="text-sm text-slate-400">No inquiries.</p> : control.recentInquiries.slice(0, 5).map((item) => <div key={item.id} className="py-2 border-b border-slate-800"><p className="font-medium">{item.subject}</p><p className="text-xs text-slate-400">{item.name} · {item.email}</p></div>)}</div></Card></div>;
}

function AuditLog({ entries }: { entries: OperatorAuditLog[] }) {
  return <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100"><SectionTitle icon={<ClipboardCheck />} title="Operator audit trail" description="Newest configuration and compliance changes." /><div className="mt-5 divide-y divide-slate-800">{entries.length === 0 ? <p className="text-slate-400">No operator changes recorded.</p> : entries.map((entry) => <div key={entry.id} className="py-3 flex flex-wrap justify-between gap-2"><div><p className="font-medium">{entry.action}</p><p className="text-xs text-slate-400">{entry.actor} · {entry.target}</p></div><time className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString("en-NG")}</time></div>)}</div></Card>;
}
