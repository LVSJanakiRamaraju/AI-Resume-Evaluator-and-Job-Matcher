import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const RESUME_SCHEMA = {
  type: "OBJECT",
  properties: {
    skills: {
      type: "ARRAY",
      description: "List of key skills extracted and interpersonal abilities from the resume.",
      items: { type: "STRING" }
    },
    experience: {
      type: "ARRAY",
      description: "List of detailed work experience entries.",
      items: {
        type: "OBJECT",
        properties: {
          Title: { type: "STRING" },
          Company: { type: "STRING" },
          Dates: { type: "STRING", description: "Start date to end date (e.g., 'Jan 2020 - Present')." },
          Description: { type: "STRING", description: "Summary of achievements/responsibilities for this role." }
        },
        required: ["Title", "Company", "Dates", "Description"]
      }
    },
    education: {
      type: "ARRAY",
      description: "List of educational degrees and certifications.",
      items: {
        type: "OBJECT",
        properties: {
          Degree: { type: "STRING" },
          Institution: { type: "STRING" },
          Dates: { type: "STRING", description: "Year range or date of completion." }
        },
        required: ["Degree", "Institution", "Dates"]
      }
    },
    project_highlights: {
      type: "ARRAY",
      description: "List of personal or professional project descriptions.",
      items: {
        type: "OBJECT",
        properties: {
          ProjectName: { type: "STRING" },
          Technologies: { type: "STRING", description: "Key technologies used in the project." },
          Description: { type: "STRING", description: "Summary of the project and your role/impact." }
        },
        required: ["ProjectName", "Technologies", "Description"]
      }
    }
  },
  required: ["skills", "experience", "education", "project_highlights"]
};


/**
 * Analyzes resume text using the Gemini API to return structured JSON data.
 * @param {string} resumeText - The raw text of the resume.
 * @returns {Promise<object>} The structured resume data.
 */
export async function analyzeResume(resumeText) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }


  const prompt = `You are a resume parser. Extract information from this resume and return ONLY a valid JSON object with this structure (use empty arrays if sections are missing):
{
  "skills": ["skill1", "skill2"],
  "experience": [{"Title": "Job Title", "Company": "Company Name", "Dates": "Start - End", "Description": "Description"}],
  "education": [{"Degree": "Degree", "Institution": "Institution", "Dates": "Years"}],
  "project_highlights": [{"ProjectName": "Name", "Technologies": "Tech stack", "Description": "Description"}]
}

RESUME:
${resumeText}

Return ONLY the JSON object, no other text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    if (!textOutput) {
      throw new Error('LLM returned an empty response');
    }

    const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : textOutput;
    const parsedJson = JSON.parse(jsonString);
    return parsedJson;

  } catch (err) {
    console.error('Gemini API Error:', err.message);
    throw new Error(`Failed to analyze resume: ${err.message}`);
  }
}

export default { analyzeResume };
