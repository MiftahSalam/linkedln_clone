import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { CustomHttpExceptionResponse, HttpExceptionResponse } from "./models/http-exception-response.interface";
import * as fs from 'fs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let status: HttpStatus;
        let errorMessage: string;

        if(exception instanceof HttpException) {
            const errorResponse = exception.getResponse();
            errorMessage = (errorResponse as HttpExceptionResponse).error || exception.message;
            status = exception.getStatus();
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = "Critical server error occured";
        }

        const errorResponse = this.getErrorResponse(status, errorMessage, request);
        const errorLog = this.logError(errorResponse, request, exception);

        this.writeLogErrorToFile(errorLog);
        response.status(status).json(errorResponse);
    }

    private getErrorResponse(status: number, errorMessage: string, request: Request): CustomHttpExceptionResponse {
        return ({
            statusCode: status,
            error: errorMessage,
            path: request.url,
            method: request.method,
            timeStamp: new Date()
        })
    }

    private logError(errorResponse: CustomHttpExceptionResponse, request: Request, exception: unknown): string {
        const { statusCode, error, method, path } =  errorResponse;
        const errorLog = `Respond Code: ${statusCode} - Method: ${method} - URL: ${path}\n\n
        ${JSON.stringify(errorResponse)}\n\n
        User: ${JSON.stringify(request.user ?? 'Not Signed In')}\n\n
        ${exception instanceof HttpException ? exception.stack : error}\n\n`;

        return errorLog;
    }

    private writeLogErrorToFile(errorLog: string): void {
        fs.appendFile('error.log', errorLog, 'utf8', (err) => {
            if(err) throw err;
        })
    }
}