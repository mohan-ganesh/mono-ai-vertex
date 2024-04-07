import express from "express";
import { interactionController } from "../controller/controller.js";

export default function routes(app) {
  const router = express.Router();
  router.post("/interact", async (req, res) => {
    const response = await interactionController(req, res);
    res.json(response);
  });
  router.get("/", (_, res) => {
    res.json({ version: 1.0 });
  });
  app.use(router);
}
