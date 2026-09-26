process.on('unhandledRejection', (err) => {
  console.warn('⚠️ Handled unhandledRejection:', err?.message || err);
});
process.on('uncaughtException', (err) => {
  console.warn('⚠️ Handled uncaughtException:', err?.message || err);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./src/config/db");
const { errorHandler } = require("./src/middleware/error.middleware");
// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require("./src/routes/auth.routes");
const studentRoutes = require("./src/routes/student.routes");
const onCampusRoutes = require("./src/routes/oncampus.routes");
const offCampusRoutes = require("./src/routes/offcampus.routes");
const roundRoutes = require("./src/routes/round.routes");
const feedbackRoutes = require("./src/routes/feedback.routes");
const coordinatorRoutes = require("./src/routes/coordinator.routes");
const jobVerifierRoutes = require("./src/routes/jobVerifier.routes"); // ← NEW
const chatbotRoutes = require('./src/routes/chatbot.routes');
// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB().then(() => {
  const User = require("./src/models/User");
  const Student = require("./src/models/Student");
  (async () => {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log("🌱 Database has no users. Creating default demo users...");
        await User.create({
          email: "coordinator@college.edu",
          password: "Test@123",
          role: "coordinator",
          isFirstLogin: false,
          isActive: true,
        });
        const stuUser = await User.create({
          email: "student@college.edu",
          password: "Test@123",
          role: "student",
          isFirstLogin: false,
          isActive: true,
        });
        await Student.create({
          user: stuUser._id,
          rollNumber: "22CS001",
          name: "Demo Student",
          passedOutYear: 2026,
          branch: "CSE",
          collegeEmail: "student@college.edu",
          cgpa: 8.5,
          activeBacklogs: 0,
          totalBacklogs: 0,
          skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "Data Structures"],
          profileSummary: "Passionate computer science student experienced in MERN stack development and problem solving.",
          codingProfiles: {
            github: "https://github.com/demostudent",
            leetcode: "https://leetcode.com/demostudent",
            hackerrank: "https://hackerrank.com/demostudent",
          },
        });
        console.log("✅ Default demo users created:\n   • coordinator@college.edu (Password: Test@123)\n   • student@college.edu (Password: Test@123)");
      }

      // Seed Off-Campus and On-Campus Drives if none exist
      const OffCampusDrive = require("./src/models/OffCampusDrive");
      const OnCampusDrive = require("./src/models/OnCampusDrive");
      const Round = require("./src/models/Round");
      const coordUser = await User.findOne({ role: "coordinator" });

      if (coordUser) {
        const offCount = await OffCampusDrive.countDocuments();
        if (offCount === 0) {
          console.log("🌱 Seeding sample off-campus opportunities...");
          await OffCampusDrive.create([
            {
              companyName: "Google",
              driveName: "SWE Intern 2026 - Applications Open",
              driveCategory: "internship",
              eligibleBatches: [2025, 2026, 2027],
              eligibleBranches: ["CSE", "IT", "ECE", "EEE"],
              description: "Google Software Engineering Intern role. Looking for candidates proficient in C++, Java, Python, or Go with strong Data Structures, Algorithms, and Software Engineering principles.",
              applyLink: "https://careers.google.com/jobs/results/",
              lastDateToApply: new Date(Date.now() + 45 * 86400000),
              createdBy: coordUser._id,
            },
            {
              companyName: "Microsoft",
              driveName: "SDE-1 Off Campus Recruitment",
              driveCategory: "job",
              eligibleBatches: [2025, 2026],
              eligibleBranches: ["CSE", "IT", "ECE"],
              description: "Microsoft Azure and Office 365 development teams. Seeking expertise in C#, C++, Java, Python, Cloud computing (Azure/AWS), Distributed Systems, and REST APIs.",
              applyLink: "https://careers.microsoft.com/",
              lastDateToApply: new Date(Date.now() + 30 * 86400000),
              createdBy: coordUser._id,
            },
            {
              companyName: "Amazon",
              driveName: "Software Development Engineer Intern",
              driveCategory: "internship",
              eligibleBatches: [2025, 2026, 2027],
              eligibleBranches: ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
              description: "Amazon India SDE Internship program. Required skills include Problem Solving, Java or Python, OOP concepts, Database Systems (SQL/NoSQL), and System Design basics.",
              applyLink: "https://amazon.jobs/en/",
              lastDateToApply: new Date(Date.now() + 25 * 86400000),
              createdBy: coordUser._id,
            },
            {
              companyName: "Flipkart",
              driveName: "Flipkart GRiD 6.0 Campus Challenge & PPI",
              driveCategory: "hackathon",
              eligibleBatches: [2025, 2026, 2027, 2028],
              eligibleBranches: ["CSE", "IT", "ECE", "EEE"],
              description: "National hackathon with tracks in Robotics, Generative AI, and Information Security. PPI opportunities for top teams with packages up to ₹32 LPA.",
              applyLink: "https://unstop.com/hackathons/flipkart-grid",
              lastDateToApply: new Date(Date.now() + 20 * 86400000),
              createdBy: coordUser._id,
            },
            {
              companyName: "Tata Consultancy Services",
              driveName: "TCS Digital National Qualifier Test (NQT)",
              driveCategory: "job",
              eligibleBatches: [2025, 2026],
              eligibleBranches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"],
              description: "TCS Digital recruitment for premier product engineering and AI/ML projects. Requirements include Advanced Coding in Python/Java/C++, Full Stack Development (React, Node.js), and Machine Learning.",
              applyLink: "https://www.tcs.com/careers",
              lastDateToApply: new Date(Date.now() + 35 * 86400000),
              createdBy: coordUser._id,
            },
            {
              companyName: "WorkAnywhere Global (Demo Suspicious Posting)",
              driveName: "Urgent Data Entry / ₹500 Daily / No Interview",
              driveCategory: "other",
              eligibleBatches: [2025, 2026, 2027, 2028],
              eligibleBranches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"],
              description: "Urgent hiring! Earn ₹15,000 per week from home. No experience needed. 100% guaranteed placement. WhatsApp your Aadhaar card and pay ₹499 registration kit fee to start immediately on Telegram @EasyJobsNow.",
              applyLink: "http://bit.ly/fast-cash-jobs-now",
              lastDateToApply: new Date(Date.now() + 60 * 86400000),
              createdBy: coordUser._id,
            },
          ]);
          console.log("✅ Seeded 6 off-campus opportunities (including scam detector demo)");
        }

        const onCount = await OnCampusDrive.countDocuments();
        if (onCount === 0) {
          console.log("🌱 Seeding sample on-campus drives...");
          const tcsDrive = await OnCampusDrive.create({
            companyName: "TCS Ninja & Digital",
            eligibleBatches: [2025, 2026],
            eligibleBranches: ["CSE", "IT", "ECE"],
            cgpaCutOff: 6.5,
            backlogsAllowed: 1,
            minPackage: 3.6,
            maxPackage: 7.2,
            description: "TCS Campus Hiring 2026 for Ninja and Digital profiles. Fast-track your engineering career with cutting-edge IT projects.",
            status: "active",
            registrationDeadline: new Date(Date.now() + 15 * 86400000),
            createdBy: coordUser._id,
          });

          const r1 = await Round.create({
            drive: tcsDrive._id,
            roundNumber: 1,
            roundName: "Online Aptitude & Coding Assessment",
            venue: "Online / Computer Lab 1 & 2",
            date: new Date(Date.now() + 7 * 86400000),
            description: "Quantitative, Logical, Verbal Reasoning + 2 Coding Problems",
          });
          const r2 = await Round.create({
            drive: tcsDrive._id,
            roundNumber: 2,
            roundName: "Technical & HR Interview",
            venue: "Auditorium Placement Hall A",
            date: new Date(Date.now() + 12 * 86400000),
            description: "Technical evaluation of projects, DSA, DBMS, and behavioral interview",
            isFinalRound: true,
          });

          tcsDrive.rounds = [r1._id, r2._id];
          await tcsDrive.save();

          const accDrive = await OnCampusDrive.create({
            companyName: "Accenture",
            eligibleBatches: [2025, 2026],
            eligibleBranches: ["CSE", "IT", "ECE", "EEE"],
            cgpaCutOff: 7.0,
            backlogsAllowed: 0,
            minPackage: 4.5,
            maxPackage: 8.5,
            description: "Accenture Associate Software Engineer (ASE) & Advanced ASE hiring drive for 2026 graduating batch.",
            status: "active",
            registrationDeadline: new Date(Date.now() + 20 * 86400000),
            createdBy: coordUser._id,
          });

          const ar1 = await Round.create({
            drive: accDrive._id,
            roundNumber: 1,
            roundName: "Cognitive & Technical Assessment",
            venue: "Virtual Proctored Assessment",
            date: new Date(Date.now() + 14 * 86400000),
            description: "Critical thinking, abstract reasoning, and technical MCQ",
          });
          accDrive.rounds = [ar1._id];
          await accDrive.save();

          console.log("✅ Seeded 2 on-campus drives with rounds");
        }
      }
    } catch (err) {
      console.warn("⚠️ Demo auto-seed notice:", err.message);
    }
  })();
});
const app = express();
// ── Global middleware ─────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://job-lens-brown.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((o) => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server, mobile)
    if (!origin) return callback(null, true);

    const isExplicit = allowedOrigins.includes(origin);
    const isVercel = /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin);
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isExplicit || isVercel || isLocal) {
      return callback(null, true);
    }

    // Default to reflect origin so legitimate frontend deployments never fail with browser CORS blocks
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ── Static file serving for uploads ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res
    .status(200)
    .json({
      success: true,
      message: "CCPDMS API is running",
      timestamp: new Date(),
    }),
);
// ── Mount routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/oncampus", onCampusRoutes);
app.use("/api/offcampus", offCampusRoutes);
app.use("/api/rounds", roundRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/student/job-verifier", jobVerifierRoutes);
app.use("/api/job-verifier", jobVerifierRoutes);
app.use('/api/student/chatbot', chatbotRoutes);
// ── 404 handler
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "API route not found" }),
);
// ── Global error handler (must be last)
app.use(errorHandler);
// ── Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  CCPDMS API running on port ${PORT}`);
  console.log(`📋  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗  Health: http://localhost:${PORT}/api/health\n`);
});
module.exports = app;