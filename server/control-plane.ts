import type { ComplianceGate, InsertComplianceGate, InsertPlatformSettings, PlatformSettings } from "@shared/schema";

export const PLATFORM_SETTINGS_ID = "global";

export const COMPLIANCE_GATE_DEFINITIONS = [
  {
    key: "licensing",
    category: "Legal",
    label: "Gambling licences and legal opinions",
    description: "Applicable licences and jurisdiction-by-jurisdiction legal approvals are current and documented.",
  },
  {
    key: "kyc_aml",
    category: "Compliance",
    label: "KYC, age verification, sanctions and AML",
    description: "Identity, age, sanctions, AML, source-of-funds and regulatory-reporting controls are integrated and tested.",
  },
  {
    key: "geofencing",
    category: "Compliance",
    label: "Geolocation and geofencing",
    description: "Jurisdiction controls, VPN/proxy policy and location evidence have been approved and verified.",
  },
  {
    key: "payments_ledger",
    category: "Finance",
    label: "Payments, player funds and ledger",
    description: "Payment provider, withdrawals, reconciliation, chargebacks and audited segregated-funds accounting are operational.",
  },
  {
    key: "rng_draws",
    category: "Games",
    label: "Certified RNG and draw publication",
    description: "Independent game certification and a signed, immutable draw-publication process are in place.",
  },
  {
    key: "responsible_gaming",
    category: "Player safety",
    label: "Responsible-gaming controls",
    description: "Limits, cooling-off, self-exclusion, reality checks, affordability interventions and support escalation are tested.",
  },
  {
    key: "player_identity",
    category: "Security",
    label: "Player accounts and session security",
    description: "Authenticated player ownership, MFA/recovery, device controls and consent workflows are production-ready.",
  },
  {
    key: "legal_content",
    category: "Legal",
    label: "Terms, privacy and complaints",
    description: "Counsel-approved terms, rules, payout policy, privacy/cookies, complaints/ADR and retention policies are published.",
  },
  {
    key: "security_assurance",
    category: "Security",
    label: "Independent security assurance",
    description: "Penetration testing, threat model, dependency review, backups, incident exercises and operational monitoring are signed off.",
  },
  {
    key: "community_safety",
    category: "Community",
    label: "Community moderation and abuse handling",
    description: "Authenticated identities, reporting, blocking, moderation and escalation processes are operational.",
  },
  {
    key: "resilience",
    category: "Operations",
    label: "Load, failover and settlement integrity",
    description: "Load, failover, concurrency and settlement-idempotency tests pass against the selected providers and database.",
  },
] as const;

export type ComplianceGateKey = (typeof COMPLIANCE_GATE_DEFINITIONS)[number]["key"];

export type InfrastructureReadiness = {
  persistentDatabase: boolean;
  operatorAuthentication: boolean;
  publicPreviewMode: boolean;
};

export type OperationalCapabilities = {
  bettingEnabled: boolean;
  demoModeEnabled: boolean;
  communityPostingEnabled: boolean;
  contactSubmissionsEnabled: boolean;
  realMoneyPaymentsEnabled: boolean;
  maintenanceMode: boolean;
};

export function initialPlatformSettings(): InsertPlatformSettings {
  return {
    id: PLATFORM_SETTINGS_ID,
    bettingEnabled: process.env.BETTING_ENABLED === "true" && process.env.NODE_ENV !== "production",
    communityPostingEnabled: process.env.COMMUNITY_POSTING_ENABLED === "true" && process.env.NODE_ENV !== "production",
    contactSubmissionsEnabled: process.env.PUBLIC_PREVIEW_MODE !== "true" && process.env.NODE_ENV !== "production",
    maintenanceMode: false,
    demoModeEnabled: process.env.DEMO_MODE_ENABLED === "true",
    houseEdgePercentage: Number(process.env.HOUSE_EDGE_PERCENTAGE ?? 15),
    maxDailyPayoutRatio: Number(process.env.MAX_DAILY_PAYOUT_RATIO ?? 0.75),
    maxSingleWinMultiplier: Number(process.env.MAX_SINGLE_WIN_MULTIPLIER ?? 1000),
    updatedBy: "system",
    updatedAt: new Date(),
  };
}

export function initialComplianceGates(): InsertComplianceGate[] {
  return COMPLIANCE_GATE_DEFINITIONS.map((gate) => ({
    ...gate,
    status: "pending",
    evidence: null,
    reviewedBy: null,
    reviewedAt: null,
    updatedAt: new Date(),
  }));
}

export function infrastructureReadiness(): InfrastructureReadiness {
  return {
    persistentDatabase: Boolean(process.env.DATABASE_URL?.trim()),
    operatorAuthentication: Boolean(process.env.ADMIN_API_KEY?.trim()) || process.env.NODE_ENV !== "production",
    publicPreviewMode: process.env.PUBLIC_PREVIEW_MODE === "true",
  };
}

export function incompleteLaunchGates(gates: ComplianceGate[]): string[] {
  const statusByKey = new Map(gates.map((gate) => [gate.key, gate.status]));
  return COMPLIANCE_GATE_DEFINITIONS
    .filter((gate) => statusByKey.get(gate.key) !== "complete")
    .map((gate) => gate.key);
}

export function launchBlockers(gates: ComplianceGate[], infrastructure: InfrastructureReadiness): string[] {
  const blockers = incompleteLaunchGates(gates);
  if (!infrastructure.persistentDatabase) blockers.unshift("persistent_database");
  if (!infrastructure.operatorAuthentication) blockers.unshift("operator_authentication");
  if (infrastructure.publicPreviewMode) blockers.unshift("public_preview_mode");
  return blockers;
}

export function operationalCapabilities(
  settings: PlatformSettings,
  gates: ComplianceGate[],
  infrastructure: InfrastructureReadiness,
): OperationalCapabilities {
  const maintenanceMode = settings.maintenanceMode;
  const allLaunchGatesComplete = launchBlockers(gates, infrastructure).length === 0;
  const communityReady = gates.some((gate) => gate.key === "community_safety" && gate.status === "complete")
    && gates.some((gate) => gate.key === "player_identity" && gate.status === "complete");

  return {
    bettingEnabled: !maintenanceMode && allLaunchGatesComplete && settings.bettingEnabled,
    demoModeEnabled: !maintenanceMode && settings.demoModeEnabled,
    communityPostingEnabled: !maintenanceMode && !infrastructure.publicPreviewMode && communityReady && settings.communityPostingEnabled,
    contactSubmissionsEnabled: !maintenanceMode && !infrastructure.publicPreviewMode && settings.contactSubmissionsEnabled,
    // This codebase does not yet contain a payment-provider or audited-ledger implementation.
    realMoneyPaymentsEnabled: false,
    maintenanceMode,
  };
}
