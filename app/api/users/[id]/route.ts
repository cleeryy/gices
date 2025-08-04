import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/utils/helpers/responses";
import { deleteUser, getUserById, updateUser } from "@/utils/database/users";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params; // Await params first
    const service = await getUserById(id);
    return successResponse(service);
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params; // Await params first
    const data = await request.json();
    const service = await updateUser(id, data);
    return successResponse(service, "Service updated");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params; // Await params first
    const info = await deleteUser(id);
    return successResponse(info, "Service deleted");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}
