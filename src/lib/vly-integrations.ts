// This file is no longer needed - using Groq API directly
// Kept for backwards compatibility but not used
import { VlyIntegrations } from "@vly-ai/integrations";

export const vly = new VlyIntegrations({
  deploymentToken: process.env.VLY_INTEGRATION_KEY || "dummy",
});
