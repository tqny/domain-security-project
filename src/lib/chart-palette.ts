/**
 * Chart palette system — derives series colors from --primary via color-mix().
 * Pattern adapted from shadcnblocks dashboard1.
 *
 * Usage with ChartConfig:
 *   const config = { series: { label: "X", color: palette.primary } } satisfies ChartConfig
 *
 * For multi-series, use palette.secondary.dark (dark-mode value)
 * since this project is dark-only.
 */

const mixBase = "var(--background)";

export const palette = {
  /** Full amber primary — var(--primary) */
  primary: "var(--primary)",
  /** 80% primary mixed toward background */
  secondary: `color-mix(in oklch, var(--primary) 80%, ${mixBase})`,
  /** 60% primary */
  tertiary: `color-mix(in oklch, var(--primary) 60%, ${mixBase})`,
  /** 42% primary */
  quaternary: `color-mix(in oklch, var(--primary) 42%, ${mixBase})`,
  /** 25% primary — muted, for backgrounds or least-important series */
  muted: `color-mix(in oklch, var(--primary) 25%, ${mixBase})`,

  /** Semantic colors for status-aware charts */
  success: "var(--success)",
  destructive: "var(--destructive)",
  info: "var(--info)",
  warning: "var(--warning)",
  foreground: "var(--foreground)",
  textSecondary: "var(--text-secondary)",
};

/** Common Recharts axis/grid configuration for consistent chart styling */
export const chartTheme = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 10, fill: "var(--text-secondary)" },
  grid: {
    strokeDasharray: "0",
    vertical: false,
    stroke: "var(--chart-grid)",
  },
} as const;
