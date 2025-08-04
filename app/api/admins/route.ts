import { NextRequest } from "next/server";
import {
  createAdmin,
  getAllAdmins,
  searchAdmins,
} from "@/utils/database/admins";
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

    if (query) {
      const admins = await searchAdmins(query, { page, limit });
      return successResponse(admins, "Admin search success");
    }

    const admins = await getAllAdmins({ page, limit });
    return successResponse(admins, "Admins list");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const admin = await createAdmin(data);
    return createdResponse(admin, "Admin created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
