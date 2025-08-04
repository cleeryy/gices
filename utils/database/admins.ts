import { prisma } from "@/db/prisma";
import { hashPassword, comparePassword } from "../auth/password";
import { PaginationParams } from "../types/api";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  handlePrismaError,
} from "../helpers/errors";

export interface CreateAdminData {
  username: string;
  password: string;
}

export interface UpdateAdminData {
  username?: string;
  password?: string;
  isActive?: boolean;
}

export interface LoginAdminData {
  username: string;
  password: string;
}

export async function createAdmin(data: CreateAdminData) {
  try {
    // Vérifier l'unicité du username
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: data.username },
    });

    if (existingAdmin) {
      throw new ConflictError("Username already exists");
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(data.password);

    const admin = await prisma.admin.create({
      data: {
        username: data.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas retourner le mot de passe
      },
    });

    return admin;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getAdminById(id: number) {
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Ne pas retourner le mot de passe
    },
  });

  if (!admin) {
    throw new NotFoundError("Admin");
  }

  return admin;
}

export async function getAllAdmins(params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      skip,
      take,
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas retourner le mot de passe
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.admin.count({ where: { isActive: true } }),
  ]);

  return calculatePagination(admins, total, page, limit);
}

export async function updateAdmin(id: number, data: UpdateAdminData) {
  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      throw new NotFoundError("Admin");
    }

    // Vérifier l'unicité du username si modifié
    if (data.username && data.username !== existingAdmin.username) {
      const usernameExists = await prisma.admin.findUnique({
        where: { username: data.username },
      });

      if (usernameExists) {
        throw new ConflictError("Username already exists");
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (data.username) {
      updateData.username = data.username;
    }

    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas retourner le mot de passe
      },
    });

    return updatedAdmin;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteAdmin(id: number) {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!admin) {
    throw new NotFoundError("Admin");
  }

  // Soft delete pour préserver l'historique
  await prisma.admin.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: "Admin deleted successfully" };
}

export async function loginAdmin(data: LoginAdminData) {
  try {
    // Récupérer l'admin avec le mot de passe
    const admin = await prisma.admin.findUnique({
      where: {
        username: data.username,
        isActive: true,
      },
    });

    if (!admin) {
      throw new ValidationError("Invalid username or password");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(
      data.password,
      admin.password
    );

    if (!isPasswordValid) {
      throw new ValidationError("Invalid username or password");
    }

    // Retourner l'admin sans le mot de passe
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function changeAdminPassword(
  id: number,
  oldPassword: string,
  newPassword: string
) {
  try {
    // Récupérer l'admin avec le mot de passe
    const admin = await prisma.admin.findUnique({
      where: { id, isActive: true },
    });

    if (!admin) {
      throw new NotFoundError("Admin");
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await comparePassword(
      oldPassword,
      admin.password
    );

    if (!isOldPasswordValid) {
      throw new ValidationError("Invalid current password");
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.admin.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: "Password changed successfully" };
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function searchAdmins(
  query: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const whereClause = {
    isActive: true,
    username: { contains: query, mode: "insensitive" as const },
  };

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      where: whereClause,
      skip,
      take,
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas retourner le mot de passe
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.admin.count({ where: whereClause }),
  ]);

  return calculatePagination(admins, total, page, limit);
}
