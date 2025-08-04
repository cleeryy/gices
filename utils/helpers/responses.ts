import { NextResponse } from "next/server";
import { ApiResponse } from "../types/api";

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createdResponse<T>(
  data: T,
  message: string = "Resource created successfully"
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}
