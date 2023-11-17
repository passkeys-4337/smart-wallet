import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import ThemeProvider from "@/providers/ThemeProvider";
import { WalletConnectProvider } from "@/libs/wallet-connect";
import { SmartWalletProvider } from "@/libs/smart-wallet/SmartWalletProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import { BalanceProvider } from "@/providers/BalanceProvider";
import { MeProvider } from "@/providers/MeProvider";
import { TransactionProvider } from "@/providers/TransactionProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Wallet",
  description: "Passkeys X ERC-4337",
  viewport: {
    width: "device-width",
    height: "device-height",
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

const css = {
  padding: "1rem",
  flexGrow: 1,
  flexBasis: "100%",
  display: "flex",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <MeProvider>
          <TransactionProvider>
            <BalanceProvider>
              <SmartWalletProvider>
                <WalletConnectProvider>
                  <ThemeProvider attribute="class">
                    <Theme style={css} radius={"full"} accentColor={"teal"}>
                      <ModalProvider>{children}</ModalProvider>
                    </Theme>
                  </ThemeProvider>
                </WalletConnectProvider>
              </SmartWalletProvider>
            </BalanceProvider>
          </TransactionProvider>
        </MeProvider>
      </body>
    </html>
  );
}
