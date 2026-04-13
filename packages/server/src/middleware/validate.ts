import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/**
 * Returns Express middleware that validates req.query (GET) or req.body (POST/PUT)
 * against the given Zod schema. On failure returns 400 with structured field errors.
 * On success, the parsed (and coerced) value replaces the source.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const source = req.method === "GET" ? req.query : req.body;
    const result = schema.safeParse(source);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Attach coerced/validated data back so routes get typed values
    if (req.method === "GET") {
      req.query = result.data as typeof req.query;
    } else {
      req.body = result.data;
    }

    next();
  };
}
