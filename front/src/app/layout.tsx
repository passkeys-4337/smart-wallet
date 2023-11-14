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

export const metadata = {
  title: "HocusPocus XYZ",
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
                    <Theme>
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
