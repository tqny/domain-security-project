export function DetailRow({ label, value, children, mono }: { label: string; value?: string; children?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{children ?? value}</span>
    </div>
  )
}

export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}
