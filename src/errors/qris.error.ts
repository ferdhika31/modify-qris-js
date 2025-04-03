/**
 * QRIS error types for handling different types of errors
 */

/**
 * Base QRIS error class
 */
export class QRISError extends Error {
	code?: string;
	details?: any;

	constructor(
		message: string,
		code?: string,
		details?: any,
	) {
		super(message);
		this.name = 'QRISError';
		this.code = code;
		this.details = details;

		// Ensure stack trace works properly for custom errors in V8
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, QRISError);
		}
	}
}

/**
 * Error class specifically for QRIS parsing issues
 */
export class QRISParseError extends Error {
	tag?: string;
	position?: number;
	rawData?: string;

	constructor(
		message: string,
		tag?: string,
		position?: number,
		rawData?: string
	) {
		super(message);
		this.name = 'QRISParseError';
		this.tag = tag;
		this.position = position;
		this.rawData = rawData;

		// Ensure stack trace works properly for custom errors in V8
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, QRISParseError);
		}
	}
}