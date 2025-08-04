import { NextRequest, NextResponse } from "next/server";
import {
  getServiceById,
  updateService,
  deleteService,
} from "@/utils/database/services";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const service = await getServiceById(Number(id));
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
    const { id } = await params;
    const data = await request.json();
    const service = await updateService(Number(id), data);
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
    const { id } = await params;
    const info = await deleteService(Number(id));
    return successResponse(info, "Service deleted");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 404);
  }
}
