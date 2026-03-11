"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import ProgressFeed from "@/components/ProgressFeed";

interface Document {
  id: string;
  tailoredCvText?: string;
  coverLetterText?: string;
}

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  jobUrl?: string;
  status: string;
  createdAt: string;
  appliedAt?: string;
  documents: Document[];
}

type Step = { label: string; status: "completed" | "active" | "waiting" };

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // New application form state
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Apply state
  const [applying, setApplying] = useState<string | null>(null);
  const [applySteps, setApplySteps] = useState<Step[]>([]);
  const [generatedDoc, setGeneratedDoc] = useState<Document | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("pz_token") : null;

  const fetchApplications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchApplications();
  }, [fetchApplications]);

  async function handleCreateApplication(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const token = getToken();

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyName, jobTitle, jobDescription, jobUrl }),
      });
      if (res.ok) {
        setCompanyName("");
        setJobTitle("");
        setJobDescription("");
        setJobUrl("");
        setShowNewForm(false);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  }

  async function handleApply(appId: string) {
    const token = getToken();
    if (!token) return;

    setApplying(appId);
    setGeneratedDoc(null);
    setApplyError(null);
    setApplySteps([
      { label: "Analyzing the role...", status: "active" },
      { label: "Tailoring your CV...", status: "waiting" },
      { label: "Writing cover letter...", status: "waiting" },
    ]);

    // Simulate step 1 progress
    const stepTimer = setTimeout(() => {
      setApplySteps([
        { label: "Analyzing the role...", status: "completed" },
        { label: "Tailoring your CV...", status: "active" },
        { label: "Writing cover letter...", status: "waiting" },
      ]);
    }, 1500);

    try {
      const res = await fetch(`/api/applications/${appId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      clearTimeout(stepTimer);

      if (!res.ok) {
        // API returned an error (e.g., "Please upload your CV first")
        setApplySteps([
          { label: data.error || "Something went wrong", status: "waiting" },
        ]);
        setApplyError(data.error || "Failed to generate documents");
        setTimeout(() => {
          setApplying(null);
          setApplySteps([]);
        }, 4000);
        return;
      }

      // Success — show all completed
      setApplySteps([
        { label: "Analyzing the role...", status: "completed" },
        { label: "Tailoring your CV...", status: "completed" },
        { label: "Writing cover letter...", status: "completed" },
      ]);

      if (data.document) {
        setGeneratedDoc(data.document);
      }

      fetchApplications();
      setTimeout(() => {
        setApplying(null);
        setApplySteps([]);
      }, 1500);
    } catch (err) {
      clearTimeout(stepTimer);
      console.error(err);
      setApplySteps([
        { label: "Network error. Please try again.", status: "waiting" },
      ]);
      setApplyError("Network error");
      setTimeout(() => {
        setApplying(null);
        setApplySteps([]);
        setApplyError(null);
      }, 4000);
    }
  }

  const token = mounted ? getToken() : null;

  return (
    <>
      <Navbar />
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "96px 24px 60px",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
              Track your applications and documents
            </p>
          </div>
          {token && (
            <button
              className="btn-primary"
              onClick={() => setShowNewForm(!showNewForm)}
            >
              {showNewForm ? "Cancel" : "+ New Application"}
            </button>
          )}
        </div>

        {/* Not logged in */}
        {!token && !loading && (
          <div
            className="glass-card"
            style={{
              padding: 48,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 48 }}>📄</div>
            <h2 style={{ fontWeight: 600 }}>Upload your CV first</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 400 }}>
              Head to the home page and drop your CV to create your profile.
              Then come back here to start applying.
            </p>
            <a href="/" className="btn-primary" style={{ textDecoration: "none" }}>
              ← Go to Home
            </a>
          </div>
        )}

        {/* New Application Form */}
        {showNewForm && (
          <form
            onSubmit={handleCreateApplication}
            className="glass-card fade-in-up"
            style={{
              padding: 28,
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h3 style={{ fontWeight: 600 }}>Target a New Job</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <input
                className="input-field"
                placeholder="Company Name (e.g., Tesla)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <input
                className="input-field"
                placeholder="Job Title (e.g., Operations Manager)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>
            <input
              className="input-field"
              placeholder="Job URL (optional)"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
            <textarea
              className="input-field"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              required
              style={{ resize: "vertical" }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ alignSelf: "flex-end" }}
            >
              {submitting ? "Creating..." : "Create Application"}
            </button>
          </form>
        )}

        {/* Apply Progress */}
        {applying && applySteps.length > 0 && (
          <div
            className="glass-card fade-in-up"
            style={{ padding: 24, marginBottom: 24 }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
              {applyError ? "Error" : "Generating Documents..."}
            </h3>
            {applyError ? (
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--danger)",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ {applyError}
              </div>
            ) : (
              <ProgressFeed steps={applySteps} />
            )}
          </div>
        )}

        {/* Generated Document Preview */}
        {generatedDoc && (
          <div
            className="glass-card fade-in-up"
            style={{ padding: 28, marginBottom: 24 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontWeight: 600 }}>Generated Documents</h3>
              <span className="badge badge-success">
                <span>✓</span> Ready
              </span>
            </div>

            {generatedDoc.coverLetterText && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Cover Letter
                </h4>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "var(--radius-md)",
                    padding: 20,
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {generatedDoc.coverLetterText}
                </div>
              </div>
            )}

            {generatedDoc.tailoredCvText && (
              <div>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Tailored CV
                </h4>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "var(--radius-md)",
                    padding: 20,
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
                  {generatedDoc.tailoredCvText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applications List */}
        {token && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications.length === 0 && !showNewForm && (
              <div
                className="glass-card"
                style={{ padding: 40, textAlign: "center" }}
              >
                <p style={{ color: "var(--text-muted)" }}>
                  No applications yet. Click &quot;+ New Application&quot; to get
                  started.
                </p>
              </div>
            )}

            {applications.map((app) => (
              <div key={app.id}>
                <div
                  className="glass-card"
                  style={{
                    padding: 20,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                  onClick={() =>
                    setSelectedApp(
                      selectedApp?.id === app.id ? null : app
                    )
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "var(--accent-gradient)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {app.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {app.jobTitle}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {app.companyName} ·{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <StatusBadge status={app.status} />
                    {app.status === "drafting" && (
                      <button
                        className="btn-primary"
                        style={{ padding: "6px 16px", fontSize: "0.8rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(app.id);
                        }}
                      >
                        Generate Docs
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {selectedApp?.id === app.id && (
                  <div
                    className="fade-in-up"
                    style={{
                      padding: "20px 20px 20px 76px",
                      borderTop: "1px solid var(--border-subtle)",
                      background: "rgba(255,255,255,0.01)",
                      borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                    }}
                  >
                    {app.documents.length > 0 ? (
                      app.documents.map((doc) => (
                        <div key={doc.id}>
                          {doc.coverLetterText && (
                            <div style={{ marginBottom: 16 }}>
                              <h4
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--text-secondary)",
                                  marginBottom: 6,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                Cover Letter
                              </h4>
                              <p
                                style={{
                                  fontSize: "0.9rem",
                                  lineHeight: 1.7,
                                  whiteSpace: "pre-wrap",
                                  maxHeight: 200,
                                  overflowY: "auto",
                                }}
                              >
                                {doc.coverLetterText}
                              </p>
                            </div>
                          )}
                          {doc.tailoredCvText && (
                            <div>
                              <h4
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--text-secondary)",
                                  marginBottom: 6,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                Tailored CV
                              </h4>
                              <p
                                style={{
                                  fontSize: "0.9rem",
                                  lineHeight: 1.7,
                                  whiteSpace: "pre-wrap",
                                  maxHeight: 200,
                                  overflowY: "auto",
                                }}
                              >
                                {doc.tailoredCvText}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        No documents generated yet. Click &quot;Generate
                        Docs&quot; to tailor your CV and cover letter.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: 80,
                  borderRadius: "var(--radius-lg)",
                }}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
