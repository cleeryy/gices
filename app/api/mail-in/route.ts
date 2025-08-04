import { NextRequest } from "next/server";
import { createMailIn, getAllMailIn } from "@/utils/database/mailIn"; // ✅ CORRIGÉ: searchMailIn n'est plus importé
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

    console.log(searchParams.toString());

    // ✅ CORRIGÉ: Tous les paramètres sont récupérés ici
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

    // ✅ CORRIGÉ: Parsing du tableau d'IDs de services depuis l'URL (ex: ?serviceIds=1,5,12)
    const serviceIdsParam = searchParams.get("serviceIds");
    const serviceIds = serviceIdsParam
      ? serviceIdsParam
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : undefined;

    const filters = {
      needsMayor: searchParams.has("needsMayor") ? needsMayor : undefined,
      needsDgs: searchParams.has("needsDgs") ? needsDgs : undefined,
      serviceIds,
      dateFrom,
      dateTo,
    };

    // ✅ CORRIGÉ: Un seul appel à getAllMailIn qui gère tout
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
