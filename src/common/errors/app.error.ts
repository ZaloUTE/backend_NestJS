export class AppError extends Error {
    statusCode: number;
    code?: string;

    constructor(error: {message: string; statusCode: number; code: string}) {
        super(error.message);
        this.statusCode = error.statusCode;
        this.code = error.code;
    }
}