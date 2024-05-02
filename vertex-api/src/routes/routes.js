import express from "express";
import { interactionController } from "../controller/controller.js";

import { conversationController } from "../controller/controller_conversation.js";
import { proConversationController } from "../controller/controller_conversation15.js";
import { proCompareController } from "../controller/controller_compare.js";
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

  router.post("/api/v1/conversation", async (req, res) => {
    const response = await conversationController(req, res);
    res.json(response);
  });

  router.post("/api/v1/pro/conversation", async (req, res) => {
    const response = await proConversationController(req, res);
    res.json(response);
  });

  router.post("/api/v1/pro/compare", async (req, res) => {
    const response = await proCompareController(req, res);
    res.json(response);
  });

  router.get("/", (_, res) => {
    console.log("default path");
    const timestamp = new Date().toISOString();
    res.json({ timestamp });
  });
  app.use(router);
}
