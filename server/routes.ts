import type { Express } from "express";
import { type Server } from "http";
import { setupAuth, requireAuth } from "./auth";
import multer from "multer";
import { thirdPartySearchSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos Excel (.xlsx, .xls)"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.post("/api/third-party/search", requireAuth, (req, res) => {
    const parsed = thirdPartySearchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos de búsqueda inválidos", errors: parsed.error.errors });
    }

    const { searchType, searchValue } = parsed.data;

    res.json({
      searchType,
      searchValue,
      results: [],
      message: "Funcionalidad de validación en listas pendiente de implementación",
    });
  });

  app.post("/api/third-party/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No se proporcionó archivo" });
    }

    res.json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      totalRecords: 0,
      processedRecords: 0,
      errors: [],
      status: "completed",
      message: "Archivo recibido. Funcionalidad de procesamiento pendiente de implementación",
    });
  });

  return httpServer;
}
