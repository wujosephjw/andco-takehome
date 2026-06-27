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
    <div className="inline-flex w-full items-center gap-0.5 rounded-full border border-white/70 bg-glass-strong p-1 text-meta shadow-rest backdrop-blur-xl">
      <span className="px-2 text-ink-faint">Preview</span>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          className={`flex-1 rounded-full px-2 py-1 capitalize transition-colors ${
            mode === m
              ? "bg-white/80 font-medium text-ink shadow-rest"
              : "text-ink-muted hover:bg-white/55 hover:text-ink"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
