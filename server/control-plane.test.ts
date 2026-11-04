import assert from "node:assert/strict";
import test from "node:test";
import type { ComplianceGate, PlatformSettings } from "@shared/schema";
import {
  initialComplianceGates,
  initialPlatformSettings,
  launchBlockers,
  operationalCapabilities,
} from "./control-plane";

function completeGates(): ComplianceGate[] {
  return initialComplianceGates().map((gate) => ({
    ...gate,
    status: "complete",
    evidence: "Signed approval reference",
    reviewedBy: "Compliance owner",
    reviewedAt: new Date(),
  })) as ComplianceGate[];
}

function enabledSettings(): PlatformSettings {
  return {
    ...initialPlatformSettings(),
    bettingEnabled: true,
    communityPostingEnabled: true,
    contactSubmissionsEnabled: true,
    maintenanceMode: false,
  } as PlatformSettings;
}

test("betting stays disabled while any launch gate is incomplete", () => {
  const gates = completeGates();
  gates[0] = { ...gates[0], status: "pending" };
  const infrastructure = { persistentDatabase: true, operatorAuthentication: true, publicPreviewMode: false };

  assert.equal(operationalCapabilities(enabledSettings(), gates, infrastructure).bettingEnabled, false);
  assert.deepEqual(launchBlockers(gates, infrastructure), [gates[0].key]);
});

test("public preview mode overrides every write feature", () => {
  const capabilities = operationalCapabilities(enabledSettings(), completeGates(), {
    persistentDatabase: true,
    operatorAuthentication: true,
    publicPreviewMode: true,
  });

  assert.equal(capabilities.bettingEnabled, false);
  assert.equal(capabilities.communityPostingEnabled, false);
  assert.equal(capabilities.contactSubmissionsEnabled, false);
  assert.equal(capabilities.realMoneyPaymentsEnabled, false);
});

test("maintenance mode is an immediate kill switch", () => {
  const settings = { ...enabledSettings(), maintenanceMode: true };
  const capabilities = operationalCapabilities(settings, completeGates(), {
    persistentDatabase: true,
    operatorAuthentication: true,
    publicPreviewMode: false,
  });

  assert.equal(capabilities.bettingEnabled, false);
  assert.equal(capabilities.communityPostingEnabled, false);
  assert.equal(capabilities.contactSubmissionsEnabled, false);
  assert.equal(capabilities.maintenanceMode, true);
});
