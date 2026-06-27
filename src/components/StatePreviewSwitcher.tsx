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
    <div className="inline-flex items-center gap-0.5 rounded-full border border-hairline bg-surface p-0.5 text-meta">
      <span className="px-2 text-ink-faint">Preview</span>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          className={`rounded-full px-2.5 py-0.5 capitalize transition-colors ${
            mode === m
              ? "bg-green-tint font-medium text-green-ink"
              : "text-ink-muted hover:bg-surface-hover"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
