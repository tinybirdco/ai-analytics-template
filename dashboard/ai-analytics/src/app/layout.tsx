import { headers } from 'next/headers';
import { Inter, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { TinybirdProvider } from '@/providers/TinybirdProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from './context/ModalContext';
import { RootLayoutContent } from './components/RootLayoutContent';

const inter = Inter({ subsets: ["latin"] });
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