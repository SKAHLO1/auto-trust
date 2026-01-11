import { GoogleGenerativeAI } from '@google/generative-ai';
import { Submission, Task, VerificationResult } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateVerification(
  submission: Submission,
  task: Task
): Promise<VerificationResult> {
  try {
    console.log('Generating verification with Gemini AI...');
    
    // Use Gemini 2.5 Flash (latest stable model - best price-performance)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format verification criteria properly
    let criteriaText = '';
    if (typeof task.verificationCriteria === 'string') {
      criteriaText = task.verificationCriteria;
    } else if (task.verificationCriteria?.requirements) {
      criteriaText = task.verificationCriteria.requirements.join('\n');
      if (task.verificationCriteria.additionalNotes) {
        criteriaText += '\n\nAdditional Notes:\n' + task.verificationCriteria.additionalNotes;
      }
    } else {
      criteriaText = JSON.stringify(task.verificationCriteria, null, 2);
    }

    const prompt = `
You are an expert work quality verifier for freelance tasks on the AutoTrust platform.

Task Title: ${task.title}
Task Description: ${task.description}

Verification Requirements:
${criteriaText}

Submitted Work:
- Link: ${submission.data?.submissionLink || 'Not provided'}
- Type: ${submission.type}
- Notes: ${submission.data?.notes || 'No notes provided'}

Analyze the submitted work against the task requirements. Provide:
1. A pass/fail verdict (true for pass, false for fail)
2. A score from 0-100
3. Brief summary of the review
4. Specific feedback on the submission
5. List of details (what passed, what failed)

Return ONLY a valid JSON object with keys: verdict (boolean), score (number), summary (string), feedback (string), details (array of strings).
Do not include markdown formatting like \`\`\`json.
    `;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini response received');

    // Clean up potential markdown formatting if Gemini adds it
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResult = JSON.parse(jsonStr);

    const verificationResult: VerificationResult = {
      verdict: (jsonResult.verdict ? 'passed' : 'failed') as 'passed' | 'failed',
      score: jsonResult.score || 0,
      summary: jsonResult.summary || jsonResult.feedback || 'Verification completed',
      feedback: jsonResult.feedback || '',
      details: Array.isArray(jsonResult.details) ? jsonResult.details : [],
      analyzedAt: new Date().toISOString(),
    };

    console.log('Verification result:', verificationResult.verdict, verificationResult.score);
    return verificationResult;
  } catch (error) {
    console.error('AI Verification Error:', error);
    throw error;
  }
}
