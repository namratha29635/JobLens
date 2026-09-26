import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { studentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  Badge,
  LoadingPage,
  EmptyState,
  Tabs,
} from "../../components/ui";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
  internship: "primary",
  hackathon: "purple",
  job: "success",
  other: "default",
};

function getExtendedDeadline(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setDate(d.getDate() + 40);
  return d;
}

function analyzeJobSafety(drive) {
  const risks = [];
  const warnings = [];

  const url = drive.applyLink || "";
  const company = drive.companyName || "";

  if (url && !url.startsWith("https://")) {
    risks.push("Link is not HTTPS");
  }

  if (url && /bit\.ly|tinyurl|t\.co|goo\.gl/.test(url)) {
    risks.push("Shortened URL detected");
  }

  const knownLegit = [
    "google",
    "microsoft",
    "amazon",
    "tcs",
    "infosys",
    "wipro",
    "accenture",
    "ibm",
  ];

  const compLower = company.toLowerCase();
  const isKnown = knownLegit.some((k) => compLower.includes(k));

  const score = 100 - risks.length * 30 - warnings.length * 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    risks,
    warnings,
    isKnown,
    verdict: score >= 80 ? "SAFE" : score >= 50 ? "CAUTION" : "HIGH RISK",
    color:
      score >= 80
        ? "var(--accent-green)"
        : score >= 50
          ? "var(--accent-orange)"
          : "var(--accent-red)",
  };
}

