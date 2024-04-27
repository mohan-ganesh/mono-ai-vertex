import express from "express";

import { conversationController } from "../controller/controller_openai.js";
import { proConversationController } from "../controller/controller_gemini.js";

export default function routes(app) {
  const router = express.Router();

  router.post("/api/v1/agent", async (req, res) => {
    const response = await conversationController(req, res);
    res.json(response);
  });

  router.post("/api/v1/pro/agent", async (req, res) => {
    const response = await proConversationController(req, res);
    res.json(response);
  });

  router.get("/api/v1/agent", (_, res) => {
    const timestamp = new Date().toISOString();
    res.json({ timestamp });
  });
  app.use(router);
}
