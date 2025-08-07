import { NextRequest } from "next/server";
import {
  createCouncil,
  getAllCouncil,
  searchCouncil,
} from "@/utils/database/council";
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
    const includeInactive = searchParams.get("includeInactive") === "true";

    if (query) {
      const council = await searchCouncil(
        query,
        { page, limit },
        includeInactive
      );
      return successResponse(council, "Council search success");
    }

    const council = await getAllCouncil({ page, limit }, includeInactive);
    return successResponse(council, "Council list");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const councilMember = await createCouncil(data);
    return createdResponse(councilMember, "Council member created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
