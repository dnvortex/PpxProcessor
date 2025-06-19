import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Set generation config for consistent responses
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
};

// Generate a summary from the given text content
export async function generateSummary(text: string, title: string): Promise<string> {
  try {
    const prompt = `
    You are an expert educational summarizer. Create a comprehensive summary of the provided study material, organized by topic and subtopic. Include key concepts, definitions, and important points.

    Generate a detailed summary for study material titled: "${title}". Here's the content to summarize:

    ${text}
    `;

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    return response.text() || "Unable to generate summary";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

// Define question type options
type QuestionType = "multiple-choice" | "true-false" | "fill-blank" | "short-answer" | "mixed";
type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";

// Generate quiz questions from the given content
export async function generateQuizQuestions(
  text: string, 
  title: string,
  questionType: QuestionType,
  difficultyLevel: DifficultyLevel,
  numQuestions: number
): Promise<any> {
  try {
    // Create a structured prompt for Gemini
    const prompt = `
    You are an expert educational quiz creator. Create ${numQuestions} quiz questions based on the provided study material. The questions should be of type "${questionType}" and difficulty level "${difficultyLevel}".
    
    For multiple-choice questions, include 4 options with 1 correct answer.
    For true-false questions, specify the correct answer.
    For fill-in-the-blank questions, provide the exact word or phrase for the blank.
    For short-answer questions, provide the expected answer and possible variations.
    
    Generate ${numQuestions} ${questionType} questions (${difficultyLevel} difficulty) for study material titled: "${title}". Here's the content:

    ${text}
    
    Return the response as a JSON array of question objects with the following structure:
    [
      {
        "questionText": "The question text",
        "questionType": "multiple-choice|true-false|fill-blank|short-answer",
        "options": ["Option A", "Option B", "Option C", "Option D"], (for multiple-choice only)
        "correctAnswer": "The correct answer",
        "explanation": "Explanation of the correct answer"
      }
    ]
    
    Your response should be valid JSON only, no other text.
    `;

    // Set specific generation config for structured response
    const quizGenerationConfig: GenerationConfig = {
      ...generationConfig,
      temperature: 0.2, // Lower temperature for more structured output
    };

    // Use Gemini model to generate quiz questions
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: quizGenerationConfig,
    });

    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to generate valid JSON response");
    }

    // Parse the JSON
    const quizQuestions = JSON.parse(jsonMatch[0]);
    return quizQuestions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

// Grade a user's quiz attempt
export async function gradeQuizAnswers(questions: any[], userAnswers: string[]): Promise<any[]> {
  const results = [];
  
  // For each question, check if the user's answer is correct
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const userAnswer = userAnswers[i];
    let isCorrect = false;
    
    if (question.questionType === "multiple-choice" || question.questionType === "true-false") {
      // Direct comparison for multiple choice and true/false
      isCorrect = userAnswer === question.correctAnswer;
    } else if (question.questionType === "fill-blank") {
      // Case insensitive comparison for fill-in-the-blank
      isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    } else if (question.questionType === "short-answer") {
      // For short answers, use Gemini to evaluate the response
      try {
        const prompt = `
        You are an expert educational assessor. Evaluate if the student's answer is correct based on the expected answer.

        Question: ${question.questionText}
        Expected Answer: ${question.correctAnswer}
        Student's Answer: ${userAnswer}

        Is the student's answer correct? Reply with just "correct" or "incorrect".
        `;

        // Use a more precise generation config for evaluation
        const evalGenerationConfig: GenerationConfig = {
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 10,
        };

        const result = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: evalGenerationConfig,
        });

        const responseText = result.response.text().toLowerCase();
        isCorrect = responseText.includes("correct") && !responseText.includes("incorrect");
      } catch (error) {
        console.error("Error grading short answer:", error);
        isCorrect = false;
      }
    }
    
    results.push({
      questionId: question.id,
      isCorrect,
      userAnswer
    });
  }
  
  return results;
}
