"use client";

interface Step {
  label: string;
  status: "completed" | "active" | "waiting";
}

interface ProgressFeedProps {
  steps: Step[];
}

export default function ProgressFeed({ steps }: ProgressFeedProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {steps.map((step, i) => (
        <div key={i} className={`progress-step ${step.status}`}>
          <div style={{ minWidth: 24, display: "flex", justifyContent: "center" }}>
            {step.status === "completed" && (
              <span style={{ color: "var(--success)", fontSize: 16 }}>✓</span>
            )}
            {step.status === "active" && <div className="pulse-dot" />}
            {step.status === "waiting" && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--text-muted)",
                  display: "block",
                  opacity: 0.4,
                }}
              />
            )}
          </div>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
