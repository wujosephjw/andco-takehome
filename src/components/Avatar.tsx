function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={`inline-flex size-5 items-center justify-center rounded-full bg-sunk text-[10px] font-medium text-ink-muted ${className ?? ""}`}
      title={name}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}

/** Avatar + first name, for the row's assignee cell. */
export function AssigneeChip({ name }: { name: string }) {
  const first = name.split(/\s+/)[0];
  return (
    <span className="inline-flex items-center gap-1.5">
      <Avatar name={name} />
      <span className="text-meta text-ink-muted">{first}</span>
    </span>
  );
}
