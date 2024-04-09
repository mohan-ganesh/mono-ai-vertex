import express from "express";
import { interactionController } from "../controller/controller.js";

import { conversationController } from "../controller/controller_conversation.js";

export default function routes(app) {
  const router = express.Router();
  router.post("/interact", async (req, res) => {
    const response = await interactionController(req, res);
    res.json(response);
  });

  router.get("/interact", async (req, res) => {
    const response = await interactionController(req, res);
    res.json(response);
  });

  router.post("/conversation", async (req, res) => {
    const response = await conversationController(req, res);
    res.json(response);
  });

  router.get("/", (_, res) => {
    const timestamp = new Date().toISOString();
    res.json({ timestamp });
  });
  app.use(router);
}
