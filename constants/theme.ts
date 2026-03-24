import { Platform } from "react-native";

export const AppColors = {
  // Gemini gradient palette
  primary: "#4285F4",
  primaryLight: "#669DF6",
  primaryDark: "#1A73E8",
  accent: "#9B72CB",
  accentLight: "#C4A8E0",

  gradient: {
    primary: ["#4285F4", "#9B72CB", "#D96570"] as const,
    header: ["#1A73E8", "#4285F4", "#9B72CB"] as const,
    card: ["#EDE7F6", "#E8F0FE"] as const,
    dark: ["#1A1A2E", "#2D1B69"] as const,
    button: ["#4285F4", "#9B72CB"] as const,
    login: ["#1A1A2E", "#2D1B69", "#4285F4"] as const,
    hero: ["#2D1B69", "#4285F4"] as const,
  },

  status: {
    active: "#22C55E",
    inMaintenance: "#F59E0B",
    retired: "#EF4444",
    available: "#4285F4",
    assigned: "#9B72CB",
    disposed: "#6B7280",
  },

  text: {
    primary: "#1A1A2E",
    secondary: "#475569",
    light: "#94A3B8",
    white: "#FFFFFF",
    link: "#4285F4",
  },

  bg: {
    primary: "#F8F7FC",
    card: "#FFFFFF",
    input: "#F3F0FA",
    border: "#E2E0F0",
  },
};

export const Colors = {
  light: {
    text: "#1A1A2E",
    background: "#F8F7FC",
    tint: "#4285F4",
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#4285F4",
  },
  dark: {
    text: "#E2E8F0",
    background: "#1A1A2E",
    tint: "#9B72CB",
    icon: "#94A3B8",
    tabIconDefault: "#64748B",
    tabIconSelected: "#9B72CB",
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
