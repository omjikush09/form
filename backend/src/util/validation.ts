import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

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
			const validatedData: any = {};
			
			// Validate params if schema provided
			if (schemas.params) {
				const paramsResult = schemas.params.parse(req.params);
				validatedData.params = paramsResult;
				req.validatedParams = paramsResult;
			}
			
			// Validate body if schema provided
			if (schemas.body) {
				const bodyResult = schemas.body.parse(req.body);
				validatedData.body = bodyResult;
				req.validatedBody = bodyResult;
			}
			
			// Validate query if schema provided
			if (schemas.query) {
				const queryResult = schemas.query.parse(req.query);
				validatedData.query = queryResult;
				req.validatedQuery = queryResult;
			}
			
			// Attach all validated data to request
			req.validatedData = validatedData;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.issues.map((err) => ({
						field: err.path.join('.'),
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

// Specific validation helpers for different parts of the request
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = schema.parse(req.body);
			req.validatedBody = result;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.issues.map((err) => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				});
			}
			
			return res.status(400).json({
				error: "Invalid request body",
			});
		}
	};
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = schema.parse(req.params);
			req.validatedParams = result;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.issues.map((err) => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				});
			}
			
			return res.status(400).json({
				error: "Invalid request parameters",
			});
		}
	};
};

// Type augmentation for Express Request to include validated data
declare global {
	namespace Express {
		interface Request {
			validatedData?: any;
			validatedBody?: any;
			validatedParams?: any;
			validatedQuery?: any;
		}
	}
}
