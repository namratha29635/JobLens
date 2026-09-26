'use strict';
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Comprehensive dictionary of technical skills to match
const SKILLS_CATALOG = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'R', 'Scala', 'Shell', 'Bash', 'SQL',
  // Frontend
  'React', 'React.js', 'Next.js', 'Angular', 'Vue', 'Vue.js', 'Redux', 'HTML', 'HTML5',
  'CSS', 'CSS3', 'Tailwind', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Sass', 'SCSS',
  'jQuery', 'Webpack', 'Vite',
  // Backend & APIs
  'Node.js', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'Spring', 'ASP.NET', 'Nest.js', 'REST API', 'RESTful API', 'GraphQL', 'Microservices',
  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase',
  'Cassandra', 'Oracle Database', 'DynamoDB',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins',
  'GitHub Actions', 'Linux', 'Nginx', 'Terraform',
  // CS & Data & AI
  'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Machine Learning', 'Deep Learning', 'NLP', 'Data Science', 'Pandas', 'NumPy',
  'Scikit-learn', 'TensorFlow', 'PyTorch', 'OpenCV', 'Power BI', 'Tableau',
  // Tools
  'Git', 'GitHub', 'GitLab', 'Postman', 'Jira', 'VS Code', 'Figma'
];

/**
 * Extracts plain text from a resume PDF or text file
 */
async function extractTextFromFile(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    // If it's a PDF
    if (filePath.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    }
    // Otherwise treat as plain text/utf8
    return dataBuffer.toString('utf8');
  } catch (err) {
    console.error('[ResumeParser] Error reading file:', err.message);
    return '';
  }
}

/**
 * Parses resume text into structured fields: education, skills, projects, internships, etc.
 */
function parseResumeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      skills: [],
      education: {},
      projects: [],
      internships: [],
      certifications: [],
      codingProfiles: {},
      profileSummary: '',
      contact: '',
      personalEmail: '',
    };
  }

  const text = rawText.replace(/\r/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Contact & Links Extraction
  let contact = '';
  const phoneMatch = text.match(/(?:(?:\+91|0)?[ -]?)?[6-9]\d{9}\b/);
  if (phoneMatch) contact = phoneMatch[0].trim();

  let personalEmail = '';
  const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const em of emailMatches) {
    if (!em.endsWith('.edu') && !em.endsWith('.ac.in')) {
      personalEmail = em.toLowerCase();
      break;
    }
  }
  if (!personalEmail && emailMatches.length > 0) {
    personalEmail = emailMatches[0].toLowerCase();
  }

  // Coding Profiles
  const codingProfiles = {
    github: '',
    leetcode: '',
    hackerrank: '',
  };
  const ghMatch = text.match(/(?:github\.com\/)([a-zA-Z0-9_\-]+)/i);
  if (ghMatch) codingProfiles.github = `https://github.com/${ghMatch[1]}`;

  const lcMatch = text.match(/(?:leetcode\.com\/(?:u\/)?)([a-zA-Z0-9_\-]+)/i);
  if (lcMatch) codingProfiles.leetcode = `https://leetcode.com/${lcMatch[1]}`;

  const hrMatch = text.match(/(?:hackerrank\.com\/)([a-zA-Z0-9_\-]+)/i);
  if (hrMatch) codingProfiles.hackerrank = `https://hackerrank.com/${hrMatch[1]}`;

  // 2. Skills Extraction
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of SKILLS_CATALOG) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex;
    if (skill === 'C++') regex = /(?:^|[^a-zA-Z0-9#+])c\+\+(?![a-zA-Z0-9#+])/i;
    else if (skill === 'C#') regex = /(?:^|[^a-zA-Z0-9#+])c#(?![a-zA-Z0-9#+])/i;
    else if (skill === 'C') regex = /(?:^|[^a-zA-Z0-9#+])C(?![a-zA-Z0-9#+])/;
    else if (skill.includes('.')) regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
    else regex = new RegExp(`\\b${escaped}\\b`, 'i');

    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }

  // Also parse explicit "Skills" section
  const skillsHeaderIdx = lines.findIndex(l => /^(technical\s+)?skills\b|^skills\s*[:&-]/i.test(l));
  if (skillsHeaderIdx !== -1) {
    for (let i = skillsHeaderIdx + 1; i < Math.min(skillsHeaderIdx + 8, lines.length); i++) {
      const line = lines[i];
      if (/^(education|projects|experience|internships|certifications|awards)\b/i.test(line)) break;
      const parts = line.split(/[,•|·;:]/).map(p => p.trim()).filter(p => p.length >= 2 && p.length <= 30);
      for (const p of parts) {
        if (!/^(languages|frameworks|tools|databases|technologies|skills)\s*$/i.test(p)) {
          foundSkills.add(p);
        }
      }
    }
  }

  // 3. Education Extraction
  const education = {
    btech: { institutionName: '', cgpa: null, percentage: null, yearOfCompletion: null },
    intermediate: { institutionName: '', percentage: null, cgpa: null, yearOfCompletion: null },
    secondary: { institutionName: '', percentage: null, cgpa: null, yearOfCompletion: null },
  };

  function extractEndYear(chunk) {
    if (!chunk) return null;
    const years = [...chunk.matchAll(/\b(20\d{2})\b/g)].map(m => parseInt(m[1], 10));
    if (!years.length) return null;
    return Math.max(...years);
  }

  function extractScore(chunk) {
    if (!chunk) return { cgpa: null, percentage: null };
    let cgpa = null;
    let percentage = null;

    const percM = chunk.match(/(?:percentage|percent|aggregate|marks)?\s*[:=\-]?\s*(\d{2}(?:\.\d{1,2})?)\s*%/i)
               || chunk.match(/(?:percentage|percent)\s*[:=\-]?\s*(\d{2}(?:\.\d{1,2})?)/i);
    if (percM) {
      const p = parseFloat(percM[1]);
      if (p >= 40 && p <= 100) percentage = p;
    }

    const cgpaM = chunk.match(/(?:cgpa|gpa|pointer)\s*[:=\-]?\s*([4-9]\.\d{1,2}|10(?:\.0)?)(?:\s*(?:\/|\s*out\s*of)\s*10)?/i)
               || chunk.match(/\b([4-9]\.\d{1,2}|10(?:\.0)?)\s*(?:\/|\s*out\s*of\s*)10/i)
               || chunk.match(/\b([6-9]\.\d{1,2})\s*(?:cgpa|gpa)\b/i);
    if (cgpaM) {
      const c = parseFloat(cgpaM[1]);
      if (c >= 4.0 && c <= 10.0) cgpa = c;
    }

    return { cgpa, percentage };
  }

  // 1. Locate Education section
  const eduHeaderIdx = lines.findIndex(l => /^(academic\s+background|education|academic\s+qualifications?|educational\s+qualifications?|qualifications?)\b/i.test(l.trim()));
  let eduLines = [];
  if (eduHeaderIdx !== -1) {
    for (let i = eduHeaderIdx + 1; i < lines.length; i++) {
      if (/^(technical\s+skills|skills|projects|experience|internships|certifications|awards|achievements|coding|profiles)\b/i.test(lines[i].trim())) {
        break;
      }
      eduLines.push(lines[i]);
    }
  }
  if (eduLines.length === 0) eduLines = lines;
  const eduText = eduLines.join('\n');

  // Boundaries for the 3 levels
  const interPos = eduText.search(/(?:junior\s+college|intermediate|\b12th\b|\bclass\s*(?:xii|12)\b|\+2|higher\s+secondary)/i);
  let sscPos = -1;
  const sscRegex = /(?<!senior\s*)(?:secondary\s+school|\bclass\s*(?:x|10)\b|\b10th\b|\bssc\b|high\s*school|public\s*school|matriculation)/ig;
  let match;
  while ((match = sscRegex.exec(eduText)) !== null) {
    const prefix = eduText.substring(Math.max(0, match.index - 10), match.index);
    if (!/senior/i.test(prefix)) {
      sscPos = match.index;
      break;
    }
  }

  // Form chunks
  const btechEnd = interPos !== -1 ? interPos : (sscPos !== -1 ? sscPos : eduText.length);
  const btechChunk = eduText.slice(0, btechEnd);

  const interEnd = sscPos !== -1 && sscPos > interPos ? sscPos : eduText.length;
  const interChunk = interPos !== -1 ? eduText.slice(interPos, interEnd) : '';

  const sscChunk = sscPos !== -1 ? eduText.slice(sscPos) : '';

  // 1. B.Tech / Degree College
  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i].trim();
    if (!line) continue;
    if (/(?:Institute|College|University|IIT|NIT|IIIT|BITS|SRM|VIT|JNTU|Osmania|CBIT|VNR|Vasavi|Gokaraju)\b/i.test(line) &&
        !/Junior|Jr\.?|High\s*School|School|Intermediate/i.test(line)) {
      education.btech.institutionName = line.replace(/^(?:at|from|in|pursuing\s+at)\s+/i, '').replace(/^(?:b\.?tech|b\.?e\.?|bachelor)[^,\-–]+[,\-–]\s*/i, '').trim();
      break;
    }
  }
  const btechScore = extractScore(btechChunk);
  education.btech.cgpa = btechScore.cgpa;
  education.btech.percentage = btechScore.percentage;
  education.btech.yearOfCompletion = extractEndYear(btechChunk) || extractEndYear(eduText);

  // 2. Intermediate
  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i].trim();
    if (!line) continue;
    if (/(?:Junior\s+College|Jr\.?\s*College|Chaitanya|Narayana|Vignan|Intermediate|XII\b|12th|Higher\s+Secondary|\+2)/i.test(line) &&
        !/B\.?Tech|Bachelor|Institute\s+of\s+Technology|University|High\s*School/i.test(line)) {
      if (!/^(?:senior\s+secondary|intermediate|12th|class\s*xii|\+2)\b/i.test(line)) {
        education.intermediate.institutionName = line.replace(/^(?:at|from|in)\s+/i, '').trim();
        break;
      }
    }
  }
  if (interChunk) {
    if (!education.intermediate.institutionName) {
      const chunkLines = interChunk.split('\n');
      for (const cl of chunkLines) {
        if (/(?:College|Chaitanya|Narayana|Academy|School)/i.test(cl) && !/^(intermediate|12th|senior)/i.test(cl.trim())) {
          education.intermediate.institutionName = cl.trim();
          break;
        }
      }
    }
    const interScore = extractScore(interChunk);
    education.intermediate.percentage = interScore.percentage || (interScore.cgpa ? Math.round(interScore.cgpa * 9.5) : null);
    education.intermediate.cgpa = interScore.cgpa;
    education.intermediate.yearOfCompletion = extractEndYear(interChunk);
  }

  // 3. Secondary / 10th
  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i].trim();
    if (!line) continue;
    if (/(?:High\s*School|Public\s*School|Vidyalaya|Grammar\s*School|Convent|Matriculation)/i.test(line) &&
        !/Junior|College|Institute|University/i.test(line)) {
      education.secondary.institutionName = line.replace(/^(?:at|from|in)\s+/i, '').trim();
      break;
    }
  }
  if (sscChunk) {
    if (!education.secondary.institutionName) {
      const chunkLines = sscChunk.split('\n');
      for (const cl of chunkLines) {
        if (/(?:School|Vidyalaya|Academy)/i.test(cl) && !/^(secondary|10th|class\s*(?:x|10)|ssc)/i.test(cl.trim())) {
          education.secondary.institutionName = cl.trim();
          break;
        }
      }
    }
    const sscScore = extractScore(sscChunk);
    education.secondary.percentage = sscScore.percentage || (sscScore.cgpa ? Math.round(sscScore.cgpa * 9.5) : null);
    education.secondary.cgpa = sscScore.cgpa;
    education.secondary.yearOfCompletion = extractEndYear(sscChunk);
  }

  // 4. Projects Extraction
  const projects = [];
  const projHeaderIdx = lines.findIndex(l => /^(academic\s+|personal\s+)?projects\b/i.test(l));
  if (projHeaderIdx !== -1) {
    let currentProj = null;
    for (let i = projHeaderIdx + 1; i < Math.min(projHeaderIdx + 25, lines.length); i++) {
      const line = lines[i];
      if (/^(experience|internships|education|skills|certifications|achievements)\b/i.test(line)) break;

      const isTech = /(?:tech\s*stack|technologies|tools)\s*[:\-]/i.test(line);
      const isLink = /https?:\/\/[^\s]+/i.test(line) || /github\.com\/[^\s]+/i.test(line);

      if (isTech && currentProj) {
        const techs = line.replace(/(?:tech\s*stack|technologies|tools)\s*[:\-]/i, '')
          .split(/[,|•]/).map(t => t.trim()).filter(Boolean);
        currentProj.techStack = [...new Set([...currentProj.techStack, ...techs])];
      } else if (isLink && currentProj) {
        const lMatch = line.match(/(?:https?:\/\/[^\s]+|github\.com\/[^\s]+)/i);
        if (lMatch) currentProj.link = lMatch[0].startsWith('http') ? lMatch[0] : `https://${lMatch[0]}`;
      } else if (!isTech && !isLink && line.length < 65 && !line.endsWith('.')) {
        if (currentProj && currentProj.title) projects.push(currentProj);
        currentProj = {
          title: line.replace(/^[0-9]+[.)•\-*]\s*/, '').trim(),
          description: '',
          techStack: [],
          link: '',
        };
      } else if (currentProj) {
        currentProj.description += (currentProj.description ? ' ' : '') + line.replace(/^[•\-*]\s*/, '');
      }
    }
    if (currentProj && currentProj.title) projects.push(currentProj);
  }

  // 5. Internships / Experience Extraction
  const internships = [];
  const expHeaderIdx = lines.findIndex(l => /^(work\s+|professional\s+)?(experience|internships)\b/i.test(l));
  if (expHeaderIdx !== -1) {
    let currentExp = null;
    for (let i = expHeaderIdx + 1; i < Math.min(expHeaderIdx + 25, lines.length); i++) {
      const line = lines[i];
      if (/^(projects|education|skills|certifications|achievements|publications)\b/i.test(line)) break;

      const isDate = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\s*[-–to]\s*(?:present|\d{4}|[a-z]{3})/i.test(line);
      if (isDate && currentExp) {
        currentExp.duration = line.trim();
      } else if (!isDate && line.length < 75 && !line.endsWith('.')) {
        if (currentExp && currentExp.company) internships.push(currentExp);
        const parts = line.split(/[-–|@,]/).map(p => p.trim());
        currentExp = {
          company: parts[0] || 'Company',
          role: parts[1] || 'Software Intern',
          duration: '',
          description: '',
        };
      } else if (currentExp) {
        currentExp.description += (currentExp.description ? ' ' : '') + line.replace(/^[•\-*]\s*/, '');
      }
    }
    if (currentExp && currentExp.company) internships.push(currentExp);
  }

  // 6. Certifications
  const certifications = [];
  const certHeaderIdx = lines.findIndex(l => /^(licenses\s*&\s*)?certifications\b|^courses\b/i.test(l));
  if (certHeaderIdx !== -1) {
    for (let i = certHeaderIdx + 1; i < Math.min(certHeaderIdx + 8, lines.length); i++) {
      const line = lines[i];
      if (/^(education|projects|experience|skills|achievements)\b/i.test(line)) break;
      const clean = line.replace(/^[•\-*0-9.)]\s*/, '').trim();
      if (clean.length > 5 && clean.length < 120) {
        certifications.push(clean);
      }
    }
  }

  // 7. Profile Summary / Objective
  let profileSummary = '';
  const sumHeaderIdx = lines.findIndex(l => /^(professional\s+)?summary\b|^objective\b|^about\s+me\b/i.test(l));
  if (sumHeaderIdx !== -1) {
    const summaryLines = [];
    for (let i = sumHeaderIdx + 1; i < Math.min(sumHeaderIdx + 6, lines.length); i++) {
      const line = lines[i];
      if (/^(education|projects|experience|skills|internships|certifications|technical)\b/i.test(line)) break;
      summaryLines.push(line);
    }
    profileSummary = summaryLines.join(' ').slice(0, 450).trim();
  }

  return {
    skills: Array.from(foundSkills),
    education,
    projects: projects.slice(0, 5),
    internships: internships.slice(0, 4),
    certifications: certifications.slice(0, 6),
    codingProfiles,
    profileSummary,
    contact,
    personalEmail,
  };
}

module.exports = {
  extractTextFromFile,
  parseResumeText,
};
