import { prisma } from "@/db/prisma";
import { PaginationParams } from "../types/api";
import { getPrismaSkipTake, calculatePagination } from "../helpers/pagination";
import {
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "../helpers/errors";

export interface CreateContactInData {
  name: string;
}

export interface CreateContactOutData {
  name: string;
}

export interface UpdateContactData {
  name?: string;
  isActive?: boolean;
}

// === CONTACTS ENTRANTS ===

export async function createContactIn(data: CreateContactInData) {
  try {
    const contact = await prisma.contactIn.create({
      data,
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
    });

    return contact;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getContactInById(id: number) {
  const contact = await prisma.contactIn.findUnique({
    where: { id },
    include: {
      mailsReceived: {
        include: {
          mailIn: {
            select: {
              id: true,
              date: true,
              subject: true,
            },
          },
        },
        orderBy: { mailIn: { date: "desc" } },
        take: 10, // Derniers 10 courriers
      },
      _count: {
        select: {
          mailsReceived: true,
        },
      },
    },
  });

  if (!contact) {
    throw new NotFoundError("Contact");
  }

  return contact;
}

export async function getAllContactsIn(params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [contacts, total] = await Promise.all([
    prisma.contactIn.findMany({
      skip,
      take,
      where: { isActive: true },
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.contactIn.count({ where: { isActive: true } }),
  ]);

  return calculatePagination(contacts, total, page, limit);
}

export async function updateContactIn(id: number, data: UpdateContactData) {
  try {
    const existingContact = await prisma.contactIn.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError("Contact");
    }

    const updatedContact = await prisma.contactIn.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
    });

    return updatedContact;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteContactIn(id: number) {
  const contact = await prisma.contactIn.findUnique({
    where: { id },
    include: {
      _count: {
        select: { mailsReceived: true },
      },
    },
  });

  if (!contact) {
    throw new NotFoundError("Contact");
  }

  if (contact._count.mailsReceived > 0) {
    // Soft delete si associé à des courriers
    await prisma.contactIn.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    // Hard delete si pas de courriers associés
    await prisma.contactIn.delete({
      where: { id },
    });
  }

  return { message: "Contact deleted successfully" };
}

export async function searchContactsIn(
  query: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const whereClause = {
    isActive: true,
    name: { contains: query, mode: "insensitive" as const },
  };

  const [contacts, total] = await Promise.all([
    prisma.contactIn.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.contactIn.count({ where: whereClause }),
  ]);

  return calculatePagination(contacts, total, page, limit);
}

// === CONTACTS SORTANTS ===

export async function createContactOut(data: CreateContactOutData) {
  try {
    const contact = await prisma.contactOut.create({
      data,
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
    });

    return contact;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function getContactOutById(id: number) {
  const contact = await prisma.contactOut.findUnique({
    where: { id },
    include: {
      mailsReceived: {
        include: {
          mailOut: {
            select: {
              id: true,
              date: true,
              subject: true,
              reference: true,
            },
          },
        },
        orderBy: { mailOut: { date: "desc" } },
        take: 10, // Derniers 10 courriers
      },
      _count: {
        select: {
          mailsReceived: true,
        },
      },
    },
  });

  if (!contact) {
    throw new NotFoundError("Contact");
  }

  return contact;
}

export async function getAllContactsOut(params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const [contacts, total] = await Promise.all([
    prisma.contactOut.findMany({
      skip,
      take,
      where: { isActive: true },
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.contactOut.count({ where: { isActive: true } }),
  ]);

  return calculatePagination(contacts, total, page, limit);
}

export async function updateContactOut(id: number, data: UpdateContactData) {
  try {
    const existingContact = await prisma.contactOut.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError("Contact");
    }

    const updatedContact = await prisma.contactOut.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
    });

    return updatedContact;
  } catch (error: any) {
    if (error.code) {
      throw handlePrismaError(error);
    }
    throw error;
  }
}

export async function deleteContactOut(id: number) {
  const contact = await prisma.contactOut.findUnique({
    where: { id },
    include: {
      _count: {
        select: { mailsReceived: true },
      },
    },
  });

  if (!contact) {
    throw new NotFoundError("Contact");
  }

  if (contact._count.mailsReceived > 0) {
    // Soft delete si associé à des courriers
    await prisma.contactOut.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    // Hard delete si pas de courriers associés
    await prisma.contactOut.delete({
      where: { id },
    });
  }

  return { message: "Contact deleted successfully" };
}

export async function searchContactsOut(
  query: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  const { skip, take } = getPrismaSkipTake(page, limit);

  const whereClause = {
    isActive: true,
    name: { contains: query, mode: "insensitive" as const },
  };

  const [contacts, total] = await Promise.all([
    prisma.contactOut.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        _count: {
          select: {
            mailsReceived: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.contactOut.count({ where: whereClause }),
  ]);

  return calculatePagination(contacts, total, page, limit);
}
