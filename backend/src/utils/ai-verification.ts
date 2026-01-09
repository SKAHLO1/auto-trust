import { GoogleGenerativeAI } from '@google/generative-ai';
import { Submission, Task, VerificationResult } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateVerification(
  submission: Submission,
  task: Task
): Promise<VerificationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an expert work quality verifier for freelance tasks on the MNEE blockchain platform.

Task Requirements:
${JSON.stringify(task.verificationCriteria, null, 2)}

Submitted Work:
${JSON.stringify(submission.data, null, 2)}

Analyze the submitted work against the task requirements. Provide:
1. A pass/fail verdict
2. A score from 0-100
3. Specific feedback on each requirement
4. Any issues or improvements needed

Return ONLY a valid JSON object with keys: verdict (boolean), score (number), feedback (string), details (array of strings).
Do not include markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting if Gemini adds it
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResult = JSON.parse(jsonStr);

    return {
      verdict: jsonResult.verdict ? 'passed' : 'failed',
      score: jsonResult.score,
      feedback: jsonResult.feedback,
      details: jsonResult.details,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('AI Verification Error:', error);
    throw error;
  }
}
