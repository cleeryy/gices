import { NextRequest, NextResponse } from "next/server";
import {
  getContactInById,
  updateContactIn,
  deleteContactIn,
} from "@/utils/database/contacts";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const contact = await getContactInById(Number(id));
    return successResponse(contact);
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const data = await request.json();
    const contact = await updateContactIn(Number(id), data);
    return successResponse(contact, "Contact updated");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const info = await deleteContactIn(Number(id));
    return successResponse(info, "Contact deleted");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}
