import { NextRequest, NextResponse } from "next/server";
import { createMailIn, getAllMailIn } from "@/utils/database/mailIn";
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

    const query = searchParams.get("query");
    const page = parseNumber(searchParams.get("page"));
    const limit = parseNumber(searchParams.get("limit"));

    const needsMayor = searchParams.get("needsMayor") === "true";
    const needsDgs = searchParams.get("needsDgs") === "true";
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    // Tableaux d'IDs de services
    const serviceIdsParam = searchParams.get("serviceIds");
    const serviceIds = serviceIdsParam
      ? serviceIdsParam
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : undefined;

    const destinationType = searchParams.get("destinationType") as
      | "INFO"
      | "SUIVI"
      | null;

    const filters = {
      needsMayor: searchParams.has("needsMayor") ? needsMayor : undefined,
      needsDgs: searchParams.has("needsDgs") ? needsDgs : undefined,
      serviceIds,
      destinationType: destinationType || undefined,
      dateFrom,
      dateTo,
    };

    const mails = await getAllMailIn({ page, limit }, filters, query);

    return successResponse(mails, "Mail in list retrieved successfully");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const mail = await createMailIn(data);
    return createdResponse(mail, "Mail created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
