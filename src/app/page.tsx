import { LogIn, UserPlus, Heart, Shield } from 'lucide-react';
import { ChatWindow } from '@/components/chat-window';
import { GuideInfoBox } from '@/components/guide/GuideInfoBox';
import { Button } from '@/components/ui/button';
import { auth0 } from '@/lib/auth0';

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] my-auto gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-full">
            <Heart className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HealthPilot</h1>
            <p className="text-sm text-gray-500">Secure AI Health Agent</p>
          </div>
        </div>
        <p className="text-center max-w-md text-gray-600">
          Coordinate your healthcare across MyChart, CVS Pharmacy, and Cigna Insurance — with enterprise-grade security.
          Your credentials never leave Auth0 Token Vault. Every action requires your explicit approval.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <Shield className="w-4 h-4" />
          <span>HIPAA Compliant • End-to-end Encryption • Zero Credential Exposure</span>
        </div>
        <div className="flex gap-4 mt-4">
          <Button asChild variant="default" size="default">
            <a href="/auth/login" className="flex items-center gap-2">
              <LogIn />
              <span>Login</span>
            </a>
          </Button>
          <Button asChild variant="default" size="default">
            <a href="/auth/login?screen_hint=signup">
              <UserPlus />
              <span>Sign up</span>
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          <Heart className="inline w-4 h-4 text-red-500 mr-2" />
          <span className="ml-2">
            HealthPilot is your secure AI health agent powered by{' '}
            <a className="text-blue-500" href="https://auth0.com/docs/security/forge-ai-agents" target="_blank">
              Auth0 for AI Agents
            </a>
            .
          </span>
        </li>
        <li className="hidden text-l md:block">
          <Shield className="inline w-4 h-4 text-green-500 mr-2" />
          <span className="ml-2">
            Your credentials are secured in Auth0 Token Vault. The agent never sees your passwords.
          </span>
        </li>
        <li className="hidden text-l md:block">
          <span className="text-lg font-semibold">🔒</span>
          <span className="ml-2">
            Every consequential action (prescription refills, appointments, record sharing) requires your explicit
            approval via CIBA.
          </span>
        </li>
        <li className="text-l">
          <span>👇</span>
          <span className="ml-2">
            Try asking e.g. <code>What can you help me with?</code> below!
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <ChatWindow
      endpoint={`${process.env.APP_BASE_URL}/api/chat`}
      emoji="🏥"
      placeholder={`Hello ${session?.user?.name}, I'm HealthPilot, your secure health assistant. How can I help you today?`}
      emptyStateComponent={InfoCard}
    />
  );
}
