// const express = require('express');
// const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const { message, profile } = req.body;

//     const reply = `Hello ${profile?.name || 'Student'} 👋

// You asked:
// "${message}"

// This is JobLens AI chatbot response.

// Backend integration successful ✅`;

//     res.json({
//       success: true,
//       data: {
//         reply,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: 'Chatbot failed',
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');

// ── inline ChatHistory model (no separate file needed) ─────────────────────
const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  content:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const chatHistorySchema = new mongoose.Schema(
  { title: { type: String, default: 'New Chat' }, messages: [messageSchema] },
  { timestamps: true }
);
const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);

// ── fetch live drive data ──────────────────────────────────────────────────
async function fetchAllDriveData() {
  const OnCampusDrive  = require('../models/OnCampusDrive');
  const OffCampusDrive = require('../models/OffCampusDrive');

  const [onCampus, offCampus] = await Promise.all([
    OnCampusDrive.find({}).lean(),
    OffCampusDrive.find({}).lean(),
  ]);

  const cleanOn = onCampus.map(d => ({
    type: 'on-campus',
    company: d.companyName,
    status: d.status,
    eligibleBranches: d.eligibleBranches,
    eligibleBatches: d.eligibleBatches,
    cgpaCutOff: d.cgpaCutOff,
    backlogsAllowed: d.backlogsAllowed,
    packageRange: d.minPackage && d.maxPackage ? `${d.minPackage} LPA – ${d.maxPackage} LPA` : 'Not disclosed',
    registrationDeadline: d.registrationDeadline ? new Date(d.registrationDeadline).toDateString() : 'Not specified',
  }));

  const cleanOff = offCampus.map(d => ({
    type: 'off-campus',
    company: d.companyName,
    driveName: d.driveName,
    eligibleBranches: d.eligibleBranches,
    eligibleBatches: d.eligibleBatches,
    applyLink: d.applyLink,
    lastDateToApply: d.lastDateToApply ? new Date(d.lastDateToApply).toDateString() : 'Not specified',
  }));

  return { onCampus: cleanOn, offCampus: cleanOff };
}

// ── call Gemini ────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url    = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini error ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

function fallbackPlacementReply(message, profile, onCampus, offCampus) {
  const query = (message || '').toLowerCase();
  const userName = profile?.name?.split(' ')[0] || 'Student';

  // 1. Company specific query
  const allCompanies = [...onCampus.map(c => ({ ...c, kind: 'On-Campus' })), ...offCampus.map(c => ({ ...c, kind: 'Off-Campus' }))];
  const matchedCompany = allCompanies.find(c => (c.company || '').toLowerCase().length > 2 && query.includes((c.company || '').toLowerCase()));

  if (matchedCompany) {
    if (matchedCompany.kind === 'On-Campus') {
      return `📌 **${matchedCompany.company} (${matchedCompany.kind} Drive)**\n\n` +
             `• **Status:** ${matchedCompany.status?.toUpperCase() || 'ACTIVE'}\n` +
             `• **Package:** ${matchedCompany.packageRange}\n` +
             `• **CGPA Cutoff:** ${matchedCompany.cgpaCutOff || 'N/A'}\n` +
             `• **Eligible Branches:** ${(matchedCompany.eligibleBranches || []).join(', ') || 'All'}\n` +
             `• **Eligible Batches:** ${(matchedCompany.eligibleBatches || []).join(', ')}\n` +
             `• **Registration Deadline:** ${matchedCompany.registrationDeadline}\n\n` +
             `Make sure your resume is up-to-date in your profile before the registration deadline!`;
    } else {
      return `🌐 **${matchedCompany.company} (${matchedCompany.driveName || 'Opportunity'})**\n\n` +
             `• **Type:** ${matchedCompany.kind}\n` +
             `• **Eligible Branches:** ${(matchedCompany.eligibleBranches || []).join(', ') || 'All'}\n` +
             `• **Batches:** ${(matchedCompany.eligibleBatches || []).join(', ')}\n` +
             `• **Last Date to Apply:** ${matchedCompany.lastDateToApply}\n` +
             `• **Official Link:** ${matchedCompany.applyLink}\n\n` +
             `Tip: You can verify this job link using our Job Verifier to check authenticity!`;
    }
  }

  // 2. Eligibility query
  if (query.includes('eligible') || query.includes('can i apply') || query.includes('criteria') || query.includes('cutoff')) {
    const studentCgpa = Number(profile?.cgpa) || 8.0;
    const studentBranch = profile?.branch || 'CSE';
    const eligibleOnCampus = onCampus.filter(d => 
      (!d.cgpaCutOff || studentCgpa >= d.cgpaCutOff) &&
      (!d.eligibleBranches || d.eligibleBranches.includes(studentBranch))
    );
    const eligibleList = eligibleOnCampus.map(d => `• **${d.company}**: Min CGPA ${d.cgpaCutOff}, Package ${d.packageRange}`).join('\n');
    return `🎯 **Eligibility Summary for ${userName} (${studentBranch}, CGPA: ${studentCgpa}):**\n\n` +
           (eligibleList ? `You are currently eligible for:\n${eligibleList}\n\n` : 'No open drives match your current CGPA/branch criteria right now.\n\n') +
           `Keep your resume and skills updated in your profile to maintain high match scores!`;
  }

  // 3. Preparation / interview tips
  if (query.includes('prepare') || query.includes('tip') || query.includes('interview') || query.includes('guide') || query.includes('study')) {
    return `💡 **Placement Preparation Blueprint:**\n\n` +
           `1. **Aptitude & Reasoning:** Practice quantitative aptitude, data interpretation, and verbal ability daily.\n` +
           `2. **Core DSA & Coding:** Master Arrays, Strings, HashMaps, Trees, and Dynamic Programming on LeetCode/HackerRank.\n` +
           `3. **CS Fundamentals:** Review OOPs (Java/C++), DBMS (SQL queries, indexing), Operating Systems, and Networks.\n` +
           `4. **Projects & STAR Stories:** Be ready to explain your tech stack, architecture, and quantifiable outcomes for all listed projects.\n` +
           `5. **AI Resume Match:** Use our AI Resume Match tool in the next tab to scan your resume against specific job descriptions!`;
  }

  // 4. Listing all drives
  if (query.includes('drive') || query.includes('companies') || query.includes('hiring') || query.includes('list') || query.includes('open') || query.includes('job') || query.includes('upcoming') || query.includes('package')) {
    const onCampusStr = onCampus.map(d => `• **${d.company}** (On-Campus) — Package: ${d.packageRange}, Cutoff: ${d.cgpaCutOff} CGPA`).join('\n');
    const offCampusStr = offCampus.slice(0, 4).map(d => `• **${d.company}** — ${d.driveName} (Apply by: ${d.lastDateToApply})`).join('\n');
    return `📋 **Current Active Placement Opportunities:**\n\n` +
           `**On-Campus Drives:**\n${onCampusStr || 'No active on-campus drives right now.'}\n\n` +
           `**Off-Campus Opportunities:**\n${offCampusStr || 'No off-campus drives listed.'}\n\n` +
           `You can view full details and apply directly under On-Campus and Off-Campus pages!`;
  }

  // Default fallback
  return `Hello ${userName}! 👋 I am your JobLens Placement Assistant.\n\n` +
         `I can help you with:\n` +
         `• Active On-Campus and Off-Campus Drives (ask "What drives are open?")\n` +
         `• Drive eligibility & CGPA cutoffs (ask "Am I eligible for TCS?")\n` +
         `• Placement packages and deadlines\n` +
         `• Placement preparation and interview advice\n\n` +
         `How can I assist you with your placements today?`;
}

