import { prisma } from "@/db/prisma";
import { CreateMailOutData, PaginationParams } from "../types/api";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "../helpers/errors";

export interface UpdateMailOutData {
  date?: Date;
  subject?: string;
  reference?: string;
  // 🔥 AJOUT : Gestion des relations pour l'update
  serviceId?: number;
  userId?: string;
  contactIds?: number[];
}

export interface MailOutFilters {
  serviceId?: number;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function createMailOut(data: CreateMailOutData) {
  try {
    // Vérifier que le service existe
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new NotFoundError("Service");
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // 🔥 AJOUT : Validation des contacts sortants si fournis
    if (data.contactIds && data.contactIds.length > 0) {
      const contacts = await prisma.contactOut.findMany({
        where: { id: { in: data.contactIds }, isActive: true },
      });
      if (contacts.length !== data.contactIds.length) {
        const missing = data.contactIds.filter(
          (id) => !contacts.some((c) => c.id === id)
        );
        throw new ValidationError(
          `Contacts sortants inexistants: ${missing.join(
            ", "
          )}. Créez-les d'abord !`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Créer le courrier sortant
      const mailOut = await tx.mailOut.create({
        data: {
          date: data.date,
          subject: data.subject,
          reference: data.reference,
          serviceId: data.serviceId,
          userId: data.userId,
        },
      });

      // Associer aux contacts si fournis
      if (data.contactIds && data.contactIds.length > 0) {
        await tx.mailOutRecipient.createMany({
          data: data.contactIds.map((contactId) => ({
            contactId,
            mailOutId: mailOut.id,
          })),
        });
      }

      return mailOut;
    });

    // Récupérer le courrier avec toutes ses relations
    return await getMailOutById(result.id);
  } catch (error: any) {
    // 🔥 AJOUT : Logs détaillés pour le debug
    console.error("Erreur détaillée createMailOut:", {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getMailOutById(id: number) {
  const mailOut = await prisma.mailOut.findUnique({
    where: { id },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      recipients: {
        include: {
          contact: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!mailOut) {
    throw new NotFoundError("Mail");
  }

  return mailOut;
}

export async function getAllMailOut(
  params: PaginationParams = {},
  filters: MailOutFilters = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  // Construire le where clause
  const whereClause: any = {};

  if (filters.serviceId) {
    whereClause.serviceId = filters.serviceId;
  }

  if (filters.userId) {
    whereClause.userId = filters.userId;
  }

  if (filters.dateFrom || filters.dateTo) {
    whereClause.date = {};
    if (filters.dateFrom) {
      whereClause.date.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      whereClause.date.lte = filters.dateTo;
    }
  }

  const [mailsOut, total] = await Promise.all([
    prisma.mailOut.findMany({
      skip,
      take,
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.mailOut.count({ where: whereClause }),
  ]);

  return calculatePagination(mailsOut, total, page, limit);
}

// 🔥 FONCTION UPDATEmailout COMPLÈTEMENT REFAITE
export async function updateMailOut(id: number, data: UpdateMailOutData) {
  try {
    const existingMail = await prisma.mailOut.findUnique({
      where: { id },
    });

    if (!existingMail) {
      throw new NotFoundError("Mail");
    }

    // 🔥 VALIDATION DES RELATIONS si elles sont fournies
    if (data.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId, isActive: true },
      });
      if (!service) {
        throw new ValidationError(`Service inexistant: ${data.serviceId}`);
      }
    }

    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId, isActive: true },
      });
      if (!user) {
        throw new ValidationError(`Utilisateur inexistant: ${data.userId}`);
      }
    }

    if (data.contactIds && data.contactIds.length > 0) {
      const contacts = await prisma.contactOut.findMany({
        where: { id: { in: data.contactIds }, isActive: true },
      });
      if (contacts.length !== data.contactIds.length) {
        const missing = data.contactIds.filter(
          (id) => !contacts.some((c) => c.id === id)
        );
        throw new ValidationError(
          `Contacts sortants inexistants: ${missing.join(", ")}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les champs directs du courrier
      const { contactIds, ...mailData } = data;

      const updatedMail = await tx.mailOut.update({
        where: { id },
        data: mailData, // Seulement les champs directs (date, subject, reference, serviceId, userId)
      });

      // 2. Gérer les relations contacts
      if (contactIds !== undefined) {
        // Supprimer les anciennes relations
        await tx.mailOutRecipient.deleteMany({
          where: { mailOutId: id },
        });

        // Créer les nouvelles relations
        if (contactIds.length > 0) {
          await tx.mailOutRecipient.createMany({
            data: contactIds.map((contactId) => ({
              contactId,
              mailOutId: id,
            })),
          });
        }
      }

      return updatedMail;
    });

    // Récupérer le courrier avec toutes ses relations mises à jour
    return await getMailOutById(result.id);
  } catch (error: any) {
    // 🔥 AJOUT : Logs détaillés pour le debug
    console.error("Erreur détaillée updateMailOut:", {
      error: error.message,
      code: error.code,
      meta: error.meta,
    });

    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteMailOut(id: number) {
  const mailOut = await prisma.mailOut.findUnique({
    where: { id },
  });

  if (!mailOut) {
    throw new NotFoundError("Mail");
  }

  // Supprimer toutes les relations avant de supprimer le courrier
  await prisma.$transaction([
    prisma.mailOutRecipient.deleteMany({ where: { mailOutId: id } }),
    prisma.mailOut.delete({ where: { id } }),
  ]);

  return { message: "Mail deleted successfully" };
}

export async function searchMailOut(
  query: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const whereClause = {
    OR: [
      { subject: { contains: query, mode: "insensitive" as const } },
      { reference: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [mailsOut, total] = await Promise.all([
    prisma.mailOut.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.mailOut.count({ where: whereClause }),
  ]);

  return calculatePagination(mailsOut, total, page, limit);
}

export async function getMailOutByUser(
  userId: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [mailsOut, total] = await Promise.all([
    prisma.mailOut.findMany({
      where: { userId },
      skip,
      take,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.mailOut.count({ where: { userId } }),
  ]);

  return calculatePagination(mailsOut, total, page, limit);
}
