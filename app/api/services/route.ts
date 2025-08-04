import { NextRequest } from "next/server";
import { createService, getAllServices } from "@/utils/database/services";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "@/utils/helpers/responses";
import { parseNumber } from "@/utils/general";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseNumber(searchParams.get("page"));
    const limit = parseNumber(searchParams.get("limit"));

    const services = await getAllServices({ page, limit });
    return successResponse(services, "Services list");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const service = await createService(data);
    return createdResponse(service, "Service created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
