import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { successResponse, errorResponse } from "@/utils/helpers/responses";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the highest ID and add 1 to predict the next ID
    const lastMail = await prisma.mailIn.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });

    const nextId = lastMail ? lastMail.id + 1 : 1;

    return successResponse(nextId, "Next mail ID retrieved successfully");
  } catch (e: any) {
    return errorResponse(e.message, e.statusCode ?? 500);
  }
}
