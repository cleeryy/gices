import { NextRequest, NextResponse } from "next/server";
import {
  getMailInById,
  updateMailIn,
  deleteMailIn,
  markAsRead,
} from "@/utils/database/mailIn";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const mail = await getMailInById(Number(id));
    return successResponse(mail);
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
    const mail = await updateMailIn(Number(id), data);
    return successResponse(mail, "Mail updated");
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
    const info = await deleteMailIn(Number(id));
    return successResponse(info, "Mail deleted");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}
