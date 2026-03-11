"use client";

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  badge?: string;
}

export default function PricingCard({
  tier,
  price,
  period,
  description,
  features,
  highlighted,
  badge,
}: PricingCardProps) {
  return (
    <div
      className="glass-card"
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
        border: highlighted
          ? "1px solid rgba(99, 102, 241, 0.4)"
          : undefined,
        boxShadow: highlighted
          ? "0 0 40px rgba(99, 102, 241, 0.15)"
          : undefined,
      }}
    >
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 24,
            background: "var(--accent-gradient)",
            color: "white",
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {badge}
        </div>
      )}

      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          {tier}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 800 }}>{price}</span>
          {period && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              /{period}
            </span>
          )}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 8 }}>
          {description}
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.9rem",
              color: f.included ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <span
              style={{
                color: f.included ? "var(--success)" : "var(--text-muted)",
                fontSize: 14,
              }}
            >
              {f.included ? "✓" : "—"}
            </span>
            {f.text}
          </div>
        ))}
      </div>

      <button
        className={highlighted ? "btn-primary" : "btn-secondary"}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {price === "$0" ? "Get Started Free" : "Start Now"}
      </button>
    </div>
  );
}
