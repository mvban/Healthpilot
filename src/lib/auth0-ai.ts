import { Auth0AI, getAccessTokenFromTokenVault } from '@auth0/ai-langchain';
import { AccessDeniedInterrupt } from '@auth0/ai/interrupts';
import { SUBJECT_TOKEN_TYPES } from '@auth0/ai';

export const getAccessToken = async () => getAccessTokenFromTokenVault();

const auth0AICustomAPI = new Auth0AI({
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CUSTOM_API_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CUSTOM_API_CLIENT_SECRET!,
  },
});

export const withConnection = (connection: string, scopes: string[]) =>
  auth0AICustomAPI.withTokenVault({
    connection,
    scopes,
    accessToken: async (_, config) => {
      return config.configurable?.langgraph_auth_user?.getRawAccessToken();
    },
    subjectTokenType: SUBJECT_TOKEN_TYPES.SUBJECT_TYPE_ACCESS_TOKEN,
  });

export const withMyChart = withConnection('epic-mychart', [
  'openid',
  'patient/*.read',
  'patient/Patient.read',
  'patient/Observation.read',
  'patient/MedicationRequest.read',
  'patient/Appointment.read',
]);

export const withCVSPharmacy = withConnection('cvs-pharmacy', [
  'openid',
  'prescriptions:read',
  'prescriptions:refill',
  'pharmacy:read',
]);

export const withCignaInsurance = withConnection('cigna-insurance', [
  'openid',
  'claims:read',
  'coverage:read',
  'eligibility:read',
]);

const auth0AI = new Auth0AI();

export const withAsyncAuthorization = auth0AI.withAsyncAuthorization({
  userID: async (_params, config) => {
    return config?.configurable?._credentials?.user?.sub;
  },
  bindingMessage: async ({ action, details }) => `HealthPilot wants to: ${action}. ${details || ''}`,
  scopes: ['openid', 'health:actions'],
  audience: process.env['HEALTH_API_AUDIENCE']!,
  onAuthorizationRequest: async (authReq, creds) => {
    console.log(`Authorization request sent to your mobile device.`);
    await creds;
    console.log(`Action approved.`);
  },
  onUnauthorized: async (e: Error) => {
    console.error('Error:', e);
    if (e instanceof AccessDeniedInterrupt) {
      return 'The request was denied by the user.';
    }
    return e.message;
  },
});
