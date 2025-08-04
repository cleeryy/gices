import { prisma } from "@/db/prisma";
import { hashPassword } from "../auth/password";
import {
  validateUserId,
  validatePassword,
  validateEmail,
} from "../auth/validation";
import {
  CreateUserData,
  UpdateUserData,
  PaginationParams,
  PaginationResult,
} from "../types/api";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  handlePrismaError,
} from "../helpers/errors";
import { parseNumber } from "../general";

export async function createUser(data: CreateUserData) {
  try {
    // Validations
    if (!validateUserId(data.id)) {
      throw new ValidationError("ID must be exactly 4 letters");
    }

    if (!validatePassword(data.password)) {
      throw new ValidationError("Password must be exactly 8 characters");
    }

    if (data.email && !validateEmail(data.email)) {
      throw new ValidationError("Invalid email format");
    }

    console.log("existance");

    // Vérifier l'existence
    const existingUser = await prisma.user.findUnique({
      where: { id: data.id },
    });

    if (existingUser) {
      throw new ConflictError("User with this ID already exists");
    }

    // Vérifier le service
    const service = await prisma.service.findUnique({
      // @ts-expect-error
      where: { id: parseNumber(data.serviceId) },
    });

    if (!service) {
      throw new NotFoundError("Service");
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(data.password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        id: data.id.toUpperCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        serviceId: Number(data.serviceId),
      },
      include: {
        service: true,
      },
    });

    // Retourner sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      service: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getAllUsers(params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      where: { isActive: true },
      include: {
        service: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  const usersWithoutPassword = users.map(({ password, ...user }) => user);

  return calculatePagination(usersWithoutPassword, total, page, limit);
}

export async function updateUser(id: string, data: UpdateUserData) {
  try {
    // Vérifier l'existence
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("User");
    }

    // Validations
    if (data.email && !validateEmail(data.email)) {
      throw new ValidationError("Invalid email format");
    }

    if (data.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
      });

      if (!service) {
        throw new NotFoundError("Service");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: {
        service: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  // Soft delete
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: "User deleted successfully" };
}

export async function searchUsers(
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
      { id: { contains: query, mode: "insensitive" as const } },
      { email: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        service: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const usersWithoutPassword = users.map(({ password, ...user }) => user);

  return calculatePagination(usersWithoutPassword, total, page, limit);
}
