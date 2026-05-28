import prisma from "../../lib/prisma.js";

// TODO: Cron job — auto-expire listings where endTime < now() every 5 minutes
// TODO: Cron job — delete listings with status EXPIRED or REMOVED that are older than 30 days

const listingSelect = {
  id: true, title: true, description: true, posterImageUrl: true,
  buildingName: true, roomOrFloor: true, category: true,
  startTime: true, endTime: true, status: true,
  viewCount: true, saveCount: true, createdAt: true, updatedAt: true,
  postedByUserId: true, postedByOrgId: true,
  postedByOrg: { select: { id: true, orgName: true, orgType: true, verificationStatus: true } },
  postedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export const listingsService = {
  async getActiveListings(params: {
    category?: string; building?: string; search?: string; page?: number; limit?: number;
  }) {
    const { category, building, search, page = 1, limit = 12 } = params;
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;
    const now = new Date();

    const where: any = { status: "ACTIVE" };
    if (category) where.category = category;
    if (building) where.buildingName = { contains: building, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({ where, select: listingSelect, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.listing.count({ where }),
    ]);

    return { listings, total, page, totalPages: Math.ceil(total / take) };
  },

  async getListingById(id: string, includeNonActive = false) {
    const listing = await prisma.listing.findUnique({ where: { id }, select: listingSelect });
    if (!listing) return null;
    if (!includeNonActive && listing.status !== "ACTIVE") return null;
    return listing;
  },

  async getListingByIdAdmin(id: string) {
    return prisma.listing.findUnique({ where: { id }, select: listingSelect });
  },

  async createListing(data: {
    postedByUserId: string; postedByOrgId: string;
    title: string; description: string; posterImageUrl?: string;
    buildingName: string; roomOrFloor: string; category: string;
    startTime: string; endTime: string;
  }) {
    return prisma.listing.create({
      data: {
        postedByUserId: data.postedByUserId,
        postedByOrgId: data.postedByOrgId,
        title: data.title,
        description: data.description,
        posterImageUrl: data.posterImageUrl || null,
        buildingName: data.buildingName,
        roomOrFloor: data.roomOrFloor,
        category: data.category as any,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: "PENDING",
      },
      select: listingSelect,
    });
  },

  async updateListing(id: string, data: Partial<{
    title: string; description: string; posterImageUrl: string;
    buildingName: string; roomOrFloor: string; category: string;
    startTime: string; endTime: string;
  }>) {
    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.category) updateData.category = data.category;
    return prisma.listing.update({ where: { id }, data: updateData, select: listingSelect });
  },

  async updateListingStatus(id: string, status: string) {
    return prisma.listing.update({ where: { id }, data: { status: status as any }, select: listingSelect });
  },

  async getPendingListings() {
    return prisma.listing.findMany({
      where: { status: "PENDING" },
      select: listingSelect,
      orderBy: { createdAt: "asc" },
    });
  },

  async getAllListingsAdmin(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;
    const where: any = {};
    if (status) where.status = status;
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({ where, select: listingSelect, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.listing.count({ where }),
    ]);
    return { listings, total, page, totalPages: Math.ceil(total / take) };
  },

  async getMineListings(orgId: string) {
    return prisma.listing.findMany({
      where: { postedByOrgId: orgId },
      select: listingSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async incrementViewCount(id: string) {
    await prisma.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  },
};
