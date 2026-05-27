import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const usersData = [
    { email: "admin@depaul.edu", password: "admin123", firstName: "System", lastName: "Admin", role: "ADMIN" },
    { email: "student1@depaul.edu", password: "student123", firstName: "Maya", lastName: "Johnson", role: "STUDENT" },
    { email: "student2@depaul.edu", password: "student123", firstName: "Carlos", lastName: "Rivera", role: "STUDENT" },
    { email: "student3@depaul.edu", password: "student123", firstName: "Priya", lastName: "Patel", role: "STUDENT" },
    { email: "robotics@depaul.edu", password: "org123", firstName: "Jordan", lastName: "Chen", role: "ORG" },
    { email: "csclub@depaul.edu", password: "org123", firstName: "Alex", lastName: "Kim", role: "ORG" },
    { email: "sga@depaul.edu", password: "org123", firstName: "Sam", lastName: "Torres", role: "ORG" },
  ];

  console.log("Creating users...");
  const createdUsers = {};
  for (const u of usersData) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, firstName: u.firstName, lastName: u.lastName, role: u.role },
      create: { email: u.email, passwordHash, firstName: u.firstName, lastName: u.lastName, role: u.role },
    });
    createdUsers[u.email] = user;
    console.log(`  ✓ ${u.email} (${u.role})`);
  }

  console.log("Creating orgs...");
  const orgsData = [
    { orgName: "DePaul Robotics Club", orgType: "STUDENT_ORG", contactEmail: "robotics@depaul.edu", verificationStatus: "VERIFIED" },
    { orgName: "CS Student Association", orgType: "STUDENT_ORG", contactEmail: "csclub@depaul.edu", verificationStatus: "VERIFIED" },
    { orgName: "Student Government Association", orgType: "UNIV_DEPT", contactEmail: "sga@depaul.edu", verificationStatus: "PENDING" },
  ];

  const createdOrgs = {};
  for (const o of orgsData) {
    const existing = await prisma.studentOrg.findFirst({ where: { contactEmail: o.contactEmail } });
    const org = existing
      ? await prisma.studentOrg.update({ where: { id: existing.id }, data: { orgName: o.orgName, orgType: o.orgType, verificationStatus: o.verificationStatus } })
      : await prisma.studentOrg.create({ data: { orgName: o.orgName, orgType: o.orgType, contactEmail: o.contactEmail, verificationStatus: o.verificationStatus } });
    createdOrgs[o.contactEmail] = org;
    console.log(`  ✓ ${o.orgName} (${o.verificationStatus})`);
  }

  console.log("Creating org memberships...");
  for (const [email, org] of Object.entries(createdOrgs)) {
    const user = createdUsers[email];
    if (user) {
      await prisma.orgMembership.upsert({
        where: { userId_orgId: { userId: user.id, orgId: org.id } },
        update: {},
        create: { userId: user.id, orgId: org.id, roleInOrg: "owner" },
      });
    }
  }

  const roboticsOrg = createdOrgs["robotics@depaul.edu"];
  const csOrg = createdOrgs["csclub@depaul.edu"];
  const sgaOrg = createdOrgs["sga@depaul.edu"];
  const roboticsUser = createdUsers["robotics@depaul.edu"];
  const csUser = createdUsers["csclub@depaul.edu"];
  const sgaUser = createdUsers["sga@depaul.edu"];
  const student1 = createdUsers["student1@depaul.edu"];
  const admin = createdUsers["admin@depaul.edu"];

  console.log("Creating listings...");
  await prisma.listing.deleteMany({});

  const l1 = await prisma.listing.create({
    data: {
      postedByUserId: roboticsUser.id, postedByOrgId: roboticsOrg.id,
      title: "Free Celsius Energy Drinks — DPC Lobby",
      description: "The Robotics Club is giving away 50 Celsius energy drinks at the DePaul Center lobby. Come grab one while supplies last! Tropical Vibe and Orange flavor available.",
      buildingName: "DePaul Center", roomOrFloor: "Main Lobby, 1st Floor",
      category: "DRINKS", startTime: now, endTime: in2h, status: "ACTIVE",
    },
  });

  const l2 = await prisma.listing.create({
    data: {
      postedByUserId: csUser.id, postedByOrgId: csOrg.id,
      title: "Free DePaul Merch — Hoodies & T-Shirts",
      description: "CS Student Association has leftover merch from the Fall semester. Hoodies (S, M, L) and t-shirts (all sizes) available. First come, first served.",
      buildingName: "Schmitt Academic Center", roomOrFloor: "Room 154",
      category: "APPAREL", startTime: now, endTime: in3h, status: "ACTIVE",
    },
  });

  await prisma.listing.create({
    data: {
      postedByUserId: sgaUser.id, postedByOrgId: sgaOrg.id,
      title: "Free Pizza After General Meeting",
      description: "Leftover Giordano's deep dish from our general meeting. 4 large pizzas — cheese and pepperoni. Come to room 406 in CDM after 6pm.",
      buildingName: "CDM (College of Computing)", roomOrFloor: "Room 406",
      category: "FOOD", startTime: now, endTime: in6h, status: "PENDING",
    },
  });

  await prisma.listing.create({
    data: {
      postedByUserId: roboticsUser.id, postedByOrgId: roboticsOrg.id,
      title: "Free Notebooks and School Supplies",
      description: "The Robotics Club has extra spiral notebooks, pens, highlighters, and folders from our supply order. Stop by and grab what you need.",
      buildingName: "Lewis Center", roomOrFloor: "Room 1403",
      category: "SUPPLIES", startTime: now, endTime: in6h, status: "PENDING",
    },
  });

  await prisma.listing.create({
    data: {
      postedByUserId: csUser.id, postedByOrgId: csOrg.id,
      title: "Free Starbucks Coffee Samples",
      description: "Expired event — free Starbucks cold brew samples from last week's orientation event.",
      buildingName: "Student Center", roomOrFloor: "Atrium",
      category: "DRINKS", startTime: lastWeek, endTime: yesterday, status: "EXPIRED",
    },
  });

  await prisma.listing.create({
    data: {
      postedByUserId: sgaUser.id, postedByOrgId: sgaOrg.id,
      title: "Suspicious Giveaway Test Post",
      description: "This listing was removed by admin for violating platform policy.",
      buildingName: "Unknown", roomOrFloor: "Unknown",
      category: "OTHER", startTime: lastWeek, endTime: yesterday, status: "REMOVED",
    },
  });

  console.log("  ✓ 6 listings created");

  console.log("Creating saved listings for student1...");
  await prisma.savedListing.deleteMany({ where: { userId: student1.id } });
  await prisma.savedListing.create({ data: { userId: student1.id, listingId: l1.id } });
  await prisma.listing.update({ where: { id: l1.id }, data: { saveCount: 1 } });
  await prisma.savedListing.create({ data: { userId: student1.id, listingId: l2.id } });
  await prisma.listing.update({ where: { id: l2.id }, data: { saveCount: 1 } });

  console.log("Creating notifications...");
  await prisma.notification.deleteMany({ where: { userId: { in: [student1.id, admin.id] } } });
  await prisma.notification.createMany({
    data: [
      { userId: student1.id, listingId: l1.id, notificationType: "NEW_LISTING", message: "New free items available: Free Celsius Energy Drinks — DPC Lobby at DePaul Center", channel: "IN_APP" },
      { userId: student1.id, listingId: l2.id, notificationType: "NEW_LISTING", message: "New free items available: Free DePaul Merch — Hoodies & T-Shirts at Schmitt Academic Center", channel: "IN_APP" },
      { userId: student1.id, notificationType: "LISTING_APPROVED", message: "Your listing has been approved and is now live.", channel: "IN_APP" },
      { userId: admin.id, notificationType: "NEW_LISTING", message: "New listing pending review: Free Pizza After General Meeting", channel: "IN_APP" },
    ],
  });

  console.log("\n✅ Seed complete!\n");
  console.log("┌──────────────────────────────────────────────────────────────────┐");
  console.log("│                        DEMO ACCOUNTS                            │");
  console.log("├─────────────────┬──────────────────────────┬────────────────────┤");
  console.log("│ Role            │ Email                    │ Password           │");
  console.log("├─────────────────┼──────────────────────────┼────────────────────┤");
  console.log("│ Admin           │ admin@depaul.edu          │ admin123           │");
  console.log("│ Student 1       │ student1@depaul.edu       │ student123         │");
  console.log("│ Student 2       │ student2@depaul.edu       │ student123         │");
  console.log("│ Student 3       │ student3@depaul.edu       │ student123         │");
  console.log("│ Org (Verified)  │ robotics@depaul.edu       │ org123             │");
  console.log("│ Org (Verified)  │ csclub@depaul.edu         │ org123             │");
  console.log("│ Org (Pending)   │ sga@depaul.edu            │ org123             │");
  console.log("└─────────────────┴──────────────────────────┴────────────────────┘");
  console.log("\n7 users · 3 orgs · 6 listings · 2 saved items · 4 notifications\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => { console.error("Seed failed:", err); prisma.$disconnect(); process.exit(1); });
