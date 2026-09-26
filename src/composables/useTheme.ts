import { computed, ref, watchEffect } from "vue";

// Dark/light theme (see brand/BRAND.md §2). Follows the OS until the user picks one; the choice
// is written to <html data-theme> so brand/tokens.css switches its semantic tokens.
export type Theme = "dark" | "light";

const STORAGE_KEY = "fd-theme";
const lightQuery = window.matchMedia("(prefers-color-scheme: light)");

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

const chosenTheme = ref<Theme | null>(readStoredTheme());
const systemTheme = ref<Theme>(lightQuery.matches ? "light" : "dark");
lightQuery.addEventListener("change", (event) => {
  systemTheme.value = event.matches ? "light" : "dark";
});

export const theme = computed<Theme>(() => chosenTheme.value ?? systemTheme.value);

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value;
});

export function toggleTheme(): void {
  chosenTheme.value = theme.value === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(STORAGE_KEY, chosenTheme.value);
  } catch {
    // Storage can be unavailable (private mode) - the choice still applies for this session
  }
}
