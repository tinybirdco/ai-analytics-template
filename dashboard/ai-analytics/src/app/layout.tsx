import { headers } from 'next/headers';
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { TinybirdProvider } from '@/providers/TinybirdProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from './context/ModalContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { RootLayoutContent } from './components/RootLayoutContent';

const roboto = Roboto({
  weight: ['400'],
  subsets: ['latin'],
});
const robotoMono = Roboto_Mono({
  weight: ['400'],
  subsets: ['latin'],
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const token = headersList.get('x-tinybird-token') || '';
  const orgName = headersList.get('x-org-name') || '';

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className={`${roboto.className} ${robotoMono.className}`}>
        <ClerkProvider>
          <TinybirdProvider>
            <ModalProvider>
              <OnboardingProvider>
                <RootLayoutContent initialToken={token} initialOrgName={orgName}>
                  {children}
                </RootLayoutContent>
              </OnboardingProvider>
            </ModalProvider>
          </TinybirdProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}