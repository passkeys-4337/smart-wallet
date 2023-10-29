import "@rainbow-me/rainbowkit/styles.css";
import "@radix-ui/themes/styles.css";
import { Providers } from "./providers";
import { Theme, ThemePanel } from "@radix-ui/themes";
import ThemeProvider from "@/components/ThemeProvider.tsx";
import { WalletConnectProvider } from "@/libs/wallet-connect";

export const metadata = {
  title: "wagmi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <WalletConnectProvider>
          <ThemeProvider attribute="class">
            <Theme>
              <Providers>{children}</Providers>
              {/* <ThemePanel /> */}
            </Theme>
          </ThemeProvider>
        </WalletConnectProvider>
      </body>
    </html>
  );
}
