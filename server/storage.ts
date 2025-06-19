import { db } from './db';
import { eq, and } from 'drizzle-orm';
import {
  users, 
  materials, 
  summaries, 
  quizzes, 
  questions, 
  quizAttempts, 
  userAnswers,
  type User, 
  type InsertUser, 
  type Material, 
  type InsertMaterial, 
  type Summary, 
  type InsertSummary, 
  type Quiz, 
  type InsertQuiz, 
  type Question, 
  type InsertQuestion, 
  type QuizAttempt, 
  type InsertQuizAttempt, 
  type UserAnswer, 
  type InsertUserAnswer
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Material Operations
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialsByUserId(userId: number): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Summary Operations
  getSummary(id: number): Promise<Summary | undefined>;
  getSummariesByUserId(userId: number): Promise<Summary[]>;
  getSummariesByMaterialId(materialId: number): Promise<Summary[]>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  
  // Quiz Operations
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByUserId(userId: number): Promise<Quiz[]>;
  getQuizzesByMaterialId(materialId: number): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Question Operations
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByQuizId(quizId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Quiz Attempt Operations
  getQuizAttempt(id: number): Promise<QuizAttempt | undefined>;
  getQuizAttemptsByUserId(userId: number): Promise<QuizAttempt[]>;
  getQuizAttemptsByQuizId(quizId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: number, score: number, completed: boolean): Promise<QuizAttempt | undefined>;
  
  // User Answer Operations
  getUserAnswer(id: number): Promise<UserAnswer | undefined>;
  getUserAnswersByAttemptId(attemptId: number): Promise<UserAnswer[]>;
  createUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Material Operations
  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }

  async getMaterialsByUserId(userId: number): Promise<Material[]> {
    return await db.select().from(materials).where(eq(materials.userId, userId));
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db.insert(materials).values(insertMaterial).returning();
    return material;
  }

  // Summary Operations
  async getSummary(id: number): Promise<Summary | undefined> {
    const [summary] = await db.select().from(summaries).where(eq(summaries.id, id));
    return summary;
  }

  async getSummariesByUserId(userId: number): Promise<Summary[]> {
    return await db.select().from(summaries).where(eq(summaries.userId, userId));
  }

  async getSummariesByMaterialId(materialId: number): Promise<Summary[]> {
    return await db.select().from(summaries).where(eq(summaries.materialId, materialId));
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db.insert(summaries).values(insertSummary).returning();
    return summary;
  }

  // Quiz Operations
  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizzesByUserId(userId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.userId, userId));
  }

  async getQuizzesByMaterialId(materialId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.materialId, materialId));
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values(insertQuiz).returning();
    return quiz;
  }

  // Question Operations
  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async getQuestionsByQuizId(quizId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  // Quiz Attempt Operations
  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return attempt;
  }

  async getQuizAttemptsByUserId(userId: number): Promise<QuizAttempt[]> {
    return await db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
  }

  async getQuizAttemptsByQuizId(quizId: number): Promise<QuizAttempt[]> {
    return await db.select().from(quizAttempts).where(eq(quizAttempts.quizId, quizId));
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db.insert(quizAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async updateQuizAttempt(id: number, score: number, completed: boolean): Promise<QuizAttempt | undefined> {
    const now = new Date();
    const [updatedAttempt] = await db
      .update(quizAttempts)
      .set({ 
        score, 
        completed,
        completedAt: completed ? now : null
      })
      .where(eq(quizAttempts.id, id))
      .returning();
    
    return updatedAttempt;
  }

  // User Answer Operations
  async getUserAnswer(id: number): Promise<UserAnswer | undefined> {
    const [answer] = await db.select().from(userAnswers).where(eq(userAnswers.id, id));
    return answer;
  }

  async getUserAnswersByAttemptId(attemptId: number): Promise<UserAnswer[]> {
    return await db.select().from(userAnswers).where(eq(userAnswers.attemptId, attemptId));
  }

  async createUserAnswer(insertAnswer: InsertUserAnswer): Promise<UserAnswer> {
    const [answer] = await db.insert(userAnswers).values(insertAnswer).returning();
    return answer;
  }
}

// Use the database storage
export const storage = new DatabaseStorage();