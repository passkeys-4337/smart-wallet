"use client";

import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTheme } from "next-themes";
import { CSSProperties, useEffect, useState } from "react";

type Props = {
  style?: CSSProperties;
};

export default function ThemeButton({ style }: Props) {
  const { theme, setTheme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <IconButton
      style={style}
      variant={"soft"}
      size={"3"}
      onClick={() => {
        if (theme === "system") {
          setTheme(systemTheme === "dark" ? "light" : "dark");
          return;
        }
        if (theme === "dark") {
          setTheme("light");
          return;
        }
        if (theme === "light") {
          setTheme("dark");
          return;
        }
      }}
    >
      {(theme === "system" && systemTheme === "dark") || theme === "dark" ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </IconButton>
  );
}
