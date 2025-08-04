import { NextRequest } from "next/server";
import { createUser, getAllUsers, searchUsers } from "@/utils/database/users";
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
      const users = await searchUsers(query, { page, limit });
      return successResponse(users, "User search success");
    }
    const users = await getAllUsers({ page, limit });
    return successResponse(users, "Users list");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const user = await createUser(data);
    return createdResponse(user, "User created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
