import { Router } from "express";
import { DemoResponse } from "@shared/api";

const router = Router();

router.get("/demo", (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
});

router.get("/ping", (req, res) => {
  res.json({ message: "Hello from Express server v2!" });
});

export default router;
