import { useEffect } from "react";
import usePersistentState from "./usePersistentState";

function getInitialTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

/**
 * Theme state persisted to localStorage and applied to the document root as
 * `data-theme`. Defaults to the OS preference on first visit.
 */
export default function useTheme() {
  const [theme, setTheme] = usePersistentState("theme", getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return [theme, toggleTheme];
}
