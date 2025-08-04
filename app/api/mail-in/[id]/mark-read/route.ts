import { NextRequest, NextResponse } from "next/server";
import { markAsRead } from "@/utils/database/mailIn";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { userId } = await request.json();
    const result = await markAsRead(Number(id), userId);
    return successResponse(result, "Mail marked as read");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 400);
  }
}
