import { NextRequest } from "next/server";
import {
  createContactIn,
  getAllContactsIn,
  searchContactsIn,
} from "@/utils/database/contacts";
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
      const contacts = await searchContactsIn(query, { page, limit });
      return successResponse(contacts, "Contact search success");
    }

    const contacts = await getAllContactsIn({ page, limit });
    return successResponse(contacts, "Contacts in list");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const contact = await createContactIn(data);
    return createdResponse(contact, "Contact created");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