// ── POST /api/student/chatbot  (send message) ──────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { message, chatId, profile } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required.' });

    const { onCampus, offCampus } = await fetchAllDriveData();
    const dbContext = JSON.stringify({ onCampusDrives: onCampus, offCampusDrives: offCampus }, null, 2);

    const fullPrompt = `You are a helpful college Placement Assistant for JobLens.
Answer questions about placement drives using the data below only.
Student: ${profile?.name || 'Student'} | Branch: ${profile?.branch || 'N/A'} | CGPA: ${profile?.cgpa || 'N/A'}

RULES:
1. Only use the JSON data given below.
2. If a company is not in the data say "Not found in current drives."
3. Keep answers short and clear with line breaks.

PLACEMENT DATA:
${dbContext}

User: ${message}
Answer:`;

    let aiReply;
    try {
      if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YOUR_API_KEY') && process.env.GEMINI_API_KEY.length > 20) {
        aiReply = await callGemini(fullPrompt);
      } else {
        aiReply = fallbackPlacementReply(message, profile, onCampus, offCampus);
      }
    } catch (apiErr) {
      console.warn('[Chatbot] Gemini API error, using placement assistant fallback:', apiErr.message);
      aiReply = fallbackPlacementReply(message, profile, onCampus, offCampus);
    }

    // ── CONTINUE existing chat OR create new one ──────────────────────────
    let chat;
    if (chatId) {
      // append to existing chat
      chat = await ChatHistory.findByIdAndUpdate(
        chatId,
        { $push: { messages: [{ role: 'user', content: message }, { role: 'assistant', content: aiReply }] } },
        { new: true }
      );
      if (!chat) {
        // chatId was invalid — create fresh
        chat = await ChatHistory.create({
          title: message.length > 50 ? message.substring(0, 47) + '...' : message,
          messages: [{ role: 'user', content: message }, { role: 'assistant', content: aiReply }],
        });
      }
    } else {
      // brand new chat — title = first message
      chat = await ChatHistory.create({
        title: message.length > 50 ? message.substring(0, 47) + '...' : message,
        messages: [{ role: 'user', content: message }, { role: 'assistant', content: aiReply }],
      });
    }

    return res.json({ success: true, data: { reply: aiReply, chatId: chat._id } });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    return res.status(500).json({ success: false, message: 'Chatbot failed. Please try again.' });
  }
});

// ── GET /api/student/chatbot/history  (list all chats) ────────────────────
router.get('/history', async (req, res) => {
  try {
    const chats = await ChatHistory.find({}, 'title createdAt updatedAt').sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, data: chats });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch history.' });
  }
});

// ── GET /api/student/chatbot/history/:id  (load one chat) ─────────────────
router.get('/history/:id', async (req, res) => {
  try {
    const chat = await ChatHistory.findById(req.params.id).lean();
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });
    return res.json({ success: true, data: chat });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not fetch chat.' });
  }
});

// ── DELETE /api/student/chatbot/history/:id ───────────────────────────────
router.delete('/history/:id', async (req, res) => {
  try {
    await ChatHistory.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not delete chat.' });
  }
});

module.exports = router;