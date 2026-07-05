"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

function readAppBgSolid() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--app-bg-solid")
      .trim() || "#fafafa"
  );
}

function setThemeColor(color: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = color;
}

export function ThemeChrome() {
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    const sync = () => setThemeColor(readAppBgSolid());

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme"],
    });

    return () => observer.disconnect();
  }, [resolvedTheme, theme]);

  return null;
}
