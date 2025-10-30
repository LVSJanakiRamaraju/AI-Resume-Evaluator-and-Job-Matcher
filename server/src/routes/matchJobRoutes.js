import express from 'express';
import pool from "../db.js";
import authMiddleware from '../middleware/authMiddleware.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_MODEL = 'gemini-2.5-flash'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const router = express.Router();

const DEBUG_SCORING = true;

/**
 * Executes a fetch request with exponential backoff for retries.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Fetch options.
 * @param {number} maxRetries - Maximum number of retries.
 */
async function fetchWithRetry(url, options, maxRetries = 3) {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
        continue;
      }
      throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached.');
}

/**
 * Helper function to calculate the percentage similarity score between candidate and job skills.
 * @param {string[]} resumeSkills - Skills provided by the candidate.
 * @param {string[]} jobSkills - Required skills for the job.
 * @param {number|string} [jobId='N/A'] - Optional job ID for debugging context.
 * @returns {number} The match score (0-100).
 */
function similarityScore(resumeSkills, jobSkills, jobId = 'N/A') {
  const candidateSkillSet = new Set(resumeSkills.map(s => s.toLowerCase().trim()));
  const requiredSkillSet = new Set(jobSkills.map(s => s.toLowerCase().trim()).filter(s => s.length > 0)); 

  if (requiredSkillSet.size === 0) {
    return 100; 
  }

  let intersectionCount = 0;
  for (const skill of candidateSkillSet) {
    if (requiredSkillSet.has(skill)) {
      intersectionCount++;
    }
  }
  
  const score = (intersectionCount / requiredSkillSet.size) * 100;
  const finalScore = Math.round(score);
  
  return finalScore;
}

/**
 * Helper function to safely parse LLM output that is expected to be JSON.
 * It strips common markdown code fences (```json) before parsing.
 * @param {string} rawText - The raw text response from the LLM.
 * @returns {object|null} The parsed JSON object or an object containing an error message.
 */
function safeJsonParse(rawText) {
  try {
    const cleanedText = rawText.replace(/```json\s*|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e.message);
    return { 
      error: "AI response format error. Could not parse JSON.",
      raw_text_sample: rawText.substring(0, 200) + '...'
    };
  }
}

router.post("/job-matches", authMiddleware, async (req, res) => {
  try {
    const { resume_id } = req.body;

    if (!resume_id) {
      return res.status(400).json({ success: false, error: "resume_id is required." });
    }

    const existingMatches = await pool.query(
      `SELECT m.job_id, m.match_score, m.reasoning, j.title 
       FROM matches m
       JOIN jobs j ON m.job_id = j.id
       WHERE m.resume_id = $1
       ORDER BY m.match_score DESC`,
      [resume_id]
    );

    if (existingMatches.rows.length > 0) {
      console.log("Returning cached job matches");

      return res.json({
        success: true,
        data: existingMatches.rows.map(r => ({
          job_id: r.job_id,
          title: r.title,
          match_score: r.match_score,
          ...JSON.parse(r.reasoning)
        }))
      });
    }

    const resume = await pool.query(
      `SELECT analysis_result FROM resumes WHERE id = $1`,
      [resume_id]
    );

    if (resume.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Resume not found" });
    }

    const skills = resume.rows[0].analysis_result?.skills || [];

    if (!skills.length) {
      return res.status(400).json({ success: false, error: "Resume has no extracted skills." });
    }

    const jobsData = await pool.query(
      `SELECT id, title, description, skills_required FROM jobs`
    );

    const results = jobsData.rows.map(job => {
      const requiredSkills = Array.isArray(job.skills_required)
        ? job.skills_required
        : job.skills_required?.split(",").map(s => s.trim()) || [];

      const score = similarityScore(skills, requiredSkills, job.id);

      return {
        job_id: job.id,
        title: job.title,
        match_score: score,
        skills_required: requiredSkills
      };
    });

    const topJobs = results.sort((a, b) => b.match_score - a.match_score).slice(0, 10);

    const prompt = `
Candidate Skills: [${skills.join(", ")}]

Jobs to analyze:
${JSON.stringify(topJobs)}

Respond ONLY as JSON format:
{ job_id:{ reasoning, fit_skills, missing_skills } }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const rawResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    const reasoning = safeJsonParse(rawResponse);

    if (!reasoning || reasoning.error) {
      throw new Error("AI did not return reasoning JSON");
    }

    for (const job of topJobs) {
      await pool.query(
        `INSERT INTO matches (resume_id, job_id, match_score, reasoning, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          resume_id,
          job.job_id,
          job.match_score,
          JSON.stringify(reasoning[job.job_id])
        ]
      );
    }

    return res.json({
      success: true,
      data: topJobs.map(job => ({
        ...job,
        ...reasoning[job.job_id]
      }))
    });

  } catch (err) {
    console.error("Match API Error:", err);
    res.status(500).json({ success: false, error: "Failed to match jobs." });
  }
});

export default router;
