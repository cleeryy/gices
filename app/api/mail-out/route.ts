import { NextRequest } from "next/server";
import {
  createMailOut,
  getAllMailOut,
  searchMailOut,
  getMailOutByUser,
} from "@/utils/database/mailOut";
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

    // Filtres spécifiques au courrier sortant
    const serviceId = parseNumber(searchParams.get("serviceId"));
    const userId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    const filters = {
      serviceId,
      userId: userId || undefined,
      dateFrom,
      dateTo,
    };

    if (query) {
      const mails = await searchMailOut(query, { page, limit });
      return successResponse(mails, "Mail search success");
    }

    // Si on filtre par utilisateur spécifique
    if (userId) {
      const mails = await getMailOutByUser(userId, { page, limit });
      return successResponse(mails, `Mail out list for user ${userId}`);
    }

    const mails = await getAllMailOut({ page, limit }, filters);
    return successResponse(mails, "Mail out list");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const mail = await createMailOut(data);
    return createdResponse(mail, "Mail created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
