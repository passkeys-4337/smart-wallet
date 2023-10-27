import "@rainbow-me/rainbowkit/styles.css";
import "@radix-ui/themes/styles.css";
import { Providers } from "./providers";
import { Theme, ThemePanel } from "@radix-ui/themes";
import ThemeProvider from "@/components/ThemeProvider.tsx";
import { serviceFactory } from "@/libs/service-factory";

export const metadata = {
  title: "wagmi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  serviceFactory.init();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class">
          <Theme>
            <Providers>{children}</Providers>
            <ThemePanel />
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
