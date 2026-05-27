import prisma from "../../lib/prisma.js";

const orgSelect = {
  id: true,
  orgName: true,
  orgType: true,
  contactEmail: true,
  verificationStatus: true,
  createdAt: true,
  _count: { select: { listings: true, memberships: true } },
};

export const orgsService = {
  async getAllOrgs() {
    return prisma.studentOrg.findMany({
      select: orgSelect,
      orderBy: [{ verificationStatus: "asc" }, { createdAt: "asc" }],
    });
  },

  async updateOrgVerificationStatus(id: string, status: string) {
    return prisma.studentOrg.update({
      where: { id },
      data: { verificationStatus: status as any },
      select: orgSelect,
    });
  },

  async getOrgById(id: string) {
    return prisma.studentOrg.findUnique({ where: { id }, select: orgSelect });
  },
};
