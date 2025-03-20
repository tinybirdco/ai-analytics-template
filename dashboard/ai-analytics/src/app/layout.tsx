import { headers } from 'next/headers';
import { Inter } from "next/font/google";
import "./globals.css";
import { TinybirdProvider } from '@/providers/TinybirdProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from './context/ModalContext';
import { RootLayoutContent } from './components/RootLayoutContent';

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const token = headersList.get('x-tinybird-token') || '';
  const orgName = headersList.get('x-org-name') || '';

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClerkProvider>
          <TinybirdProvider>
            <ModalProvider>
              <RootLayoutContent initialToken={token} initialOrgName={orgName}>
                {children}
              </RootLayoutContent>
            </ModalProvider>
          </TinybirdProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}