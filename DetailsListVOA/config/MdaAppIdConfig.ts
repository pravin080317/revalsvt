// Host-to-appid fallback map for model-driven app links.
// Keep this list environment-specific and update through release config changes.
export const MDA_APP_ID_BY_ENVIRONMENT: Record<string, string> = {
  'voabstdev.crm11.dynamics.com': 'cdb5343c-51c1-ec11-983e-002248438fff',
  'voabstsit.crm11.dynamics.com': 'a63c216b-2c7f-ef11-ac21-0022481b5b80',
};
