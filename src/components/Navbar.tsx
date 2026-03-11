"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "white",
            }}
          >
            Z
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Project Z
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
          className="desktop-nav"
        >
          <Link
            href="#features"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            Features
          </Link>
          <Link
            href="#pricing"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            Pricing
          </Link>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Dashboard →
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            fontSize: 24,
            cursor: "pointer",
          }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderTop: "1px solid var(--border-subtle)",
            background: "rgba(10, 10, 15, 0.95)",
          }}
        >
          <Link
            href="#features"
            onClick={() => setMobileOpen(false)}
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 16,
            }}
          >
            Features
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 16,
            }}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{
              textAlign: "center",
              textDecoration: "none",
              padding: "10px 20px",
            }}
          >
            Dashboard →
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
