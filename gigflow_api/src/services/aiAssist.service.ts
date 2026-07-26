import { getGeminiApiKey } from "../config/env";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { JobModel } from "../models/job.model";
import { UserModel } from "../models/user.model";

export const generateProposalDraft = async (
  freelancerId: string,
  jobId: string
): Promise<{ draft: string }> => {
  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new HttpError(404, "Job not found", { code: ErrorCodes.NOT_FOUND });
  }

  const freelancer = await UserModel.findById(freelancerId);
  if (!freelancer || freelancer.role !== "freelancer") {
    throw new HttpError(403, "Only freelancers can generate proposal drafts", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  const apiKey = getGeminiApiKey();

  const freelancerSkills = Array.isArray(freelancer.skills)
    ? freelancer.skills.join(", ")
    : freelancer.skills || "Not specified";

  const prompt = `You are an expert proposal writer for freelancers on GigFlow. Write a professional, highly tailored, and compelling cover letter from the freelancer to the client for the job listed below.

Job Details:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${job.skills?.join(", ") || "General"}
- Category: ${job.category}
- Budget: ${job.budgetType} (Min: Rs. ${job.budgetMin}${job.budgetMax ? `, Max: Rs. ${job.budgetMax}` : ""})
- Duration: ${job.duration}

Freelancer Profile:
- Name: ${freelancer.firstName} ${freelancer.lastName}
- Professional Title: ${freelancer.title || "Freelancer"}
- Bio: ${freelancer.bio || "Experienced professional ready to deliver high quality work."}
- Skills: ${freelancerSkills}

Strict Instructions:
1. Length: Exactly 150 to 250 words.
2. Perspective: Written in first person ("I", "my").
3. Relevance: Directly reference specific requirements from the job description and show how the freelancer's background fits the project perfectly.
4. NO PLACEHOLDERS: DO NOT use any bracketed placeholders like "[Your Name]", "[Client Name]", "[Insert Skill]", or "[Company]". Write the letter completely ready to send.
5. Formatting: Plain readable paragraphs. Return ONLY the text of the cover letter with no preamble, markdown titles, or conversational wrapper.`;

  const models = [
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
  ];
  let response: Response | null = null;
  let lastErrText = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        response = res;
        break;
      } else {
        lastErrText = await res.text();
        console.error(`Gemini model ${model} returned [${res.status}]:`, lastErrText);
      }
    } catch (e: any) {
      lastErrText = e?.message || String(e);
    }
  }

  try {
    if (!response || !response.ok) {
      throw new Error(`Gemini API failed: ${lastErrText}`);
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const draftText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!draftText) {
      throw new Error("Empty candidate text returned from Gemini API");
    }

    return { draft: draftText };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      502,
      "AI draft generation is temporarily unavailable, please write your cover letter manually",
      { code: ErrorCodes.INTERNAL_ERROR }
    );
  }
};
