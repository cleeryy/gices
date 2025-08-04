import { prisma } from "@/db/prisma";
import { CreateServiceData, PaginationParams } from "../types/api";
import { validateServiceCode } from "../auth/validation";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  handlePrismaError,
} from "../helpers/errors";

export async function createService(data: CreateServiceData) {
  try {
    if (!validateServiceCode(data.code)) {
      throw new ValidationError(
        "Service code must be 2-10 uppercase letters/numbers"
      );
    }

    const service = await prisma.service.create({
      data,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return service;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getServiceById(id: number) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      users: {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: {
          users: true,
          receivedMails: true,
          sentMails: true,
        },
      },
    },
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  return service;
}

export async function getAllServices(params: PaginationParams = {}) {
  const { page = 1, limit = 1000 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      skip,
      take,
      where: { isActive: true },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.service.count({ where: { isActive: true } }),
  ]);

  return calculatePagination(services, total, page, limit);
}

export async function updateService(
  id: number,
  data: Partial<CreateServiceData>
) {
  try {
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundError("Service");
    }

    if (data.code && !validateServiceCode(data.code)) {
      throw new ValidationError(
        "Service code must be 2-10 uppercase letters/numbers"
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return updatedService;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteService(id: number) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  if (service._count.users > 0) {
    throw new ValidationError("Cannot delete service with active users");
  }

  await prisma.service.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: "Service deleted successfully" };
}
