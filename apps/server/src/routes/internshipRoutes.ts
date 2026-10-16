import { Router, Request, Response, NextFunction } from "express";
import { internshipService } from "../services/internshipService.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  CreateInternshipSchema,
  UpdateInternshipSchema,
  InternshipIdParamSchema,
  ImportInternshipsSchema,
} from "../validation/internship.js";

export const internshipRouter = Router();

// GET /api/internships - List all applications (supports ?q=...&status=...&sort=asc|desc)
internshipRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q : undefined;
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const sort = req.query.sort === "asc" || req.query.sort === "desc" ? req.query.sort : undefined;

      const data = await internshipService.getAllInternships({
        query: q,
        status,
        sortOrder: sort,
      });
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/internships/export - Export applications as JSON or CSV
internshipRouter.get(
  "/export",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = req.query.format === "csv" ? "csv" : "json";
      const { content, contentType, filename } = await internshipService.exportData(format);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/internships/import - Batch import applications
internshipRouter.post(
  "/import",
  validateBody(ImportInternshipsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await internshipService.importInternships(req.body.items);
      res.status(201).json({
        message: `Successfully imported ${result.count} applications`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/internships - Create application
internshipRouter.post(
  "/",
  validateBody(CreateInternshipSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await internshipService.createInternship(req.body);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/internships/:id - Detail of application
internshipRouter.get(
  "/:id",
  validateParams(InternshipIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await internshipService.getInternshipById(
        String(req.params.id)
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/internships/:id - Update application or status
internshipRouter.patch(
  "/:id",
  validateParams(InternshipIdParamSchema),
  validateBody(UpdateInternshipSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await internshipService.updateInternship(
        String(req.params.id),
        req.body
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/internships/:id - Delete application
internshipRouter.delete(
  "/:id",
  validateParams(InternshipIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await internshipService.deleteInternship(
        String(req.params.id)
      );
      res.json({
        data,
        message: "Internship deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/internships/:id/history - Read status history
internshipRouter.get(
  "/:id/history",
  validateParams(InternshipIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await internshipService.getStatusHistory(
        String(req.params.id)
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
);
