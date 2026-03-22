import { Platform } from "react-native";

export const AppColors = {
  primary: "#2563EB",
  primaryLight: "#3B82F6",
  primaryDark: "#1D4ED8",
  accent: "#60A5FA",
  accentLight: "#93C5FD",

  gradient: {
    primary: ["#2563EB", "#60A5FA"] as const,
    header: ["#1D4ED8", "#2563EB", "#3B82F6"] as const,
    card: ["#EFF6FF", "#DBEAFE"] as const,
    dark: ["#0F172A", "#1E293B"] as const,
  },

  status: {
    active: "#22C55E",
    inMaintenance: "#F59E0B",
    retired: "#EF4444",
    available: "#3B82F6",
    assigned: "#8B5CF6",
    disposed: "#6B7280",
  },

  text: {
    primary: "#0F172A",
    secondary: "#475569",
    light: "#94A3B8",
    white: "#FFFFFF",
    link: "#2563EB",
  },

  bg: {
    primary: "#F8FAFC",
    card: "#FFFFFF",
    input: "#F1F5F9",
    border: "#E2E8F0",
  },
};

export const Colors = {
  light: {
    text: "#0F172A",
    background: "#F8FAFC",
    tint: "#2563EB",
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#2563EB",
  },
  dark: {
    text: "#E2E8F0",
    background: "#0F172A",
    tint: "#60A5FA",
    icon: "#94A3B8",
    tabIconDefault: "#64748B",
    tabIconSelected: "#60A5FA",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
