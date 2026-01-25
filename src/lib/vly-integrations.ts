import * as VlyPkg from "@vly-ai/integrations";

// Handle potential import differences (default vs named vs namespace)
const Vly = (VlyPkg as any).Vly || (VlyPkg as any).default || VlyPkg;

export const vly = new Vly({
  apiKey: process.env.VLY_INTEGRATION_KEY!,
});
