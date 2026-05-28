import prisma from "../../lib/prisma.js";
import { listingsService } from "../listings/listings.service.js";

// TODO: Cron job — delete notifications older than 90 days

export const engagementService = {
  async getSavedListings(userId: string) {
    const saved = await prisma.savedListing.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      include: {
        listing: {
          include: {
            postedByOrg: { select: { id: true, orgName: true, orgType: true, verificationStatus: true } },
            postedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    return saved;
  },

  async saveListing(userId: string, listingId: string) {
    const listing = await listingsService.getListingById(listingId, false);
    if (!listing) return { error: "Listing not found or is not active.", status: 404 };

    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) return { error: "You have already saved this listing.", status: 409 };

    const savedListing = await prisma.savedListing.create({ data: { userId, listingId } });
    await prisma.listing.update({ where: { id: listingId }, data: { saveCount: { increment: 1 } } });
    return { savedId: savedListing.id };
  },

  async unsaveListing(savedId: string, userId: string) {
    const saved = await prisma.savedListing.findUnique({ where: { id: savedId } });
    if (!saved) return { error: "Saved listing not found.", status: 404 };
    if (saved.userId !== userId) return { error: "Not authorized.", status: 403 };

    await prisma.savedListing.delete({ where: { id: savedId } });
    await prisma.listing.update({
      where: { id: saved.listingId },
      data: { saveCount: { decrement: 1 } },
    });
    return { message: "Listing unsaved." };
  },

  async getNotifications(userId: string, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.readAt = null;
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { sentAt: "desc" },
      include: { listing: { select: { id: true, title: true, buildingName: true } } },
    });
    const unreadCount = await prisma.notification.count({ where: { userId, readAt: null } });
    return { notifications, unreadCount };
  },

  async markRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) return { error: "Notification not found.", status: 404 };
    if (notification.userId !== userId) return { error: "Not authorized.", status: 403 };

    await prisma.notification.update({ where: { id: notificationId }, data: { readAt: new Date() } });
    return { message: "Notification marked as read." };
  },

  async markAllRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: "All notifications marked as read.", count: result.count };
  },

  async getStats() {
    const [
      totalActiveListings,
      totalPendingListings,
      pendingOrgs,
      usersByRole,
      totalSaves,
      topByViews,
      topBySaves,
      byCategory,
      recentListings,
    ] = await Promise.all([
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.studentOrg.count({ where: { verificationStatus: "PENDING" } }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
      prisma.savedListing.count(),
      prisma.listing.findMany({ orderBy: { viewCount: "desc" }, take: 5, select: { id: true, title: true, viewCount: true } }),
      prisma.listing.findMany({ orderBy: { saveCount: "desc" }, take: 5, select: { id: true, title: true, saveCount: true } }),
      prisma.listing.groupBy({ by: ["category"], _count: { category: true } }),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" }, take: 10,
        select: {
          id: true, title: true, status: true, category: true, buildingName: true, createdAt: true,
          postedByOrg: { select: { orgName: true } },
        },
      }),
    ]);

    const roleMap = usersByRole.reduce((acc, r) => {
      acc[r.role] = r._count.role;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = {
      total: (roleMap["STUDENT"] ?? 0) + (roleMap["ORG"] ?? 0) + (roleMap["ADMIN"] ?? 0),
      students: roleMap["STUDENT"] ?? 0,
      orgs: roleMap["ORG"] ?? 0,
      admins: roleMap["ADMIN"] ?? 0,
    };

    const listingsByCategory = byCategory.reduce((acc, r) => {
      acc[r.category] = r._count.category;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActiveListings,
      totalPendingListings,
      pendingOrgs,
      totalUsers,
      totalSaves,
      topListingsByViews: topByViews,
      topListingsBySaves: topBySaves,
      listingsByCategory,
      recentListings,
    };
  },
};
