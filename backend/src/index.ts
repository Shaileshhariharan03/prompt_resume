import Groq from "groq-sdk";
import express, { json } from "express";
import cors from "cors";
import { RESUME_PROMPT_TEMPLATE } from "./promptConfig";

require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

//api endpoint
app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const resumePrompt = RESUME_PROMPT_TEMPLATE.replace(
      "{{USER_INPUT}}",
      prompt
    );
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: resumePrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });
    const generatedResume = response.choices[0]?.message?.content || "";
    const cleaned = generatedResume.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
    console.log(parsed);
  } catch (error) {
    console.error("Error generating resume:", error);
    res.json({ error: "Something went wrong while generating the resume." });
  }
});

app.listen(3000);
