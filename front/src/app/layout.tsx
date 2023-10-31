import "@rainbow-me/rainbowkit/styles.css";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import ThemeProvider from "@/components/ThemeProvider.tsx";
import { WalletConnectProvider } from "@/libs/wallet-connect";
import { SmartWalletProvider } from "@/libs/smart-wallet/SmartWalletProvider";

export const metadata = {
  title: "HocusPocus XYZ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SmartWalletProvider>
          <WalletConnectProvider>
            <ThemeProvider attribute="class">
              <Theme>
                {children}
                {/* <ThemePanel /> */}
              </Theme>
            </ThemeProvider>
          </WalletConnectProvider>
        </SmartWalletProvider>
      </body>
    </html>
  );
}
