import { NextRequest, NextResponse } from "next/server";
import {
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "@/utils/database/admins";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const admin = await getAdminById(Number(id));
    return successResponse(admin);
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
    const admin = await updateAdmin(Number(id), data);
    return successResponse(admin, "Admin updated");
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
    const info = await deleteAdmin(Number(id));
    return successResponse(info, "Admin deleted");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}
