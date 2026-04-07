import './globals.css';
import { Roboto_Mono, Inter } from 'next/font/google';
import Image from 'next/image';
import { Github, Heart, Shield } from 'lucide-react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ActiveLink } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import UserButton from '@/components/auth0/user-button';
import { auth0 } from '@/lib/auth0';

const robotoMono = Roboto_Mono({ weight: '400', subsets: ['latin'] });
const publicSans = Inter({ weight: '400', subsets: ['latin'] });

const TITLE = 'HealthPilot: Secure AI Health Agent';
const DESCRIPTION =
  'Coordinate your healthcare across MyChart, CVS Pharmacy, and Cigna Insurance with enterprise-grade security powered by Auth0 for AI Agents.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/svg+xml" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <NuqsAdapter>
          <div className="bg-secondary grid grid-rows-[auto,1fr] h-[100dvh]">
            <div className="grid grid-cols-[1fr,auto] gap-2 p-4 bg-red-900">
              <div className="flex gap-4 flex-col md:flex-row md:items-center">
                <div className="flex items-center gap-2 px-4">
                  <div className="p-1 bg-white/10 rounded-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className={`${robotoMono.className} text-white text-2xl font-bold`}>HealthPilot</span>
                </div>
                <span className="hidden md:inline-flex items-center gap-1 text-xs text-red-200 bg-red-800/50 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  <span>Auth0 for AI Agents</span>
                </span>
                <nav className="flex gap-1 flex-col md:flex-row">
                  <ActiveLink href="/">Chat</ActiveLink>
                  <ActiveLink href="/documents">Documents</ActiveLink>
                </nav>
              </div>
              <div className="flex justify-center">
                {session && (
                  <div className="flex items-center gap-2 px-4 text-white">
                    <UserButton user={session?.user!} logoutUrl="/auth/logout" />
                  </div>
                )}
                <Button asChild variant="header" size="default">
                  <a href="https://github.com/oktadev/auth0-assistant0" target="_blank">
                    <Github className="size-3" />
                    <span>Open in GitHub</span>
                  </a>
                </Button>
              </div>
            </div>
            <div className="gradient-up bg-gradient-to-b from-white/10 to-white/0 relative grid border-input border-b-0">
              <div className="absolute inset-0">{children}</div>
            </div>
          </div>
          <Toaster richColors />
        </NuqsAdapter>
      </body>
    </html>
  );
}
