import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  provider: text("provider").default("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Materials table for uploaded documents
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  fileType: text("file_type").notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Summaries table generated from materials
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  materialId: integer("material_id").references(() => materials.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  materialId: integer("material_id").references(() => materials.id),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  questionType: text("question_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Questions table for quiz questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
});

// Quiz attempts by users
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score"),
  totalTime: integer("total_time"),
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// User answers to questions within an attempt
export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").references(() => quizAttempts.id),
  questionId: integer("question_id").references(() => questions.id),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
});

// Schemas for data insertion
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertMaterialSchema = createInsertSchema(materials)
  .omit({ id: true, createdAt: true });

export const insertSummarySchema = createInsertSchema(summaries)
  .omit({ id: true, createdAt: true });

export const insertQuizSchema = createInsertSchema(quizzes)
  .omit({ id: true, createdAt: true });

export const insertQuestionSchema = createInsertSchema(questions)
  .omit({ id: true });

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts)
  .omit({ id: true, startedAt: true, completedAt: true });

export const insertUserAnswerSchema = createInsertSchema(userAnswers)
  .omit({ id: true });

// Types for data operations
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
