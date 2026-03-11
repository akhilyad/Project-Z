"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading?: boolean;
}

export default function Dropzone({ onFileAccepted, isLoading }: DropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  function handleFile(file: File) {
    if (!allowedTypes.includes(file.type)) {
      setStatus("error");
      setErrorMsg("Please use a PDF or Word document.");
      setFileName("");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }
    setStatus("success");
    setFileName(file.name);
    setErrorMsg("");
    onFileAccepted(file);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const stateClass = dragOver
    ? "drag-over"
    : status === "success"
    ? "success"
    : status === "error"
    ? "error"
    : "";

  return (
    <div
      id="dropzone"
      className={`dropzone ${stateClass}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? "none" : "auto" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={onChange}
        style={{ display: "none" }}
        aria-label="Upload your CV"
      />

      {isLoading ? (
        <>
          <div className="pulse-dot" style={{ width: 24, height: 24 }} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Analyzing your CV...
          </span>
        </>
      ) : status === "success" ? (
        <>
          <span style={{ fontSize: 40 }}>✓</span>
          <span style={{ color: "var(--success)", fontWeight: 600 }}>
            {fileName}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Click to upload a different file
          </span>
        </>
      ) : status === "error" ? (
        <>
          <span style={{ fontSize: 40 }}>✕</span>
          <span style={{ color: "var(--danger)", fontWeight: 600 }}>
            {errorMsg}
          </span>
        </>
      ) : (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(99, 102, 241, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            📄
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>
              Drop your CV here to begin
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
              PDF, DOCX, or TXT — max 10MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}
