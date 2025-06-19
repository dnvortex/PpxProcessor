// This file handles client-side interactions with the OpenAI API through our backend

// Process material to generate summary
export async function generateSummary(materialId: number): Promise<any> {
  try {
    const response = await fetch(`/api/materials/${materialId}/summaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

// Generate quiz from material
export async function generateQuiz(
  materialId: number,
  data: {
    title: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    totalQuestions: number;
    questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'mixed';
  }
): Promise<any> {
  try {
    const response = await fetch(`/api/materials/${materialId}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

// Submit quiz answers for grading
export async function submitQuizAnswers(
  attemptId: number,
  answers: { questionId: number; answer: string }[],
  totalTime: number
): Promise<any> {
  try {
    const response = await fetch(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
        totalTime,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit quiz answers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting quiz answers:', error);
    throw error;
  }
}
