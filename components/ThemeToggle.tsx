"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import Icon from "@/components/Icon";

const themeModes = ["light", "dark", "system"] as const;
type ThemeMode = (typeof themeModes)[number];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function isThemeMode(theme: string | undefined): theme is ThemeMode {
  return themeModes.includes(theme as ThemeMode);
}

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  const icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return <Icon icon={icon} size={18} />;
}

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const currentTheme = mounted && isThemeMode(theme) ? theme : "system";
  const currentIndex = themeModes.indexOf(currentTheme);
  const nextTheme = themeModes[(currentIndex + 1) % themeModes.length] ?? "system";

  return (
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted transition duration-200 hover:border-accent hover:text-accent disabled:cursor-wait"
      onClick={() => setTheme(nextTheme)}
      disabled={!mounted}
      aria-label={
        mounted
          ? `Theme is ${currentTheme}. Switch to ${nextTheme} theme.`
          : "Theme preference loading"
      }
      title={mounted ? `Theme: ${currentTheme}` : "Theme preference loading"}
    >
      {mounted ? <ThemeIcon theme={currentTheme} /> : <span aria-hidden="true" className="h-[18px] w-[18px]" />}
    </button>
  );
}
