"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Dropzone from "@/components/Dropzone";
import ProgressFeed from "@/components/ProgressFeed";
import PricingCard from "@/components/PricingCard";

type Step = { label: string; status: "completed" | "active" | "waiting" };

interface ExtractedProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  yearsOfExperience?: number;
  jobTitles?: string[];
  industries?: string[];
  education?: string[];
  summary?: string;
}

export default function HomePage() {
  const [uploadState, setUploadState] = useState<
    "idle" | "processing" | "done"
  >("idle");
  const [progressSteps, setProgressSteps] = useState<Step[]>([]);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);

  async function handleFileUpload(file: File) {
    setUploadState("processing");
    setProgressSteps([
      { label: "Reading your CV...", status: "active" },
      { label: "Extracting skills and experience...", status: "waiting" },
      { label: "Building your profile...", status: "waiting" },
    ]);

    // Simulate step progress (in production: use SSE or WebSocket)
    setTimeout(() => {
      setProgressSteps([
        { label: "Reading your CV...", status: "completed" },
        { label: "Extracting skills and experience...", status: "active" },
        { label: "Building your profile...", status: "waiting" },
      ]);
    }, 1500);

    try {
      // For demo: register a temp user and upload
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `demo-${Date.now()}@projectz.ai`,
          password: "demo1234",
        }),
      });
      const regData = await regRes.json();
      const token = regData.token;

      if (token) {
        localStorage.setItem("pz_token", token);
        localStorage.setItem("pz_user", JSON.stringify(regData.user));

        const formData = new FormData();
        formData.append("cv", file);

        setProgressSteps([
          { label: "Reading your CV...", status: "completed" },
          { label: "Extracting skills and experience...", status: "active" },
          { label: "Building your profile...", status: "waiting" },
        ]);

        const uploadRes = await fetch("/api/profile/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          // Upload failed — show error then reset
          setProgressSteps([
            { label: "Reading your CV...", status: "completed" },
            {
              label: uploadData.error || "Failed to process CV. Try again.",
              status: "waiting",
            },
          ]);
          setTimeout(() => setUploadState("idle"), 4000);
          return;
        }

        setProgressSteps([
          { label: "Reading your CV...", status: "completed" },
          { label: "Extracting skills and experience...", status: "completed" },
          { label: "Building your profile...", status: "completed" },
        ]);

        setExtractedProfile(uploadData.profile);
        setUploadState("done");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setProgressSteps([
        { label: "Reading your CV...", status: "completed" },
        {
          label: "Something went wrong. Please try again.",
          status: "waiting",
        },
      ]);
      setTimeout(() => setUploadState("idle"), 4000);
    }
  }

  return (
    <>
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          overflow: "hidden",
        }}
      >
        {/* Background Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div
          className="fade-in-up"
          style={{ maxWidth: 720, position: "relative", zIndex: 1 }}
        >
          {/* Tag */}
          <div
            className="fade-in-up-delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: 20,
              fontSize: "0.8rem",
              color: "var(--accent-secondary)",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 12 }}>⚡</span>
            AI-Powered Career Agent
          </div>

          {/* Headline */}
          <h1
            className="fade-in-up-delay-2"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            Your career on{" "}
            <span className="gradient-text">autopilot.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="fade-in-up-delay-3"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Upload your CV — Project Z reads it, tailors it to every job, writes
            your cover letter, and submits the application. While you sleep.
          </p>

          {/* Dropzone */}
          <div
            className="fade-in-up-delay-4"
            style={{ maxWidth: 520, margin: "0 auto" }}
          >
            <Dropzone
              onFileAccepted={handleFileUpload}
              isLoading={uploadState === "processing"}
            />
          </div>

          {/* Progress Feed */}
          {progressSteps.length > 0 && (
            <div
              className="glass-card fade-in-up"
              style={{
                marginTop: 24,
                padding: 24,
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <ProgressFeed steps={progressSteps} />
            </div>
          )}

          {/* Extracted Profile Preview */}
          {extractedProfile && (
            <div
              className="glass-card fade-in-up"
              style={{
                marginTop: 24,
                padding: 24,
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontWeight: 600 }}>Your Profile</h3>
                <span className="badge badge-success">
                  <span>✓</span> Extracted
                </span>
              </div>
              {extractedProfile.name && (
                <p>
                  <strong>Name:</strong>{" "}
                  {String(extractedProfile.name)}
                </p>
              )}
              {extractedProfile.yearsOfExperience && (
                <p style={{ marginTop: 4 }}>
                  <strong>Experience:</strong>{" "}
                  {String(extractedProfile.yearsOfExperience)} years
                </p>
              )}
              {Array.isArray(extractedProfile.skills) && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  {extractedProfile.skills.slice(0, 8).map(
                    (skill, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "4px 10px",
                          background: "rgba(99, 102, 241, 0.1)",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: 6,
                          fontSize: "0.8rem",
                          color: "var(--accent-secondary)",
                        }}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              )}
              <a
                href="/dashboard"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 20,
                  textDecoration: "none",
                  display: "flex",
                }}
              >
                Go to Dashboard →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section
        id="features"
        style={{
          padding: "100px 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Everything happens{" "}
            <span className="gradient-text">automatically.</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              marginTop: 12,
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            From CV analysis to job submission — zero manual work.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: "🧠",
              title: "AI Profile Extraction",
              desc: "Drop your CV and Gemini instantly extracts your skills, experience, and industry focus into a structured profile.",
            },
            {
              icon: "✍️",
              title: "Smart CV Tailoring",
              desc: "For each job, your CV is rewritten using the exact keywords from the job description — without inventing experience.",
            },
            {
              icon: "💌",
              title: "Custom Cover Letters",
              desc: "Three paragraphs. Confident and human-sounding. Connects your top skills to the company's biggest needs.",
            },
            {
              icon: "🤖",
              title: "Auto-Submit Engine",
              desc: "Playwright navigates company career pages, fills in forms, uploads documents, and clicks submit — all autonomously.",
            },
            {
              icon: "🛡️",
              title: "Co-Pilot Mode",
              desc: "When it hits a CAPTCHA or complex login, Project Z pauses and hands control to you with everything pre-filled.",
            },
            {
              icon: "📊",
              title: "Live Dashboard",
              desc: "Track every application with real-time status badges. See exactly what was sent on your behalf.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: 28 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(99, 102, 241, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section
        id="pricing"
        style={{
          padding: "100px 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Simple, transparent{" "}
            <span className="gradient-text">pricing.</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              marginTop: 12,
            }}
          >
            Start free. Upgrade when you're ready to go all in.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <PricingCard
            tier="Spark"
            price="$0"
            description="Prove the product works. 3 free applications."
            features={[
              { text: "3 custom CV generations", included: true },
              { text: "3 custom cover letters", included: true },
              { text: "Autonomous submission", included: true },
              { text: "Co-Pilot mode (Workday)", included: false },
              { text: "Full application history", included: false },
              { text: "Priority processing", included: false },
            ]}
          />
          <PricingCard
            tier="Momentum"
            price="$29"
            period="month"
            description="For the active job seeker. The sweet spot."
            highlighted
            badge="Most Popular"
            features={[
              { text: "50 CV generations / month", included: true },
              { text: "50 cover letters / month", included: true },
              { text: "Autonomous submission", included: true },
              { text: "Co-Pilot mode (Workday)", included: true },
              { text: "Full application history", included: true },
              { text: "Priority processing", included: false },
            ]}
          />
          <PricingCard
            tier="Apex"
            price="$79"
            period="month"
            description="Unlimited power for aggressive searches."
            features={[
              { text: "Unlimited CV generations", included: true },
              { text: "Unlimited cover letters", included: true },
              { text: "Autonomous submission", included: true },
              { text: "Co-Pilot mode (Workday)", included: true },
              { text: "Full application history", included: true },
              { text: "Priority processing", included: true },
            ]}
          />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          padding: "40px 24px",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} Project Z. Your career, on autopilot.
        </p>
      </footer>
    </>
  );
}
