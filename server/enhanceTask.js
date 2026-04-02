import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/enhance-task", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    const prompt = `
You are an AI workflow coach for a sports operations product called Next Play.

Given a task title and optional description, return ONLY valid JSON with these fields:
- improved_title
- improved_description
- suggested_priority (one of: low, normal, high)
- suggested_due_date (YYYY-MM-DD)
- recommended_status (one of: todo, in_progress, in_review, done)
- coaching_recommendation

Interpret the workflow stages like this:
- todo = Game Plan
- in_progress = In Training
- in_review = Coach Review
- done = Match Ready

Rules:
- Be practical and concise.
- If the task is urgent, blocking, or active implementation, prefer in_progress.
- If the task is exploratory, planning, or early-stage, prefer todo.
- If the task sounds complete but needs review, prefer in_review.
- Only use done if it clearly sounds fully complete.

Task title: ${title}
Task description: ${description || ""}

Return only JSON. No markdown.
`;

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: prompt,
    });

    const text = response.output_text;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Model response was not valid JSON.",
        raw: text,
      });
    }

    return res.json(parsed);
  } catch (error) {
    console.error("Enhance task error:", error);
    return res.status(500).json({ error: "Failed to enhance task." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});