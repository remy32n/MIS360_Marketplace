import prisma from "../../lib/prisma.js";

export const identityService = {
  async verifyOrgStatus(orgId: string) {
    const org = await prisma.studentOrg.findUnique({
      where: { id: orgId },
      select: { id: true, verificationStatus: true, orgName: true },
    });
    if (!org) return null;
    return org;
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true,
        orgMemberships: {
          include: { org: true },
          take: 1,
        },
      },
    });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
};
