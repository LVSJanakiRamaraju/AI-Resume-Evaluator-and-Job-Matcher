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
    const { skills } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, error: "Skills array is required and must not be empty." });
    }

    const jobsData = await pool.query(
      `SELECT id, title, description, skills_required FROM jobs`
    );

    const results = jobsData.rows.map(job => {
      let requiredSkills;
      
      if (Array.isArray(job.skills_required)) {
        requiredSkills = job.skills_required;
      } else if (typeof job.skills_required === 'string') {
        requiredSkills = job.skills_required.split(',').map(s => s.trim()).filter(s => s.length > 0);
      } else {
        requiredSkills = [];
      }

      const score = similarityScore(skills, requiredSkills, job.id); 
      return {
        job_id: job.id,
        title: job.title,
        description: job.description,
        skills_required: requiredSkills,
        match_score: score
      };
    });

    const topJobs = results.sort((a, b) => b.match_score - a.match_score).slice(0, 10);

    const prompt = `
    Analyze the relevance of these top jobs based on the candidate's skills.
    
    Candidate Skills: [${skills.join(", ")}]

    For each job, provide a brief reasoning, a list of 'FIT' skills (skills matching the candidate), and a list of 'MISSING' skills (required skills the candidate does not have).

    Respond ONLY with a single JSON object. The keys must be the job_id.

    JSON Structure Example:
    {
      "101": {
        "reasoning": "Excellent match due to core JavaScript and React skills.",
        "fit_skills": ["React", "JavaScript"],
        "missing_skills": ["TypeScript", "AWS"]
      }
      // ... other jobs
    }

    Jobs to analyze:
    ${JSON.stringify(topJobs)}
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const rawResponseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawResponseText) {
      const errorMessage = result?.error?.message || 'LLM returned an empty response or an unknown API error.';
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const reasoning = safeJsonParse(rawResponseText);
    //console.log(reasoning)
    return res.json({
      success: true,
      data: topJobs,
      reasoning
    });

  } catch (err) {
    console.error("Match API Error:", err);
    const status = err.message && err.message.includes("Gemini") ? 502 : 500;
    res.status(status).json({ error: "Failed to match jobs or process AI reasoning." });
  }
});

export default router;
