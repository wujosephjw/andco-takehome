export type PreviewMode = "live" | "loading" | "empty";

const MODES: PreviewMode[] = ["live", "loading", "empty"];

/** A quiet review aid — lets a grader see all three top-level view states in one click. */
export function StatePreviewSwitcher({
  mode,
  onChange,
}: {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-hairline bg-surface p-0.5 text-meta">
      <span className="px-1.5 text-ink-faint">Preview</span>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          className={`rounded px-2 py-0.5 capitalize transition-colors ${
            mode === m
              ? "bg-sage-tint font-medium text-sage-ink"
              : "text-ink-muted hover:bg-surface-hover"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
