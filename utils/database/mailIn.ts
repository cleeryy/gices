import { prisma } from "@/db/prisma";
import {
  CreateMailInData,
  PaginationParams,
  ServiceDestination,
} from "../types/api";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "../helpers/errors";

// Types d'API
export interface UpdateMailInData {
  date?: Date;
  subject?: string;
  needsMayor?: boolean;
  needsDgs?: boolean;
  serviceDestinations?: ServiceDestination[]; // { serviceId: number; type: 'INFO' | 'SUIVI'; }
  councilIds?: number[];
  contactIds?: number[];
}

// In your mailIn service file
export interface MailInFilters {
  needsMayor?: boolean;
  needsDgs?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  serviceIds?: number[];
  contactIds?: number[]; // Add this line
  destinationType?: "INFO" | "SUIVI";
}

export async function createMailIn(data: CreateMailInData) {
  try {
    // Validation services
    if (data.serviceDestinations && data.serviceDestinations.length > 0) {
      const serviceIds = data.serviceDestinations.map((sd) => sd.serviceId);
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds }, isActive: true },
      });
      if (services.length !== serviceIds.length) {
        const missing = serviceIds.filter(
          (id) => !services.some((s) => s.id === id)
        );
        throw new ValidationError(
          `Services inexistants: ${missing.join(", ")}`
        );
      }
    }
    // Validation conseillers
    if (data.councilIds && data.councilIds.length > 0) {
      const councils = await prisma.council.findMany({
        where: { id: { in: data.councilIds }, isActive: true },
      });
      if (councils.length !== data.councilIds.length) {
        const missing = data.councilIds.filter(
          (id) => !councils.some((c) => c.id === id)
        );
        throw new ValidationError(
          `Conseillers inexistants: ${missing.join(", ")}`
        );
      }
    }
    // Validation contacts
    if (data.contactIds && data.contactIds.length > 0) {
      const contacts = await prisma.contactIn.findMany({
        where: { id: { in: data.contactIds }, isActive: true },
      });
      if (contacts.length !== data.contactIds.length) {
        const missing = data.contactIds.filter(
          (id) => !contacts.some((c) => c.id === id)
        );
        throw new ValidationError(
          `Contacts entrants inexistants: ${missing.join(", ")}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Créer mailIn
      const mailIn = await tx.mailIn.create({
        data: {
          date: data.date,
          subject: data.subject,
          needsMayor: data.needsMayor || false,
          needsDgs: data.needsDgs || false,
        },
      });

      // Relations services avec le type
      if (data.serviceDestinations && data.serviceDestinations.length > 0) {
        await tx.serviceReceivedMail.createMany({
          data: data.serviceDestinations.map(({ serviceId, type }) => ({
            serviceId,
            mailInId: mailIn.id,
            type: type as any,
          })),
        });
      }
      // Relations conseillers
      if (data.councilIds && data.councilIds.length > 0) {
        await tx.mailCopy.createMany({
          data: data.councilIds.map((councilId) => ({
            councilId,
            mailInId: mailIn.id,
          })),
        });
      }
      // Relations contacts
      if (data.contactIds && data.contactIds.length > 0) {
        await tx.mailInRecipient.createMany({
          data: data.contactIds.map((contactId) => ({
            contactId,
            mailInId: mailIn.id,
          })),
        });
      }
      return mailIn;
    });

    // Récupérer le courrier avec toutes ses relations créées
    return await getMailInById(result.id);
  } catch (error: any) {
    console.error("Erreur détaillée createMailIn:", {
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

export async function getMailInById(id: number) {
  const mailIn = await prisma.mailIn.findUnique({
    where: { id },
    include: {
      services: {
        select: {
          serviceId: true,
          mailInId: true,
          createdAt: true,
          type: true,
          service: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      copies: {
        include: {
          council: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
            },
          },
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
      userReceivedMails: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!mailIn) {
    throw new NotFoundError("Mail");
  }

  return mailIn;
}

export async function getAllMailIn(
  params: PaginationParams = {},
  filters: MailInFilters = {},
  query?: string | null
) {
  const { page = 1, limit = 1000 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const whereClause: any = {};

  if (query) {
    whereClause.subject = { contains: query, mode: "insensitive" as const };
  }
  if (filters.needsMayor !== undefined) {
    whereClause.needsMayor = filters.needsMayor;
  }
  if (filters.needsDgs !== undefined) {
    whereClause.needsDgs = filters.needsDgs;
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
  if (filters.serviceIds && filters.serviceIds.length > 0) {
    whereClause.services = {
      some: {
        serviceId: { in: filters.serviceIds },
        ...(filters.destinationType && { type: filters.destinationType }),
      },
    };
  } else if (filters.destinationType) {
    whereClause.services = {
      some: { type: filters.destinationType },
    };
  }

  // Contact filtering (expediteurs)
  if (filters.contactIds && filters.contactIds.length > 0) {
    whereClause.recipients = {
      some: {
        contactId: { in: filters.contactIds },
      },
    };
  }

  // Rest of your function remains the same...
  const [mailsIn, total] = await Promise.all([
    prisma.mailIn.findMany({
      skip,
      take,
      where: whereClause,
      include: {
        services: {
          select: {
            serviceId: true,
            mailInId: true,
            createdAt: true,
            type: true,
            service: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        copies: {
          include: {
            council: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
              },
            },
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
        _count: {
          select: {
            copies: true,
            recipients: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    }),
    prisma.mailIn.count({ where: whereClause }),
  ]);

  return calculatePagination(mailsIn, total, page, limit);
}

export async function updateMailIn(id: number, data: UpdateMailInData) {
  try {
    const existingMail = await prisma.mailIn.findUnique({
      where: { id },
    });
    if (!existingMail) {
      throw new NotFoundError("Mail");
    }

    // Validation services
    if (data.serviceDestinations && data.serviceDestinations.length > 0) {
      const serviceIds = data.serviceDestinations.map((sd) => sd.serviceId);
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds }, isActive: true },
      });
      if (services.length !== serviceIds.length) {
        const missing = serviceIds.filter(
          (id) => !services.some((s) => s.id === id)
        );
        throw new ValidationError(
          `Services inexistants: ${missing.join(", ")}`
        );
      }
    }
    if (data.councilIds && data.councilIds.length > 0) {
      const councils = await prisma.council.findMany({
        where: { id: { in: data.councilIds }, isActive: true },
      });
      if (councils.length !== data.councilIds.length) {
        const missing = data.councilIds.filter(
          (id) => !councils.some((c) => c.id === id)
        );
        throw new ValidationError(
          `Conseillers inexistants: ${missing.join(", ")}`
        );
      }
    }
    if (data.contactIds && data.contactIds.length > 0) {
      const contacts = await prisma.contactIn.findMany({
        where: { id: { in: data.contactIds }, isActive: true },
      });
      if (contacts.length !== data.contactIds.length) {
        const missing = data.contactIds.filter(
          (id) => !contacts.some((c) => c.id === id)
        );
        throw new ValidationError(
          `Contacts entrants inexistants: ${missing.join(", ")}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Mise à jour direct du mail
      const { serviceDestinations, councilIds, contactIds, ...mailData } = data;
      const updatedMail = await tx.mailIn.update({
        where: { id },
        data: mailData,
      });

      // Relations services avec type
      if (serviceDestinations !== undefined) {
        await tx.serviceReceivedMail.deleteMany({
          where: { mailInId: id },
        });
        if (serviceDestinations.length > 0) {
          await tx.serviceReceivedMail.createMany({
            data: serviceDestinations.map(({ serviceId, type }) => ({
              serviceId,
              mailInId: id,
              type: type as any,
            })),
          });
        }
      }
      // Relations conseil
      if (councilIds !== undefined) {
        await tx.mailCopy.deleteMany({
          where: { mailInId: id },
        });
        if (councilIds.length > 0) {
          await tx.mailCopy.createMany({
            data: councilIds.map((councilId) => ({
              councilId,
              mailInId: id,
            })),
          });
        }
      }
      // Relations contacts
      if (contactIds !== undefined) {
        await tx.mailInRecipient.deleteMany({
          where: { mailInId: id },
        });
        if (contactIds.length > 0) {
          await tx.mailInRecipient.createMany({
            data: contactIds.map((contactId) => ({
              contactId,
              mailInId: id,
            })),
          });
        }
      }
      return updatedMail;
    });

    return await getMailInById(result.id);
  } catch (error: any) {
    console.error("Erreur détaillée updateMailIn:", {
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

export async function deleteMailIn(id: number) {
  const mailIn = await prisma.mailIn.findUnique({
    where: { id },
  });

  if (!mailIn) {
    throw new NotFoundError("Mail");
  }

  await prisma.$transaction([
    prisma.mailCopy.deleteMany({ where: { mailInId: id } }),
    prisma.serviceReceivedMail.deleteMany({ where: { mailInId: id } }),
    prisma.mailInRecipient.deleteMany({ where: { mailInId: id } }),
    prisma.userReceivedMail.deleteMany({ where: { mailInId: id } }),
    prisma.mailIn.delete({ where: { id } }),
  ]);

  return { message: "Mail deleted successfully" };
}

export async function markAsRead(mailInId: number, userId: string) {
  try {
    await prisma.userReceivedMail.updateMany({
      where: {
        mailInId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
    return { message: "Mail marked as read" };
  } catch (error: any) {
    throw handlePrismaError(error);
  }
}
