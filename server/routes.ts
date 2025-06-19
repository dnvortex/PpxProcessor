import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserSchema, insertMaterialSchema, insertQuizSchema, insertQuizAttemptSchema, insertUserAnswerSchema } from "@shared/schema";
import { generateSummary, generateQuizQuestions, gradeQuizAnswers } from "./ai";
import { processFile } from "./fileProcessing";
import { createPdfFromText } from "./fileProcessing";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".pdf", ".docx", ".doc", ".txt", ".jpg", ".jpeg", ".png", ".ppt", ".pptx", ".ppx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format: ${ext}`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // User endpoints
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Check if user with username already exists
      if (userData.username) {
        const existingUserByUsername = await storage.getUserByUsername(userData.username);
        if (existingUserByUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user", error: error.message });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error: error.message });
    }
  });

  // Material endpoints
  app.post("/api/materials", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const filePath = req.file.path;
      const fileType = path.extname(req.file.originalname).substring(1);
      
      // Extract text content from the file
      const content = await processFile(filePath);
      
      const materialData = {
        userId: parseInt(req.body.userId),
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        fileType,
        content,
        fileUrl: filePath,
        subject: req.body.subject || "",
      };
      
      // Validate the material data
      const validatedData = insertMaterialSchema.parse(materialData);
      
      // Create the material
      const newMaterial = await storage.createMaterial(validatedData);
      res.status(201).json(newMaterial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid material data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create material", error: error.message });
    }
  });

  app.get("/api/materials/:id", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.id);
      if (isNaN(materialId)) {
        return res.status(400).json({ message: "Invalid material ID" });
      }
      
      const material = await storage.getMaterial(materialId);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to get material", error: error.message });
    }
  });

  app.get("/api/users/:userId/materials", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const materials = await storage.getMaterialsByUserId(userId);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to get materials", error: error.message });
    }
  });

  // Summary endpoints
  app.post("/api/materials/:materialId/summaries", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.materialId);
      if (isNaN(materialId)) {
        return res.status(400).json({ message: "Invalid material ID" });
      }
      
      const material = await storage.getMaterial(materialId);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      // Generate summary from material content
      const summaryContent = await generateSummary(material.content, material.title);
      
      // Create PDF from the summary
      const pdfBytes = await createPdfFromText(summaryContent, `Summary: ${material.title}`);
      
      // Save PDF to file
      const pdfDir = path.join(__dirname, "../pdf");
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      
      const pdfFilename = `summary-${materialId}-${Date.now()}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFilename);
      fs.writeFileSync(pdfPath, pdfBytes);
      
      const summaryData = {
        userId: material.userId,
        materialId,
        title: `Summary: ${material.title}`,
        content: summaryContent,
        pdfUrl: pdfPath,
      };
      
      const newSummary = await storage.createSummary(summaryData);
      res.status(201).json(newSummary);
    } catch (error) {
      res.status(500).json({ message: "Failed to create summary", error: error.message });
    }
  });

  app.get("/api/summaries/:id", async (req: Request, res: Response) => {
    try {
      const summaryId = parseInt(req.params.id);
      if (isNaN(summaryId)) {
        return res.status(400).json({ message: "Invalid summary ID" });
      }
      
      const summary = await storage.getSummary(summaryId);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to get summary", error: error.message });
    }
  });

  app.get("/api/users/:userId/summaries", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const summaries = await storage.getSummariesByUserId(userId);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get summaries", error: error.message });
    }
  });

  app.get("/api/materials/:materialId/summaries", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.materialId);
      if (isNaN(materialId)) {
        return res.status(400).json({ message: "Invalid material ID" });
      }
      
      const summaries = await storage.getSummariesByMaterialId(materialId);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get summaries", error: error.message });
    }
  });

  // Download PDF summary
  app.get("/api/summaries/:id/pdf", async (req: Request, res: Response) => {
    try {
      const summaryId = parseInt(req.params.id);
      if (isNaN(summaryId)) {
        return res.status(400).json({ message: "Invalid summary ID" });
      }
      
      const summary = await storage.getSummary(summaryId);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      if (!summary.pdfUrl || !fs.existsSync(summary.pdfUrl)) {
        return res.status(404).json({ message: "PDF file not found" });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="summary-${summaryId}.pdf"`);
      
      const fileStream = fs.createReadStream(summary.pdfUrl);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to download PDF", error: error.message });
    }
  });

  // Quiz endpoints
  app.post("/api/materials/:materialId/quizzes", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.materialId);
      if (isNaN(materialId)) {
        return res.status(400).json({ message: "Invalid material ID" });
      }
      
      const material = await storage.getMaterial(materialId);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      const { title, description, difficulty, totalQuestions, questionType } = req.body;
      
      const quizData = {
        userId: material.userId,
        materialId,
        title: title || `Quiz: ${material.title}`,
        description: description || "",
        difficulty: difficulty || "medium",
        totalQuestions: parseInt(totalQuestions) || 10,
        questionType: questionType || "multiple-choice",
      };
      
      const validatedData = insertQuizSchema.parse(quizData);
      const newQuiz = await storage.createQuiz(validatedData);
      
      // Generate questions for the quiz
      const questionsResult = await generateQuizQuestions(
        material.content,
        material.title,
        quizData.questionType,
        quizData.difficulty,
        quizData.totalQuestions
      );
      
      // Store the generated questions
      if (questionsResult && questionsResult.questions) {
        const questions = questionsResult.questions;
        
        for (const questionData of questions) {
          await storage.createQuestion({
            quizId: newQuiz.id,
            questionText: questionData.questionText,
            questionType: questionData.questionType,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            explanation: questionData.explanation,
          });
        }
      }
      
      res.status(201).json(newQuiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz", error: error.message });
    }
  });

  app.get("/api/quizzes/:id", async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz", error: error.message });
    }
  });

  app.get("/api/users/:userId/quizzes", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const quizzes = await storage.getQuizzesByUserId(userId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quizzes", error: error.message });
    }
  });

  app.get("/api/quizzes/:quizId/questions", async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const questions = await storage.getQuestionsByQuizId(quizId);
      
      // If the questions have correctAnswer, remove it from the response
      // to avoid cheating
      const questionsWithoutAnswers = questions.map(q => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest;
      });
      
      res.json(questionsWithoutAnswers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz questions", error: error.message });
    }
  });

  // Quiz attempt endpoints
  app.post("/api/quizzes/:quizId/attempts", async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const attemptData = {
        userId: parseInt(req.body.userId),
        quizId,
        score: null,
        totalTime: null,
        completed: false,
      };
      
      const validatedData = insertQuizAttemptSchema.parse(attemptData);
      const newAttempt = await storage.createQuizAttempt(validatedData);
      
      res.status(201).json(newAttempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attempt data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz attempt", error: error.message });
    }
  });

  app.post("/api/attempts/:attemptId/submit", async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }
      
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      if (attempt.completed) {
        return res.status(400).json({ message: "This attempt has already been completed" });
      }
      
      const { answers, totalTime } = req.body;
      
      if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers must be an array" });
      }
      
      // Get the questions for this quiz
      const questions = await storage.getQuestionsByQuizId(attempt.quizId);
      
      // Grade the answers
      const gradedAnswers = await gradeQuizAnswers(
        questions,
        answers.map(a => a.answer)
      );
      
      // Calculate the score
      let correctCount = 0;
      for (let i = 0; i < gradedAnswers.length; i++) {
        const gradedAnswer = gradedAnswers[i];
        const questionId = questions[i].id;
        
        // Save the user answer
        await storage.createUserAnswer({
          attemptId,
          questionId,
          userAnswer: answers[i].answer,
          isCorrect: gradedAnswer.isCorrect,
        });
        
        if (gradedAnswer.isCorrect) {
          correctCount++;
        }
      }
      
      // Calculate percentage score
      const score = Math.round((correctCount / questions.length) * 100);
      
      // Update the attempt
      const updatedAttempt = await storage.updateQuizAttempt(attemptId, score, true);
      
      res.json({
        attempt: updatedAttempt,
        score,
        totalAnswered: answers.length,
        totalCorrect: correctCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit quiz", error: error.message });
    }
  });

  app.get("/api/users/:userId/attempts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const attempts = await storage.getQuizAttemptsByUserId(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz attempts", error: error.message });
    }
  });

  app.get("/api/attempts/:attemptId/results", async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }
      
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      if (!attempt.completed) {
        return res.status(400).json({ message: "This attempt has not been completed yet" });
      }
      
      // Get the questions for this quiz
      const questions = await storage.getQuestionsByQuizId(attempt.quizId);
      
      // Get the user's answers
      const userAnswers = await storage.getUserAnswersByAttemptId(attemptId);
      
      // Match questions with answers
      const results = questions.map(question => {
        const userAnswer = userAnswers.find(answer => answer.questionId === question.id);
        return {
          question,
          userAnswer: userAnswer ? userAnswer.userAnswer : null,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
        };
      });
      
      res.json({
        attempt,
        results,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get attempt results", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
