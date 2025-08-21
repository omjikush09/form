import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Type helper to extract Zod schema types
export type CreateRequestType<
	T extends {
		params?: z.ZodSchema<any>;
		body?: z.ZodSchema<any>;
		query?: z.ZodSchema<any>;
	}
> = {
	params: T["params"] extends z.ZodSchema<infer P> ? P : {};
	body: T["body"] extends z.ZodSchema<infer B> ? B : unknown;
	query: T["query"] extends z.ZodSchema<infer Q> ? Q : {};
};

// Interface for validation schemas
interface ValidationSchemas {
	params?: z.ZodSchema<any>;
	body?: z.ZodSchema<any>;
	query?: z.ZodSchema<any>;
}

// Enhanced validation function that takes schemas for different parts of the request
export const validateRequest = (schemas: ValidationSchemas) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Validate params if schema provided
			if (schemas.params) {
				schemas.params.parse(req.params);
			}

			// Validate body if schema provided
			if (schemas.body) {
				schemas.body.parse(req.body);
			}

			// Validate query if schema provided
			if (schemas.query) {
				schemas.query.parse(req.query);
			}

			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.issues.map((err) => ({
						field: err.path.join("."),
						message: err.message,
					})),
				});
			}

			return res.status(400).json({
				error: "Invalid request data",
			});
		}
	};
};
