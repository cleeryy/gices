import { NextRequest, NextResponse } from "next/server";
import {
  getCouncilById,
  updateCouncil,
  deleteCouncil,
} from "@/utils/database/council";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const councilMember = await getCouncilById(Number(id));
    return successResponse(councilMember);
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
    const councilMember = await updateCouncil(Number(id), data);
    return successResponse(councilMember, "Council member updated");
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
    const info = await deleteCouncil(Number(id));
    return successResponse(info, "Council member deleted");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}
