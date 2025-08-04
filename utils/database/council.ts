import { prisma } from "@/db/prisma";
import { PaginationParams } from "../types/api";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "../helpers/errors";

export interface CreateCouncilData {
  firstName: string;
  lastName: string;
  position: string;
  login: string;
}

export interface UpdateCouncilData {
  firstName?: string;
  lastName?: string;
  position?: string;
  login?: string;
  isActive?: boolean;
}

export async function createCouncil(data: CreateCouncilData) {
  try {
    // Validation login unique
    const existingCouncil = await prisma.council.findUnique({
      where: { login: data.login },
    });

    if (existingCouncil) {
      throw new ValidationError("Login already exists");
    }

    const council = await prisma.council.create({
      data,
      include: {
        _count: {
          select: {
            mailCopies: true,
          },
        },
      },
    });

    return council;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getCouncilById(id: number) {
  const council = await prisma.council.findUnique({
    where: { id },
    include: {
      mailCopies: {
        include: {
          mailIn: {
            select: {
              id: true,
              date: true,
              subject: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10, // Dernières 10 copies
      },
      _count: {
        select: {
          mailCopies: true,
        },
      },
    },
  });

  if (!council) {
    throw new NotFoundError("Council member");
  }

  return council;
}

export async function getAllCouncil(params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [council, total] = await Promise.all([
    prisma.council.findMany({
      skip,
      take,
      where: { isActive: true },
      include: {
        _count: {
          select: {
            mailCopies: true,
          },
        },
      },
      orderBy: { position: "asc" },
    }),
    prisma.council.count({ where: { isActive: true } }),
  ]);

  return calculatePagination(council, total, page, limit);
}

export async function updateCouncil(id: number, data: UpdateCouncilData) {
  try {
    const existingCouncil = await prisma.council.findUnique({
      where: { id },
    });

    if (!existingCouncil) {
      throw new NotFoundError("Council member");
    }

    // Vérifier unicité du login si modifié
    if (data.login && data.login !== existingCouncil.login) {
      const loginExists = await prisma.council.findUnique({
        where: { login: data.login },
      });

      if (loginExists) {
        throw new ValidationError("Login already exists");
      }
    }

    const updatedCouncil = await prisma.council.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            mailCopies: true,
          },
        },
      },
    });

    return updatedCouncil;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteCouncil(id: number) {
  const council = await prisma.council.findUnique({
    where: { id },
  });

  if (!council) {
    throw new NotFoundError("Council member");
  }

  await prisma.council.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: "Council member deleted successfully" };
}

export async function searchCouncil(
  query: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const whereClause = {
    isActive: true,
    OR: [
      { firstName: { contains: query, mode: "insensitive" as const } },
      { lastName: { contains: query, mode: "insensitive" as const } },
      { position: { contains: query, mode: "insensitive" as const } },
      { login: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [council, total] = await Promise.all([
    prisma.council.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        _count: {
          select: {
            mailCopies: true,
          },
        },
      },
      orderBy: { position: "asc" },
    }),
    prisma.council.count({ where: whereClause }),
  ]);

  return calculatePagination(council, total, page, limit);
}