export default function OffCampusDrives() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [drives, setDrives] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [matchResume, setMatchResume] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // Resume upload state
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const hasResume = Boolean(profile?.resume?.url);

  const fetchDrives = async () => {
    if (!hasResume) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (matchResume) params.matchResume = true;

      const res = await studentAPI.getOffCampusFeed(params);
      setDrives(res.data.data.drives || []);
      setStudentSkills(res.data.data.studentSkills || profile?.skills || []);
    } catch {
      toast.error("Failed to load off-campus opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [category, matchResume, hasResume]);

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const file = selectedFile || (fileInputRef.current && fileInputRef.current.files[0]);
    if (!file) {
      toast.error("Please choose a resume file (PDF/DOCX)");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    try {
      await studentAPI.uploadResume(formData);
      toast.success("Resume uploaded and parsed successfully! Unlocking matched jobs...");
      await refreshProfile();
      setSelectedFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  // If no resume is uploaded, show the Resume Gating screen
  if (!hasResume) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Off-Campus Job Matching
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Upload your resume to unlock customized off-campus jobs and scam-verified recruitment feeds tailored to your skill set.
          </p>
        </div>

        <Card
          style={{
            padding: "36px 28px",
            textAlign: "center",
            border: "2px dashed var(--accent-primary)",
            background: "rgba(0, 212, 255, 0.03)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(0, 212, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              border: "1px solid rgba(0, 212, 255, 0.3)",
            }}
          >
            📄
          </div>

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
              Resume Required to View Matched Opportunities
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", maxWidth: "520px", lineHeight: "1.5" }}>
              To ensure you receive authentic, high-relevance job postings matching your branch, degree, and exact tech stack, please upload your resume first.
            </p>
          </div>

          <form onSubmit={handleResumeUpload} style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "16px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                background: "var(--bg-elevated)",
                color: selectedFile ? "var(--accent-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              📂 {selectedFile ? selectedFile.name : "Select PDF / DOCX Resume"}
            </button>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              style={{
                padding: "14px 24px",
                background: !selectedFile || uploading ? "var(--bg-card)" : "linear-gradient(135deg, var(--accent-primary), #0284c7)",
                color: !selectedFile || uploading ? "var(--text-muted)" : "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
                boxShadow: selectedFile ? "0 4px 14px rgba(0,212,255,0.3)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {uploading ? "⏳ Scanning & Uploading Resume..." : "🚀 Upload Resume & View Matching Jobs"}
            </button>
          </form>

          <div style={{ display: "flex", gap: "18px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              ✓ Auto Skill Extraction
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              ✓ AI Match Scoring
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              ✓ Fake Job & Scam Filter
            </span>
          </div>
        </Card>

        {/* Quick link to Job Verifier tool */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            background: "rgba(124, 58, 237, 0.08)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: "12px",
          }}
        >
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#c084fc", marginBottom: "2px" }}>
              🛡️ Have an external job offer or link to check?
            </h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Use our standalone AI Job Verifier to detect fake offers, unverified domains, and recruitment scams.
            </p>
          </div>
          <button
            onClick={() => navigate("/student/verifier")}
            style={{
              padding: "8px 16px",
              background: "rgba(124, 58, 237, 0.2)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              borderRadius: "8px",
              color: "#e9d5ff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Open Job Verifier →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              Off-Campus Opportunities
            </h1>
            <span
              style={{
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "var(--accent-green)",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "999px",
              }}
            >
              ✓ Resume Active
            </span>
          </div>

          <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
            AI-matched external opportunities and cyber-safe job postings matching your profile
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setMatchResume(!matchResume)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: matchResume ? "linear-gradient(135deg, var(--accent-primary), #7c3aed)" : "var(--bg-card)",
              border: `1px solid ${matchResume ? "transparent" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              color: matchResume ? "#fff" : "var(--text-primary)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: matchResume ? "0 4px 14px rgba(0,212,255,0.25)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            🎯 {matchResume ? "Matching Resume: ON" : "Match My Resume"}
          </button>

          <button
            onClick={() => navigate("/student/verifier")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "rgba(124, 58, 237, 0.12)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "var(--radius)",
              color: "#c084fc",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            🛡️ Job & Scam Verifier
          </button>

          <button
            onClick={() => navigate("/student/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            🔄 Update Resume / Skills
          </button>
        </div>
      </div>

      {studentSkills.length > 0 && matchResume && (
        <div style={{
          padding: "12px 18px",
          background: "rgba(0, 212, 255, 0.08)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          borderRadius: "var(--radius)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}>
          <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>Matching with your profile skills:</span>
          {studentSkills.slice(0, 10).map((s) => (
            <Badge key={s} variant="primary" size="sm">{s}</Badge>
          ))}
        </div>
      )}

      <Tabs
        tabs={[
          { value: "", label: "🌐 All Matched" },
          { value: "internship", label: "💼 Internships" },
          { value: "hackathon", label: "⚡ Hackathons" },
          { value: "job", label: "🏢 Jobs" },
          { value: "other", label: "📌 Other" },
        ]}
        active={category}
        onChange={setCategory}
      />

      {loading ? (
        <LoadingPage />
      ) : drives.length === 0 ? (
        <EmptyState
          icon="🌐"
          title="No opportunities found matching your profile"
          description="Try switching tabs or check back soon as new verified drives are posted regularly."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
            gap: "16px",
          }}
        >
          {drives.map((drive) => {
            const safety = analyzeJobSafety(drive);
            const extendedDeadline = getExtendedDeadline(drive.lastDateToApply);
            const isPassed = false;

            return (
              <Card
                key={drive._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      {drive.companyName}
                    </h3>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {drive.driveName}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "4px",
                    }}
                  >
                    <Badge
                      variant={CATEGORY_COLORS[drive.driveCategory]}
                      size="sm"
                    >
                      {drive.driveCategory}
                    </Badge>

                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontWeight: 700,
                        color: safety.color,
                        background: `${safety.color}15`,
                        border: `1px solid ${safety.color}30`,
                      }}
                    >
                      🛡 {safety.verdict}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "10px",
                    background: "var(--bg-elevated)",
                    borderRadius: "8px",
                    border: `1px solid ${safety.color}20`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Authenticity Score
                    </span>

                    <span
                      style={{
                        fontSize: "12px",
                        color: safety.color,
                        fontWeight: 700,
                      }}
                    >
                      {safety.score}/100
                    </span>
                  </div>

                  <div
                    style={{
                      background: "var(--bg-primary)",
                      borderRadius: "999px",
                      height: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: `${safety.score}%`,
                        height: "100%",
                        background: safety.color,
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    🎓 {(drive.eligibleBatches || []).join(", ")}
                  </span>

                  {extendedDeadline && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: isPassed
                          ? "var(--accent-red)"
                          : "var(--accent-orange)",
                        fontWeight: 600,
                      }}
                    >
                      ⏰ Apply by {extendedDeadline.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Resume Match Indicator */}
                {drive.resumeMatchScore !== undefined && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(0, 212, 255, 0.06)",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px" }}>🎯</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>
                        {drive.resumeMatchScore}% Resume Match
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background:
                          drive.resumeMatchScore >= 75
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(245, 158, 11, 0.2)",
                        color:
                          drive.resumeMatchScore >= 75
                            ? "var(--accent-green)"
                            : "var(--accent-orange)",
                      }}
                    >
                      {drive.matchLevel || "HIGH FIT"}
                    </span>
                  </div>
                )}

                {drive.matchedSkills && drive.matchedSkills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Matching Skills:</span>
                    {drive.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(34, 197, 94, 0.12)",
                          border: "1px solid rgba(34, 197, 94, 0.25)",
                          color: "var(--accent-green)",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                )}

                {expanded === drive._id && drive.description && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {drive.description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "auto",
                  }}
                >
                  <button
                    onClick={() =>
                      setExpanded(expanded === drive._id ? null : drive._id)
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {expanded === drive._id ? "Less ↑" : "Details ↓"}
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/student/verifier?company=${encodeURIComponent(
                          drive.companyName || ""
                        )}&link=${encodeURIComponent(drive.applyLink || "")}`
                      )
                    }
                    style={{
                      padding: "8px 12px",
                      background: "rgba(124, 58, 237, 0.12)",
                      border: "1px solid rgba(124, 58, 237, 0.3)",
                      borderRadius: "8px",
                      color: "#c084fc",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title="Check if this job posting is real or fake"
                  >
                    🛡️ Verify
                  </button>

                  <a
                    href={drive.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 2,
                      padding: "8px",
                      background:
                        safety.verdict === "HIGH RISK"
                          ? "rgba(255,71,87,0.1)"
                          : "var(--accent-primary)",
                      border:
                        safety.verdict === "HIGH RISK"
                          ? "1px solid rgba(255,71,87,0.3)"
                          : "none",
                      borderRadius: "8px",
                      color:
                        safety.verdict === "HIGH RISK"
                          ? "var(--accent-red)"
                          : "var(--bg-primary)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    {safety.verdict === "HIGH RISK"
                      ? "⚠ Apply Carefully"
                      : "Apply Now →"}
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
