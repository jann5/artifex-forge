import { VlyIntegrations } from "@vly-ai/integrations";

export const vly = new VlyIntegrations({
  deploymentToken: process.env.VLY_INTEGRATION_KEY!,
});