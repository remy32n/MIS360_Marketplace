# Free Stuff on Campus — Mobile App Build Prompt
## MIS 360 Group 4 | DePaul University | React Native + Expo | Prototype v1.0

---

# CRITICAL INSTRUCTIONS — READ BEFORE STARTING

This is a mobile app rebuild of an existing system. The following rules are ABSOLUTE and must never be violated:

1. **DO NOT CHANGE THE COLOR SCHEME.** The colors are defined in the THEME section. Use them exactly as specified. Do not introduce new colors, do not use purple gradients, do not use generic blue. The brand color is green (#16a34a). DePaul blue (#005EB8) is an accent. This must be consistent on every single screen.

2. **DO NOT REMOVE OR BREAK AUTHENTICATION.** Login and signup must work on the very first screen a user sees. Every protected screen must check auth state before rendering. Auth state must persist across navigation and app restarts using AsyncStorage.

3. **DO NOT CHANGE THE BACKEND.** The backend is Node.js/Express/Prisma/PostgreSQL and must be built exactly as specified. The mobile frontend calls this backend via HTTP.

4. **BUILD EVERY SCREEN LISTED.** Do not skip screens. Do not combine screens that are specified as separate. Do not remove functionality to simplify.

5. **ORGANIZE FILES AS SPECIFIED.** Do not put everything in App.js. Follow the file structure exactly.

---

# OVERVIEW

Build a full-stack **mobile application** called **"Free Stuff on Campus"** — a student-built, independently operated platform for DePaul University. Student organizations, university departments, and faculty/staff post free item giveaways (food, drinks, apparel, supplies, etc.) and DePaul students discover, save, and claim them on campus.

**This is a prototype for an academic class presentation.** It must be fully functional and demonstrate all core user flows. No real email sending. No real push notifications. All business logic, access controls, data structures, and UI flows must be implemented correctly.

**Three user roles with completely different mobile experiences:**
- **STUDENT** — browses listings feed, saves items, receives notifications, views details
- **ORG** — posts giveaway listings that go through admin approval, manages their own listings, can also browse
- **ADMIN** — reviews and approves/rejects pending listings, verifies org accounts, monitors activity, can also browse

---

# TECH STACK

## Mobile Frontend
- **Framework:** React Native with Expo SDK (latest stable)
- **Navigation:** React Navigation v6 — `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`
- **Styling:** React Native StyleSheet API with a central theme constants file (NOT NativeWind, NOT styled-components — plain StyleSheet for reliability)
- **Icons:** `@expo/vector-icons` (Ionicons set)
- **HTTP Client:** Axios
- **Token Storage:** `@react-native-async-storage/async-storage` (JWT stored here, sent as Bearer token)
- **Date/Time:** `dayjs` for formatting and countdowns
- **Safe Area:** `react-native-safe-area-context`
- **Gesture Handler:** `react-native-gesture-handler`
- **Toast notifications:** `react-native-toast-message`

## Backend
- **Runtime:** Node.js with Express
- **Database:** PostgreSQL (Replit built-in)
- **ORM:** Prisma
- **Auth:** JWT via `jsonwebtoken` — **read from Authorization: Bearer header** (NOT cookies — React Native uses AsyncStorage)
- **Password hashing:** bcrypt
- **Rate limiting:** express-rate-limit
- **CORS:** cors package — configured to allow all origins in development (React Native doesn't send an Origin header the same way browsers do)

## Project Structure in Replit
Both backend and mobile run in the same Replit project. Backend runs on port 3001. Mobile runs via `expo start --web` on port 19006 for browser-based demo, OR via Expo Go app on phone using the Replit tunnel URL.

---

# FILE STRUCTURE

Create the project with this exact organization. Every file serves a specific purpose.

```
/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── identity/
│   │   │   │   ├── identity.controller.js
│   │   │   │   ├── identity.service.js
│   │   │   │   └── identity.routes.js
│   │   │   ├── listings/
│   │   │   │   ├── listings.controller.js
│   │   │   │   ├── listings.service.js
│   │   │   │   └── listings.routes.js
│   │   │   └── engagement/
│   │   │       ├── engagement.controller.js
│   │   │       ├── engagement.service.js
│   │   │       └── engagement.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js         (reads Bearer token from Authorization header)
│   │   │   ├── requireAdmin.middleware.js
│   │   │   ├── requireOrg.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── utils/
│   │   │   ├── jwt.utils.js
│   │   │   └── errors.js
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── server.js
│
├── mobile/
│   ├── src/
│   │   ├── constants/
│   │   │   └── theme.js               (ALL colors, fonts, spacing, shadows)
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js                 (Axios instance + all API functions)
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useListings.js
│   │   ├── utils/
│   │   │   └── formatters.js          (time, category, status formatters)
│   │   ├── components/
│   │   │   ├── ListingCard.js
│   │   │   ├── ListingCardHorizontal.js
│   │   │   ├── CategoryPill.js
│   │   │   ├── StatusBadge.js
│   │   │   ├── CountdownTimer.js
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── EmptyState.js
│   │   │   ├── ErrorMessage.js
│   │   │   ├── ApprovalCard.js
│   │   │   ├── OrgCard.js
│   │   │   └── StatsCard.js
│   │   ├── navigation/
│   │   │   ├── RootNavigator.js       (auth gate — shows AuthStack or role tabs)
│   │   │   ├── AuthStack.js           (Login, Signup)
│   │   │   ├── StudentTabs.js         (Browse, Saved, Notifications, Profile)
│   │   │   ├── OrgTabs.js             (Browse, My Listings, Post, Notifications, Profile)
│   │   │   └── AdminTabs.js           (Pending, Browse, Activity, Orgs, Profile)
│   │   └── screens/
│   │       ├── auth/
│   │       │   ├── LoginScreen.js
│   │       │   └── SignupScreen.js
│   │       ├── shared/
│   │       │   ├── BrowseScreen.js        (all roles can browse)
│   │       │   ├── ListingDetailScreen.js (all roles, admin sees extra actions)
│   │       │   ├── NotificationsScreen.js (student and org)
│   │       │   └── ProfileScreen.js       (all roles, shows role-appropriate info)
│   │       ├── student/
│   │       │   └── SavedScreen.js
│   │       ├── org/
│   │       │   ├── MyListingsScreen.js
│   │       │   ├── CreateListingScreen.js
│   │       │   └── ListingSubmittedScreen.js
│   │       └── admin/
│   │           ├── ApprovalQueueScreen.js
│   │           ├── ActivityDashboardScreen.js
│   │           └── OrgVerificationScreen.js
│   ├── App.js                         (root: NavigationContainer, AuthProvider, Toast)
│   ├── app.json                       (Expo config)
│   └── package.json
│
├── package.json                       (root: scripts to run backend + mobile)
└── .env
```

---

# THEME CONSTANTS

Create `mobile/src/constants/theme.js` first. Every screen and component imports colors and styles from here. This is why the design stays consistent. Never hardcode a color in a screen file.

```javascript
// mobile/src/constants/theme.js
export const COLORS = {
  // Brand green — primary action color
  brand: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',   // PRIMARY — use for main buttons, active states
    700: '#15803d',
    800: '#166534',
  },

  // DePaul University blue — accent and header use
  depaul: {
    blue: '#005EB8',
    lightBlue: '#E8F3FF',
    red: '#C8102E',
  },

  // Status colors — do not deviate from these
  status: {
    active:   { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
    pending:  { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
    expired:  { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
    removed:  { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    verified: { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
    rejected: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  },

  // Category colors — one per category
  category: {
    FOOD:     { bg: '#fef3c7', emoji: '🍕', label: 'Food' },
    DRINKS:   { bg: '#dbeafe', emoji: '🥤', label: 'Drinks' },
    APPAREL:  { bg: '#f3e8ff', emoji: '👕', label: 'Apparel' },
    SUPPLIES: { bg: '#ecfdf5', emoji: '📚', label: 'Supplies' },
    OTHER:    { bg: '#f3f4f6', emoji: '🎁', label: 'Other' },
  },

  // Neutral grays
  gray: {
    50:  '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  white: '#ffffff',
  black: '#000000',

  // Backgrounds
  bg: {
    primary:   '#ffffff',
    secondary: '#f9fafb',
    card:      '#ffffff',
  },

  // Semantic
  error:   '#ef4444',
  success: '#16a34a',
  warning: '#f59e0b',
  info:    '#3b82f6',
};

export const FONTS = {
  // Use system fonts for reliability in Expo
  regular:    { fontFamily: 'System', fontWeight: '400' },
  medium:     { fontFamily: 'System', fontWeight: '500' },
  semibold:   { fontFamily: 'System', fontWeight: '600' },
  bold:       { fontFamily: 'System', fontWeight: '700' },
  heading:    { fontFamily: 'System', fontWeight: '800' },

  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
  },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Reusable component styles
export const CARD_STYLE = {
  backgroundColor: COLORS.white,
  borderRadius: RADIUS.lg,
  padding: SPACING.base,
  ...SHADOWS.sm,
  borderWidth: 1,
  borderColor: COLORS.gray[100],
};

export const INPUT_STYLE = {
  borderWidth: 1.5,
  borderColor: COLORS.gray[200],
  borderRadius: RADIUS.md,
  paddingHorizontal: SPACING.base,
  paddingVertical: SPACING.md,
  fontSize: FONTS.sizes.base,
  color: COLORS.gray[900],
  backgroundColor: COLORS.white,
};

export const BTN_PRIMARY = {
  backgroundColor: COLORS.brand[600],
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  alignItems: 'center',
  justifyContent: 'center',
};

export const BTN_SECONDARY = {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: COLORS.brand[600],
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  alignItems: 'center',
  justifyContent: 'center',
};

export const BTN_DANGER = {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: COLORS.error,
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  alignItems: 'center',
  justifyContent: 'center',
};
```

---

# DATABASE SCHEMA (Prisma — identical to web version)

`backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 String    @id @default(uuid())
  email              String    @unique
  passwordHash       String
  firstName          String
  lastName           String
  role               Role      @default(STUDENT)
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())

  orgMemberships     OrgMembership[]
  savedListings      SavedListing[]
  notifications      Notification[]
  listings           Listing[]

  @@map("users")
}

model StudentOrg {
  id                 String             @id @default(uuid())
  orgName            String
  orgType            OrgType
  contactEmail       String
  verificationStatus VerificationStatus @default(PENDING)
  verifiedAt         DateTime?
  createdAt          DateTime           @default(now())

  memberships        OrgMembership[]
  listings           Listing[]

  @@map("student_orgs")
}

model OrgMembership {
  id        String   @id @default(uuid())
  userId    String
  orgId     String
  roleInOrg String   @default("member")
  joinedAt  DateTime @default(now())

  user User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  org  StudentOrg @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([userId, orgId])
  @@map("org_memberships")
}

model Listing {
  id             String        @id @default(uuid())
  postedByUserId String
  postedByOrgId  String?
  title          String
  description    String
  posterImageUrl String?
  buildingName   String
  roomOrFloor    String
  category       Category
  startTime      DateTime
  endTime        DateTime
  status         ListingStatus @default(PENDING)
  viewCount      Int           @default(0)
  saveCount      Int           @default(0)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  postedBy    User         @relation(fields: [postedByUserId], references: [id])
  postedByOrg StudentOrg?  @relation(fields: [postedByOrgId], references: [id])
  savedBy     SavedListing[]
  notifications Notification[]

  @@map("listings")
}

model SavedListing {
  id        String   @id @default(uuid())
  userId    String
  listingId String
  savedAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@map("saved_listings")
}

model Notification {
  id               String              @id @default(uuid())
  userId           String
  listingId        String?
  notificationType NotificationType
  message          String
  channel          NotificationChannel @default(IN_APP)
  sentAt           DateTime            @default(now())
  readAt           DateTime?

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing? @relation(fields: [listingId], references: [id], onDelete: SetNull)

  @@map("notifications")
}

enum Role               { STUDENT ORG ADMIN }
enum OrgType            { STUDENT_ORG UNIV_DEPT FACULTY_STAFF }
enum VerificationStatus { PENDING VERIFIED REJECTED }
enum Category           { FOOD DRINKS APPAREL SUPPLIES OTHER }
enum ListingStatus      { PENDING APPROVED ACTIVE EXPIRED REMOVED }
enum NotificationType   { NEW_LISTING LISTING_APPROVED LISTING_REJECTED EXPIRING_SOON }
enum NotificationChannel { IN_APP EMAIL PUSH }
```

---

# SEED DATA

`backend/prisma/seed.js` — creates realistic data for all 3 roles:

```javascript
// Creates: admin, 3 students, 3 org users
// Creates: 2 verified orgs, 1 pending org
// Creates: 2 ACTIVE listings, 2 PENDING listings, 1 EXPIRED, 1 REMOVED
// Creates: 2 saved listings for student1
// Creates: 3 in-app notifications for student1

const users = [
  { email: "admin@depaul.edu",    password: "admin123",   firstName: "System",  lastName: "Admin",   role: "ADMIN" },
  { email: "student1@depaul.edu", password: "student123", firstName: "Maya",    lastName: "Johnson", role: "STUDENT" },
  { email: "student2@depaul.edu", password: "student123", firstName: "Carlos",  lastName: "Rivera",  role: "STUDENT" },
  { email: "student3@depaul.edu", password: "student123", firstName: "Priya",   lastName: "Patel",   role: "STUDENT" },
  { email: "robotics@depaul.edu", password: "org123",     firstName: "Jordan",  lastName: "Chen",    role: "ORG" },
  { email: "csclub@depaul.edu",   password: "org123",     firstName: "Alex",    lastName: "Kim",     role: "ORG" },
  { email: "sga@depaul.edu",      password: "org123",     firstName: "Sam",     lastName: "Torres",  role: "ORG" },
]

const orgs = [
  { orgName: "DePaul Robotics Club",          orgType: "STUDENT_ORG", contactEmail: "robotics@depaul.edu", verificationStatus: "VERIFIED" },
  { orgName: "CS Student Association",        orgType: "STUDENT_ORG", contactEmail: "csclub@depaul.edu",   verificationStatus: "VERIFIED" },
  { orgName: "Student Government Association",orgType: "UNIV_DEPT",   contactEmail: "sga@depaul.edu",      verificationStatus: "PENDING"  },
]

const listings = [
  {
    title: "Free Celsius Energy Drinks — DPC Lobby",
    description: "The Robotics Club is giving away 50 Celsius energy drinks. Tropical Vibe and Orange flavor available. First come first served.",
    buildingName: "DePaul Center", roomOrFloor: "Main Lobby, 1st Floor",
    category: "DRINKS", status: "ACTIVE",
    // startTime: now, endTime: now + 2 hours
  },
  {
    title: "Free DePaul Hoodies & T-Shirts",
    description: "CS Student Association has leftover merch from Fall semester. Hoodies (S, M, L) and t-shirts (all sizes). First come first served.",
    buildingName: "Schmitt Academic Center", roomOrFloor: "Room 154",
    category: "APPAREL", status: "ACTIVE",
    // startTime: now, endTime: now + 3 hours
  },
  {
    title: "Free Giordano's Pizza After General Meeting",
    description: "Leftover deep dish from our general meeting. 4 large pizzas — cheese and pepperoni. Come to room 406 in CDM after 6pm.",
    buildingName: "CDM (College of Computing)", roomOrFloor: "Room 406",
    category: "FOOD", status: "PENDING",
  },
  {
    title: "Free Notebooks and School Supplies",
    description: "Extra spiral notebooks, pens, highlighters, and folders from our supply order. Stop by and grab what you need.",
    buildingName: "Lewis Center", roomOrFloor: "Room 1403",
    category: "SUPPLIES", status: "PENDING",
  },
  {
    title: "Free Starbucks Cold Brew Samples",
    description: "Expired — free coffee samples from last week's orientation event.",
    buildingName: "Student Center", roomOrFloor: "Atrium",
    category: "DRINKS", status: "EXPIRED",
    // endTime: now - 2 days
  },
  {
    title: "Test Listing — Policy Violation",
    description: "This listing was removed by admin.",
    buildingName: "Unknown", roomOrFloor: "Unknown",
    category: "OTHER", status: "REMOVED",
  },
]
```

Hash all passwords with bcrypt (saltRounds: 10). Link each org user to their org via OrgMembership. Assign listings to the correct org users. Create 2 SavedListings for student1 (the 2 ACTIVE listings). Create 3 in-app Notifications for student1.

Print a console summary table when seeding completes.

---

# BACKEND — AUTHENTICATION (CRITICAL CHANGE FROM WEB VERSION)

## IMPORTANT: React Native uses Bearer tokens, NOT cookies

The mobile app stores the JWT in AsyncStorage and sends it as:
```
Authorization: Bearer <token>
```

Update `backend/src/middleware/auth.middleware.js` to read from the Authorization header:

```javascript
// auth.middleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireAuth = async (req, res, next) => {
  try {
    // Read from Authorization header (Bearer token — React Native)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        orgMemberships: {
          include: { org: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please log in again.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      orgId: user.orgMemberships[0]?.orgId || null,
      org: user.orgMemberships[0]?.org || null,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid session. Please log in again.' });
    }
    console.error('[Auth] Middleware error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};

module.exports = { requireAuth };
```

## Login endpoint — return token in response body (not cookie)

`POST /api/auth/login` on success:
```javascript
// Return the token in the response body so mobile can store it in AsyncStorage
res.json({
  token: jwtToken,           // The signed JWT string
  user: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  },
  org: user.orgMemberships[0]?.org || null,
});
```

Do NOT set cookies. The token goes in the response body.

## CORS for React Native

```javascript
// app.js
const cors = require('cors');

app.use(cors({
  origin: true,    // Allow all origins in development (RN doesn't send Origin header)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,  // No cookies in RN
}));
```

---

# BACKEND API ENDPOINTS (complete specification)

## Identity & Access — `/api/auth` and `/api/users`

### POST /api/auth/signup
Allowed body fields: email, password, firstName, lastName, accountType, orgName, orgType, contactEmail (strip all others)

Validation:
- email must end with `@depaul.edu` → 400: "Only @depaul.edu email addresses are permitted."
- email must be unique → 409: "An account with this email already exists."
- password min 8 chars → 400: "Password must be at least 8 characters."
- accountType must be "STUDENT" or "ORG" → 400: "Account type must be STUDENT or ORG."
- If ORG: orgName, orgType, contactEmail all required

On success:
- Create User (role = accountType)
- If ORG: create StudentOrg (verificationStatus = PENDING), create OrgMembership
- Return 201: `{ message: "Account created. Please log in." }`
- DO NOT auto-login

### POST /api/auth/login
Body: `{ email, password }`

- Same error whether email wrong or password wrong: "Invalid email or password." (never confirm email existence)
- If isActive false → 403: "This account has been deactivated."

On success:
- Sign JWT: `{ userId, role, email, orgId }` with 1h expiry
- **Return token in body** (NOT cookie):
```json
{
  "token": "eyJhbGci...",
  "user": { "id", "firstName", "lastName", "email", "role" },
  "org": { "id", "orgName", "orgType", "verificationStatus" } | null
}
```

### GET /api/auth/me
- Middleware: requireAuth
- Returns current user + org data
- Used by mobile on app load to validate stored token

### GET /api/users/verifyOrgStatus/:orgId
- Middleware: requireAuth
- Returns: `{ orgId, verificationStatus, orgName }`

### GET /api/users/orgs
- Middleware: requireAuth, requireAdmin
- Returns ALL StudentOrg records with their members and verification status
- Ordered: PENDING first, then VERIFIED, then REJECTED
- Returns: `{ orgs: [{ id, orgName, orgType, contactEmail, verificationStatus, verifiedAt, createdAt, _count: { listings } }] }`

### PATCH /api/users/orgs/:orgId/verify
- Middleware: requireAuth, requireAdmin
- Body: `{ status: "VERIFIED" | "REJECTED" }`
- Updates StudentOrg.verificationStatus
- If VERIFIED: set verifiedAt = now(), create Notification for the org user: "Your organization account has been verified. You can now post listings."
- If REJECTED: create Notification for org user: "Your organization account verification was declined."
- Returns: `{ org, message: "Organization [verified/rejected]." }`

---

## Listings Module — `/api/listings`

### GET /api/listings
- Middleware: requireAuth
- Query params: category, building, search, page (default 1), limit (default 12, max 50), sort (recent|ending_soon)
- Returns ACTIVE listings only where endTime > now()
- Returns: `{ listings, total, page, totalPages }`
- Each listing includes: id, title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime, status, viewCount, saveCount, postedByOrg.orgName, createdAt

### GET /api/listings/:id
- Middleware: requireAuth
- Non-ADMIN callers: return 404 for non-ACTIVE listings (do NOT return 403 — that reveals the record exists)
- ADMIN callers: return any listing regardless of status
- Increments viewCount by 1 on every call
- Returns full listing data including org details

### POST /api/listings
- Middleware: requireAuth, requireOrg, validateListingBody
- **Cross-module call:** call identityService.verifyOrgStatus(req.user.orgId) — if not VERIFIED → 403: "Your organization must be verified before posting listings."
- Allowlisted fields: title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime
- Strip any: status, postedByUserId, postedByOrgId, viewCount, saveCount
- Force-set: status = PENDING, postedByUserId = req.user.userId, postedByOrgId = req.user.orgId
- Validation: title required (max 100), description required (max 500), buildingName required, roomOrFloor required, category required (valid enum), startTime required (valid datetime), endTime required (must be after startTime), posterImageUrl optional (must be valid URL if provided — stored as string, NEVER fetched server-side)
- On success: create Listing, create Notification for admin: "New listing pending review: [title]" → return 201: `{ listing, message: "Listing submitted for admin review." }`

### PUT /api/listings/:id
- Middleware: requireAuth
- Object-level auth: listing.postedByUserId === req.user.userId OR req.user.role === 'ADMIN' → else 403
- Allowlisted: title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime
- Returns updated listing

### DELETE /api/listings/:id
- Middleware: requireAuth
- Object-level auth: same as PUT
- Sets status = REMOVED (soft delete, never hard delete)
- Returns: `{ message: "Listing removed." }`

### PATCH /api/listings/:id/status
- Middleware: requireAuth, requireAdmin
- Body: `{ status: "APPROVED" | "REJECTED", reason?: string }`
- If APPROVED:
  - Set listing.status = ACTIVE
  - Notification to org user: "Your listing '[title]' has been approved and is now live."
  - Notifications to ALL student users: "New free items: [title] at [buildingName]"
- If REJECTED:
  - Set listing.status = REJECTED
  - Notification to org user: "Your listing '[title]' was not approved. [reason || 'Does not meet platform guidelines']"
- Returns: `{ listing, message: "Listing [approved/rejected]." }`

### GET /api/listings/admin/pending
- Middleware: requireAuth, requireAdmin
- Returns all PENDING listings ordered by createdAt ASC (oldest first)
- Full listing data including org details

### GET /api/listings/admin/all
- Middleware: requireAuth, requireAdmin
- Returns all listings regardless of status
- Query params: status, page, limit (max 50)

### GET /api/listings/org/mine
- Middleware: requireAuth, requireOrg
- Returns all listings where postedByUserId = req.user.userId
- ALL statuses (PENDING, ACTIVE, EXPIRED, REMOVED)
- Ordered by createdAt DESC
- Returns: `{ listings }`

---

## Engagement Module — `/api/engagement`

### GET /api/engagement/saved
- Middleware: requireAuth
- Filter by userId = req.user.userId at database query level (never trust client)
- Cross-module: for each save, call listingsService.getListingById to get current status
- Returns: `{ savedListings: [{ savedId, savedAt, listing: { full data } }] }`

### POST /api/engagement/saved
- Middleware: requireAuth
- STUDENT only (ORG and ADMIN → 403: "Only student accounts can save listings.")
- Body: `{ listingId }`
- Validate listing exists and is ACTIVE → 404: "Listing not found or no longer available."
- Check duplicate → 409: "You have already saved this listing."
- Create SavedListing, increment listing.saveCount
- Returns 201: `{ message: "Listing saved.", savedId }`

### DELETE /api/engagement/saved/:savedId
- Middleware: requireAuth
- Object-level auth: savedListing.userId === req.user.userId → else 403
- Delete SavedListing record
- Decrement listing.saveCount (min 0)
- Returns: `{ message: "Listing unsaved." }`

### GET /api/engagement/notifications
- Middleware: requireAuth
- Filter by userId = req.user.userId at query level
- Query params: unread (boolean)
- Returns: `{ notifications, unreadCount }`
- Ordered by sentAt DESC

### PATCH /api/engagement/notifications/:id/read
- Middleware: requireAuth
- Object-level auth: notification.userId === req.user.userId → else 403
- Sets readAt = now()
- Returns: `{ message: "Marked as read." }`

### PATCH /api/engagement/notifications/read-all
- Middleware: requireAuth
- Sets readAt = now() on all unread where userId = req.user.userId
- Returns: `{ message: "All notifications marked as read.", count: N }`

### GET /api/engagement/stats
- Middleware: requireAuth, requireAdmin
- Returns:
  - totalActiveListings
  - totalUsers (with breakdown: students, orgs, admins)
  - totalPendingListings
  - totalSaves
  - topListingsByViews (top 5)
  - topListingsBySaves (top 5)
  - listingsByCategory (count per category)
  - recentListings (last 10 across all statuses)
  - pendingOrgs (count of PENDING org accounts)

---

# MOBILE FRONTEND — AUTH CONTEXT

`mobile/src/contexts/AuthContext.js`:

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  // Show loading until auth check completes

  // On app load: check AsyncStorage for existing token and validate it
  useEffect(() => {
    const rehydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          const data = await authAPI.getMe(storedToken);
          setUser(data.user);
          setOrg(data.org || null);
          setToken(storedToken);
        }
      } catch (err) {
        // Token invalid or expired — clear it
        await AsyncStorage.removeItem('auth_token');
        setUser(null);
        setOrg(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    rehydrate();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    await AsyncStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setOrg(data.org || null);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setOrg(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      org,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin:   user?.role === 'ADMIN',
      isOrg:     user?.role === 'ORG',
      isStudent: user?.role === 'STUDENT',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

---

# MOBILE FRONTEND — API SERVICE LAYER

`mobile/src/services/api.js`:

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Set this to your actual Replit backend URL
// In development: the Replit URL for your backend (e.g. https://your-replit.replit.app)
// If running Expo web on the same Replit instance, use: http://localhost:3001
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Navigation to login handled by RootNavigator watching auth state
    }
    return Promise.reject(error);
  }
);

// ── Auth API ───────────────────────────────────────────────
export const authAPI = {
  login:   (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  signup:  (data) => api.post('/auth/signup', data).then(r => r.data),
  getMe:   (token) => {
    // Called during rehydration — pass token explicitly
    return axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data);
  },
};

// ── Listings API ───────────────────────────────────────────
export const listingsAPI = {
  getAll:        (params) => api.get('/listings', { params }).then(r => r.data),
  getById:       (id) => api.get(`/listings/${id}`).then(r => r.data),
  create:        (data) => api.post('/listings', data).then(r => r.data),
  update:        (id, data) => api.put(`/listings/${id}`, data).then(r => r.data),
  remove:        (id) => api.delete(`/listings/${id}`).then(r => r.data),
  updateStatus:  (id, status, reason) => api.patch(`/listings/${id}/status`, { status, reason }).then(r => r.data),
  getPending:    () => api.get('/listings/admin/pending').then(r => r.data),
  getAllAdmin:    (params) => api.get('/listings/admin/all', { params }).then(r => r.data),
  getMyListings: () => api.get('/listings/org/mine').then(r => r.data),
};

// ── Engagement API ─────────────────────────────────────────
export const engagementAPI = {
  getSaved:        () => api.get('/engagement/saved').then(r => r.data),
  saveListing:     (listingId) => api.post('/engagement/saved', { listingId }).then(r => r.data),
  unsaveListing:   (savedId) => api.delete(`/engagement/saved/${savedId}`).then(r => r.data),
  getNotifications:(params) => api.get('/engagement/notifications', { params }).then(r => r.data),
  markRead:        (id) => api.patch(`/engagement/notifications/${id}/read`).then(r => r.data),
  markAllRead:     () => api.patch('/engagement/notifications/read-all').then(r => r.data),
  getStats:        () => api.get('/engagement/stats').then(r => r.data),
};

// ── Users / Orgs API ───────────────────────────────────────
export const usersAPI = {
  verifyOrgStatus: (orgId) => api.get(`/users/verifyOrgStatus/${orgId}`).then(r => r.data),
  getAllOrgs:       () => api.get('/users/orgs').then(r => r.data),
  updateOrgStatus: (orgId, status) => api.patch(`/users/orgs/${orgId}/verify`, { status }).then(r => r.data),
};
```

---

# NAVIGATION STRUCTURE

## RootNavigator.js — auth gate

```javascript
// mobile/src/navigation/RootNavigator.js
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import StudentTabs from './StudentTabs';
import OrgTabs from './OrgTabs';
import AdminTabs from './AdminTabs';
import LoadingScreen from '../screens/shared/LoadingScreen';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;  // Show spinner while validating stored token
  if (!user) return <AuthStack />;           // Not logged in → login/signup

  // Route to correct tab set based on role
  if (user.role === 'ADMIN')   return <AdminTabs />;
  if (user.role === 'ORG')     return <OrgTabs />;
  return <StudentTabs />;
}
```

## StudentTabs.js — bottom tabs for students

4 tabs:
1. **Browse** (Home icon) — Stack: BrowseScreen → ListingDetailScreen
2. **Saved** (Bookmark icon) — SavedScreen. Show count badge of saved items.
3. **Notifications** (Bell icon) — NotificationsScreen. Show unread count badge.
4. **Profile** (Person icon) — ProfileScreen

Active tab indicator: COLORS.brand[600] (green)
Inactive: COLORS.gray[400]
Tab bar background: COLORS.white
Border top: COLORS.gray[200]

## OrgTabs.js — bottom tabs for orgs

5 tabs:
1. **Browse** (Home icon) — Stack: BrowseScreen → ListingDetailScreen (orgs can browse too)
2. **My Listings** (List icon) — Stack: MyListingsScreen → CreateListingScreen → ListingSubmittedScreen
3. **Post** (Plus-circle icon, prominently styled in brand green center tab) — CreateListingScreen
4. **Notifications** (Bell icon) — NotificationsScreen with badge
5. **Profile** (Person icon) — ProfileScreen

The Post tab center button should be visually prominent: larger, brand green background, white plus icon, slightly raised.

## AdminTabs.js — bottom tabs for admins

5 tabs:
1. **Pending** (Clock icon) — ApprovalQueueScreen. Show count badge of pending listings.
2. **Browse** (Home icon) — Stack: BrowseScreen → ListingDetailScreen (admin sees status badges + admin actions)
3. **Activity** (Bar-chart icon) — ActivityDashboardScreen
4. **Orgs** (Shield icon) — OrgVerificationScreen. Show count badge of pending org accounts.
5. **Profile** (Person icon) — ProfileScreen

---

# SCREEN SPECIFICATIONS — MOBILE UI

## LoadingScreen (mobile/src/screens/shared/LoadingScreen.js)

Full screen, white background, centered DePaul blue spinner with the app logo "🎁 Free Stuff" below it. Shown during auth rehydration on app start.

---

## LoginScreen (mobile/src/screens/auth/LoginScreen.js)

**Layout:** ScrollView with KeyboardAvoidingView. Safe area aware.

**Header:**
- App logo: "🎁" emoji, large (60px)
- Title: "Free Stuff on Campus" — bold, COLORS.gray[900], fontSize 28
- Subtitle: "DePaul University — @depaul.edu accounts only" — COLORS.gray[500], fontSize 14

**Form fields:**
1. Email input — label "DePaul Email", placeholder "you@depaul.edu", keyboardType="email-address", autoCapitalize="none"
2. Password input — label "Password", secureTextEntry, toggle show/hide with eye icon

**Validate on frontend before submitting:**
- Email must end with @depaul.edu — show inline error: "Please use your @depaul.edu email address"

**Submit button:** "Log In" — full width, BTN_PRIMARY style (brand green), show ActivityIndicator while loading

**Error handling:**
- API 401 "Invalid email or password." — show red error banner below the password field
- API 403 "account deactivated" — show red error banner
- Network error — "Unable to connect. Check your connection."

**Footer:** "Don't have an account?" + "Sign Up" link → navigates to SignupScreen

**On login success:**
- Auth context updates user/org
- RootNavigator automatically shows the correct tab screen (no manual navigation needed)

---

## SignupScreen (mobile/src/screens/auth/SignupScreen.js)

**Layout:** ScrollView with KeyboardAvoidingView. Safe area aware.

**Step 1 — Account Type Selection (shown first, full screen):**
- Title: "Create your account"
- Subtitle: "Choose your account type"
- Two large tap cards side by side:
  - "Student Account" — description: "Browse listings, save items, get notifications" — student emoji 🎓
  - "Organization / Dept / Faculty" — description: "Post free item giveaways for students" — org emoji 🏢
- Selected card has brand green border and light green background
- "Continue" button — disabled until a type is selected

**Step 2 — Fill in details (after type is selected):**

Student fields:
- First name, Last name (side by side)
- DePaul email (@depaul.edu required)
- Password (min 8 chars)
- Confirm password

Org additional fields (shown only if ORG selected):
- Organization name
- Organization type: Student Org / University Department / Faculty & Staff (segmented picker)
- Contact email

Info banner for ORG: "Organization accounts require admin verification before you can post listings. This usually takes 24 hours."

**@depaul.edu validation:** Validate on blur (when user leaves the email field). Show red inline error immediately if domain is wrong — do not wait for submit.

**Submit button:** "Create Account" — BTN_PRIMARY, shows spinner while loading

**On success:** Navigate back to LoginScreen with green success toast: "Account created! Please log in."

**On error:**
- 409 "email already exists" — red banner: "An account with this email already exists."
- 400 validation errors — show next to relevant field

---

## BrowseScreen (mobile/src/screens/shared/BrowseScreen.js)
**Used by:** All 3 roles — accessed from their respective bottom tabs

**Header section (sticky):**
- Safe area padding at top
- Greeting row: "Hey [firstName] 👋" — bold, DePaul blue, fontSize 22
- Subtitle: "Here's what's free on campus" — COLORS.gray[500]
- Search bar below greeting: white input, gray border, search icon left, clear button right, placeholder "Search listings..."
- Horizontal ScrollView of category pills below search:
  - All / 🍕 Food / 🥤 Drinks / 👕 Apparel / 📚 Supplies / 🎁 Other
  - Active pill: brand green background, white text
  - Inactive pill: white background, gray border, gray text
- Result count row: "[N] items available" + Sort button (Most Recent / Ending Soon)

**Listing list:**
- FlatList (NOT ScrollView — use FlatList for performance)
- numColumns=1 for mobile (single column)
- Each item is a ListingCard component
- Pull-to-refresh: RefreshControl with brand green tint color
- Load more: onEndReached fetches next page
- ListEmptyComponent: EmptyState component with appropriate message
- keyExtractor: item.id

**ListingCard component (`mobile/src/components/ListingCard.js`):**
- Rounded card (CARD_STYLE from theme), margin bottom 12
- Top row: Category emoji badge (left, colored bg from theme), status badge (right)
- Poster image if available (height 160, borderRadius 12 at top, resizeMode 'cover'). If no image: colored placeholder matching category color with large emoji centered
- Content padding 12:
  - Title: bold, fontSize 16, gray[900], numberOfLines 2
  - Org name row: small org icon (ionicon "business-outline") + org name, gray[500], fontSize 13
  - Location row: 📍 buildingName + roomOrFloor, gray[600], fontSize 13
  - Bottom row: CountdownTimer component (left) + Save button (right)
- Save button: bookmark-outline icon (unsaved) / bookmark icon (saved, brand green). Tappable area 44x44 minimum
- Tap anywhere on card → navigates to ListingDetailScreen

**Admin role extras on browse:**
- Each listing card shows a small status badge even for non-ACTIVE listings when admin is browsing
- Long-press on any listing card (admin only) shows an ActionSheet: "Approve", "Reject", "Remove", "Cancel"

**Auto-refresh:** useEffect with setInterval — refetch listings every 60 seconds while screen is focused (useIsFocused hook)

**Function calls:**
- On mount + filter change: listingsAPI.getAll(params) — debounced 300ms
- On save tap: engagementAPI.saveListing(listingId) or engagementAPI.unsaveListing(savedId)

---

## ListingDetailScreen (mobile/src/screens/shared/ListingDetailScreen.js)
**Used by:** All roles

**Header:** Custom back button (← arrow + "Browse"), title truncated to 1 line

**Layout:** ScrollView

**Content (top to bottom):**
1. Poster image full width if available (height 220, no border radius). Category emoji placeholder (height 220, colored bg) if no image.
2. Content area with padding 16:
   - Category badge + Status badge (row)
   - Title: fontSize 22, bold, gray[900], fontWeight '800', marginTop 8
   - Org name row: "Posted by [orgName] ✓" — brand green checkmark, gray[600]
   - Divider
   - Location section with pin icon: buildingName, roomOrFloor in separate lines
   - Time section: Start and End times formatted nicely with clock icon. CountdownTimer shown prominently if < 24h.
   - Divider
   - Description: full text, gray[700], lineHeight 24
   - Stats row: "👁 [viewCount] views · 🔖 [saveCount] saves" — gray[400]

3. Action buttons (fixed at bottom, above safe area):
   - Save button (full width or 2/3 width): bookmark icon + "Save This Item" (unsaved state, brand green). "Saved ✓" (saved state, green fill). STUDENT only — ORG/ADMIN see a neutral "View Only" note.
   - Share button: share icon, opens native share sheet

**Admin section (visible only if role === ADMIN):**
Shown above action buttons:
- Gray card with "Admin Actions" header and shield icon
- Current status badge
- If PENDING: two buttons side by side — "Approve" (green) and "Reject" (red outline)
- If ACTIVE: "Remove Listing" (red outline, full width)
- If REMOVED or REJECTED: grayed out "No action available" text

**Approve flow (admin):**
- Show Alert.alert confirmation: "Approve this listing?" with Yes/No
- On confirm: listingsAPI.updateStatus(id, 'APPROVED') — show success toast, navigate back

**Reject flow (admin):**
- Show custom modal (bottom sheet style) with rejection reason TextInput
- "Reject Listing" button calls listingsAPI.updateStatus(id, 'REJECTED', reason)
- Show success toast, navigate back

**Error states:**
- 404 or not ACTIVE (non-admin): show centered error card "This listing is no longer available." with "Go Back" and "Browse Other Items" buttons
- API error: show inline error with retry button

**Function calls:**
- On mount: listingsAPI.getById(id) — increments view count
- On save: engagementAPI.saveListing(id) or unsaveListing(savedId)
- Admin actions: listingsAPI.updateStatus(id, status, reason)

---

## SavedScreen (mobile/src/screens/student/SavedScreen.js)
**Used by:** STUDENT only

**Header:** "Saved Items" title + count badge

**Filter tabs:**
Horizontal segmented control: "All" | "Available" | "Expired"
Active tab: brand green underline + text color
Inactive: gray text

**Listing list:**
FlatList with ListingCardHorizontal components. Pull-to-refresh.

**ListingCardHorizontal component:**
- Row layout (horizontal): category emoji square left (56x56, colored bg, centered emoji), content right
- Content: title (bold, 2 lines max), org name, building+room (small)
- Bottom of content: availability badge + "Saved [time ago]"
- Right side: unsave trash icon (44x44 touch target) with confirmation alert before deleting
- If expired: entire card is visually dimmed (opacity 0.5), "Expired" badge shown

**Availability badges:**
- ACTIVE: green "Still available"
- EXPIRED: gray "Ended"
- REMOVED: red "No longer available"

**Empty states:**
- No saves: EmptyState with bookmark icon, "Nothing saved yet", "Browse items →" button
- All expired: EmptyState with clock icon, "All your saved items have ended", "Find new items →" button

**Function calls:**
- On mount: engagementAPI.getSaved()
- On unsave: confirm Alert → engagementAPI.unsaveListing(savedId) → remove from list optimistically

---

## NotificationsScreen (mobile/src/screens/shared/NotificationsScreen.js)
**Used by:** Students and Orgs

**Header:** "Notifications" + "Mark all read" button (right, only shown if unread count > 0)

**Filter tabs:** "All" | "Unread"

**Notification list:**
FlatList, ordered newest first, pull-to-refresh

Each notification row:
- Left: colored dot based on type (green = approved, yellow = pending/general, red = rejected)
- Content: message text (bold if unread, normal if read), sentAt relative time
- Background: white if read, very light blue (#EBF5FF) if unread
- Tap: marks as read + navigates to related listing if listingId exists

"Mark all read" calls engagementAPI.markAllRead()

Empty state: bell outline icon, "No notifications yet. We'll let you know when something new is posted."

---

## CreateListingScreen (mobile/src/screens/org/CreateListingScreen.js)
**Used by:** ORG role

**Header:** "Post a Giveaway" title, back arrow

**Layout:** ScrollView + KeyboardAvoidingView

**Org verification banner (shown at top if org.verificationStatus !== 'VERIFIED'):**
- Yellow/warning background card
- Icon: warning triangle (ionicon "warning-outline")
- Text: "Your organization is pending admin verification. You cannot post listings until verified."
- If REJECTED: red background, "Your organization verification was declined. Contact support."
- If PENDING: yellow background, disable the submit button

**Form fields (in this order):**

1. **Title** — TextInput, required
   - Label: "What are you giving away?"
   - Placeholder: "e.g. Free Celsius drinks, DePaul merch, leftover pizza..."
   - maxLength: 100
   - Character count shown below: "[N]/100"

2. **Category** — Row of 5 large tappable chips (not a dropdown — native mobile pattern)
   - 🍕 Food / 🥤 Drinks / 👕 Apparel / 📚 Supplies / 🎁 Other
   - Selected chip: brand green border + light green bg
   - Unselected: gray border + white bg
   - Label: "Category" above the chips

3. **Description** — multiline TextInput
   - Label: "Tell students more"
   - Placeholder: "Include quantity, any conditions, what to expect..."
   - maxLength: 500
   - numberOfLines: 5
   - Character count: "[N]/500"

4. **Building** — TextInput
   - Label: "Building"
   - Placeholder: "e.g. DePaul Center, CDM, Schmitt Academic Center"

5. **Room or Floor** — TextInput
   - Label: "Room or Floor"
   - Placeholder: "e.g. Room 404, 7th Floor Lounge, Main Lobby"

6. **Giveaway Starts** — date/time picker
   - Label: "Starts"
   - Use DateTimePicker from `@react-native-community/datetimepicker`
   - Show formatted date/time as a tappable row: "Tap to set start time" → opens picker

7. **Giveaway Ends** — date/time picker
   - Label: "Ends"
   - Must be after startTime — show error if not
   - "Tap to set end time" → opens picker

8. **Image URL (optional)** — TextInput
   - Label: "Image URL (optional)"
   - Placeholder: "https://... paste a direct image link"
   - Helper text below: "We store this as a link — no image is downloaded to our server."
   - keyboardType="url"

**Submit button:** "Submit for Review" — BTN_PRIMARY, full width, disabled + spinner while loading. Disabled if org is PENDING/REJECTED.

**Validation (show errors inline below each field):**
- Title empty → "Please enter a title"
- Category not selected → show category section border in red
- Description empty → "Please add a description"
- Building empty → "Please enter a building name"
- Room empty → "Please enter a room or floor"
- startTime not set → "Please set a start time"
- endTime not set → "Please set an end time"
- endTime before startTime → "End time must be after start time"
- posterImageUrl invalid URL → "Please enter a valid https:// URL"

**On success:** Navigate to ListingSubmittedScreen passing listing data

**Function calls:**
- On mount: usersAPI.verifyOrgStatus(org.id) to check current verification status
- On submit: listingsAPI.create(data)

---

## ListingSubmittedScreen (mobile/src/screens/org/ListingSubmittedScreen.js)
**Used by:** ORG

**Layout:** Full screen, centered vertically

**Content:**
- Large animated checkmark in brand green (use Animated API for scale-in animation)
- Title: "Listing Submitted!" — bold, fontSize 24
- Subtitle: "Your listing is pending admin review. You'll be notified when it's approved or if changes are needed." — gray, centered, padding horizontal 32
- Listing summary card (CARD_STYLE):
  - Category emoji + Title
  - Building + Room
  - Start → End time
  - Status badge: "PENDING REVIEW" (yellow)
- Two buttons stacked:
  - "Post Another Giveaway" — BTN_PRIMARY
  - "View My Listings" — BTN_SECONDARY

---

## MyListingsScreen (mobile/src/screens/org/MyListingsScreen.js)
**Used by:** ORG

**Header row:** "My Listings" title + "Post New" button (right, brand green, links to CreateListingScreen)

**Status filter tabs (horizontal scroll):**
All | Pending | Active | Expired | Removed

**Listing list:**
FlatList with ListingCardHorizontal items. Pull-to-refresh. Empty state for each filter.

Each card shows:
- Title, building, category, status badge
- For PENDING and ACTIVE listings: "Edit" (pencil icon) and "Remove" (trash icon) action buttons in card footer
- Tap card body → ListingDetailScreen
- Tap Edit → Edit form (same as CreateListingScreen but pre-filled, title says "Edit Listing")
- Tap Remove → Alert.alert confirmation → listingsAPI.remove(id)

Empty states per filter:
- All: "You haven't posted any listings yet. Post your first giveaway!"
- Pending: "No listings pending review."
- Active: "No active listings right now. Post a new giveaway!"
- Expired/Removed: "No [expired/removed] listings."

**Function calls:**
- On mount + focus: listingsAPI.getMyListings()
- On remove: listingsAPI.remove(id)

---

## ApprovalQueueScreen (mobile/src/screens/admin/ApprovalQueueScreen.js)
**Used by:** ADMIN

**Header:** "Pending Review" + count badge (yellow pill showing number of pending listings)
**Subtitle:** "Oldest first — approve or reject to clear the queue"

**Layout:** FlatList (scrollable, NOT a two-panel layout like desktop — mobile is single column)

Each pending listing shows as an ApprovalCard component:

**ApprovalCard component:**
- Card (CARD_STYLE) with 12px margin bottom
- Top row: Org name + OrgType badge (STUDENT_ORG / UNIV_DEPT / FACULTY_STAFF), time submitted ("2h ago")
- Category emoji + Title (bold, 2 lines max)
- Location: 📍 buildingName, roomOrFloor
- Description preview (2 lines, gray)
- If posterImageUrl: small thumbnail image (60x60, rounded, right side of title row)
- Start/End time row
- **Action row at bottom (inside card):**
  - "Approve" button — green background, checkmark icon, flex 1
  - "Reject" button — red border, X icon, flex 1
  - 8px gap between

**Approve flow:**
- Tap Approve → Alert.alert "Approve '[title]'? It will go live immediately and students will be notified." → [Yes, Approve] [Cancel]
- On confirm: listingsAPI.updateStatus(id, 'APPROVED')
- On success: show green Toast "Listing approved! Students notified." → remove card from list (optimistic update)
- On API error: show red Toast "Failed to approve. Please try again." — do NOT remove card

**Reject flow:**
- Tap Reject → open a Modal (bottom sheet style from bottom of screen)
- Modal contains:
  - "Reject this listing?" header
  - TextInput for reason: "Reason (optional, sent to org)" placeholder: "e.g. Location unclear, does not meet guidelines..."
  - "Reject Listing" (red BTN_DANGER, full width)
  - "Cancel" text button below
- On confirm: listingsAPI.updateStatus(id, 'REJECTED', reason)
- On success: show yellow Toast "Listing rejected. Org notified." → remove card from list
- On API error: show red Toast "Failed to reject. Please try again."

**Pull-to-refresh:** RefreshControl with brand green tint

**Empty state:** "All caught up! ✓" with green checkmark icon, subtitle "No listings pending review right now."

**Function calls:**
- On mount + focus + pull-to-refresh: listingsAPI.getPending()
- On approve: listingsAPI.updateStatus(id, 'APPROVED')
- On reject: listingsAPI.updateStatus(id, 'REJECTED', reason)

---

## ActivityDashboardScreen (mobile/src/screens/admin/ActivityDashboardScreen.js)
**Used by:** ADMIN

**Header:** "Activity Dashboard"

**Layout:** ScrollView with pull-to-refresh

**Stats grid (2x2, then full width rows):**
Each stat card (CARD_STYLE, half width for 2-column layout):
1. Active Listings — green, listings icon
2. Pending Review — yellow, clock icon  
3. Total Users — blue, people icon
4. Total Saves — purple, bookmark icon

**User breakdown row (below stats grid):**
Horizontal row: "Students: [N]" · "Orgs: [N]" · "Admins: [N]" — small gray text

**Category distribution section:**
Title "Listings by Category"
Horizontal bar chart — custom bars using View widths, each bar has category color and label

**Recent Activity section:**
Title "Recent Listings (all statuses)"
FlatList of last 10 listings, each row showing:
- Category emoji + Title (truncated)
- Status badge
- Org name
- Created time
- Quick approve/reject buttons if status === PENDING

**Pending orgs count:**
If pendingOrgs > 0: yellow warning banner "⚠️ [N] org accounts awaiting verification" with "Review →" button → navigates to OrgVerificationScreen

**Function calls:**
- On mount + pull-to-refresh: engagementAPI.getStats()
- On approve/reject inline: listingsAPI.updateStatus(id, status)

---

## OrgVerificationScreen (mobile/src/screens/admin/OrgVerificationScreen.js)
**Used by:** ADMIN

**Header:** "Org Accounts" + count badge showing PENDING count

**Filter tabs:** All | Pending | Verified | Rejected

**Org list:**
FlatList of OrgCard components. Pull-to-refresh.

**OrgCard component:**
- Card layout with org info
- Top row: OrgType badge + Verification status badge
- Org name (bold, fontSize 16)
- Contact email (gray, fontSize 13, email icon)
- Created: [date], Listings posted: [count]
- If PENDING: two action buttons — "Verify Account" (green) and "Reject" (red outline)
- If VERIFIED: green "Verified ✓" state, "Revoke" option (optional)
- If REJECTED: red "Rejected" state, "Re-verify" option (optional)

**Verify flow:**
- Tap "Verify Account" → Alert.alert "Verify '[orgName]'? They will be able to post listings immediately." → [Yes, Verify] [Cancel]
- On confirm: usersAPI.updateOrgStatus(orgId, 'VERIFIED')
- On success: green Toast "Organization verified." → update card to show VERIFIED state

**Reject flow:**
- Tap "Reject" → Alert.alert with reason input → usersAPI.updateOrgStatus(orgId, 'REJECTED')
- On success: yellow Toast "Organization rejected." → update card

**Empty states:**
- Pending tab empty: "No org accounts pending verification."
- All tab empty: "No organizations registered yet."

**Function calls:**
- On mount + focus + pull-to-refresh: usersAPI.getAllOrgs()
- On verify/reject: usersAPI.updateOrgStatus(orgId, status)

---

## ProfileScreen (mobile/src/screens/shared/ProfileScreen.js)
**Used by:** All roles

**Header:** "Profile"

**Content (ScrollView):**
- Avatar circle: initials (first + last initial) on DePaul blue background, 72x72, centered
- Full name (bold, fontSize 20)
- Email (gray, fontSize 14)
- Role badge: Student / Org / Admin (styled per role)

For ORG users:
- Org info card: org name, org type, verification status badge
- If PENDING: yellow info: "Pending admin verification"

For STUDENT users:
- Quick stat: "[N] items saved"

For ADMIN users:
- Quick stat: "[N] listings pending review"

**Menu rows (bottom):**
- "About This App" → shows a Modal with: "Free Stuff on Campus — MIS 360 Group 4 — DePaul University"
- "Log Out" → red text, tap shows Alert.alert "Log out?" → [Yes, Log Out] [Cancel] → calls logout() from AuthContext

---

# USER FLOWS — HAPPY PATH AND EXCEPTIONS

## Flow 1: Org Posts a Listing (mobile happy path)

1. Org opens app → sees My Listings tab → taps "Post New" button in header OR taps the center "Post" tab
2. CreateListingScreen loads — org verification status checked → shows "✓ Verified Organization" green banner
3. Org fills in all fields: title, selects category chip, writes description, sets building/room, picks start and end times
4. Taps "Submit for Review"
5. Frontend validation passes → API called → identityService.verifyOrgStatus confirms VERIFIED → Listing created as PENDING
6. Admin receives in-app notification
7. Navigate to ListingSubmittedScreen with animated checkmark + listing summary card
8. Org taps "View My Listings" → sees new listing with PENDING badge in My Listings

**Exception — Org not verified:**
- On screen load, yellow warning banner appears: "Pending admin verification"
- Submit button is disabled and grayed out
- Org cannot post until admin verifies via OrgVerificationScreen

**Exception — Missing fields:**
- Tap submit → inline red error messages appear below each empty field
- Form stays on screen, does not submit
- Page scrolls to first error automatically

**Exception — Admin rejects listing:**
- Admin opens ApprovalQueueScreen → taps "Reject" → enters reason → confirms
- Org receives notification: "Your listing was not approved. [reason]"
- Listing appears as REJECTED in org's My Listings

## Flow 2: Student Browses and Saves a Listing (mobile happy path)

1. Student opens app → BrowseScreen loads with feed of active listings
2. Student scrolls — sees "Free Celsius Energy Drinks" card with countdown "Ends in 1h 45m"
3. Student taps the card → ListingDetailScreen opens
4. Reads description, sees building (DePaul Center, Main Lobby), sees countdown
5. Taps "Save This Item" bookmark button
6. Button turns green filled → "Saved ✓", saveCount increments
7. Student navigates to Saved tab → sees listing with "Still available" badge
8. Later: student navigates to listing's location to claim item

**Exception — Listing expires while on detail screen:**
- Countdown hits zero while student is reading
- Banner appears: "⚠️ This listing has expired"
- Save button disappears, replaced with "View on Browse" (leads back to feed)

**Exception — Already saved:**
- Student taps bookmark on a listing they already saved
- API returns 409
- Toast: "You've already saved this listing."
- Bookmark stays filled

**Exception — Unauthenticated access:**
- App checks auth on load in RootNavigator
- If no valid token in AsyncStorage → immediately shows LoginScreen
- No protected screen is ever rendered before auth check completes

---

# BUG FIXES — MUST BE IMPLEMENTED

The following bugs were found in an earlier version and MUST be fixed:

## Fix 1 — Save/Bookmark functionality
The POST /api/engagement/saved endpoint must:
- Read userId from req.user.userId (set by auth middleware from JWT)
- NEVER trust a userId from the request body
- Return the savedId in the response so the mobile app can use it for unsave
- The mobile save button must store the returned savedId in component state for the unsave call
- After save: immediately update the UI optimistically (change icon to filled, update count) before API confirms

## Fix 2 — Admin approve/reject on ApprovalQueueScreen
The PATCH /api/listings/:id/status endpoint must:
- Have requireAdmin middleware applied BEFORE any route logic runs
- Use the correct route — PATCH not POST
- Return the updated listing with the new status
- After approve: change listing.status to 'ACTIVE' (not just 'APPROVED')
- After reject: change listing.status to 'REJECTED'
- Both actions must trigger the corresponding notification creation
- On the mobile side: after a successful approve/reject, remove the item from the pending list immediately (optimistic update) — do not wait for a refetch
- Show a Toast message confirming the action succeeded

## Fix 3 — Org listings not showing in My Listings
The GET /api/listings/org/mine endpoint must:
- Filter by postedByUserId = req.user.userId (from JWT — NOT from query params)
- Return listings across ALL statuses (not just ACTIVE)
- The MyListingsScreen must call this endpoint on mount AND on every focus event (use useIsFocused hook) so new listings appear immediately after posting

## Fix 4 — Session persistence across navigation
AuthContext must:
- Set isLoading = true initially
- Call GET /api/auth/me on EVERY app start using the stored AsyncStorage token
- Only set isLoading = false after the API call completes (success or failure)
- RootNavigator must show LoadingScreen while isLoading is true — NEVER render a protected screen before auth check completes
- If /api/auth/me returns 401 (token expired): clear AsyncStorage, set user = null, show LoginScreen
- If /api/auth/me returns 200: set user + org state, show correct tab navigator

## Fix 5 — Activity dashboard not loading
The GET /api/engagement/stats endpoint must:
- Have requireAdmin middleware
- Return a complete stats object (not null/undefined fields)
- The ActivityDashboardScreen must handle loading state properly: show spinner while fetching, show error state if API fails with "Unable to load stats. Pull to refresh."

## Fix 6 — Org account verification for admin
This is a NEW screen (OrgVerificationScreen) that was missing. It must:
- Be accessible from the Admin bottom tab (Orgs tab with shield icon)
- Show all org accounts with their verification status
- Allow admin to tap "Verify Account" or "Reject" on PENDING orgs
- Show count badge on the tab for PENDING org count
- The Activity Dashboard should show a warning banner if pendingOrgs > 0

## Fix 7 — Browse for Org and Admin roles
- Both ORG and ADMIN users must have a Browse tab in their bottom navigation
- BrowseScreen must be accessible to all authenticated users
- For ORG: same experience as student (browse-only)
- For ADMIN: same experience but with admin action shortcuts on each listing

---

# NON-FUNCTIONAL REQUIREMENTS

## Rate limiting (backend, active in prototype)
- POST /api/auth/signup: 3 per IP per hour
- POST /api/auth/login: 10 per IP per 15 minutes
- POST /api/listings: 5 per authenticated user per 24 hours
- GET /api/listings: 100 per IP per 15 minutes
All return 429 with Retry-After header.

## Privacy
- passwordHash: NEVER returned in any API response. Exclude from all Prisma selects.
- savedListings: always filtered by userId at query level — never expose another user's saves
- posterImageUrl: stored as plain string, NEVER fetched server-side

## Error handling
- All backend controllers: wrap in try/catch
- Log: `console.error('[ModuleName] error:', err.message)`
- Return: `{ error: "Something went wrong. Please try again." }` for 500s
- Never return stack traces to client

## Performance
- FlatList everywhere (not ScrollView + map) for list rendering in React Native
- Images: use React Native Image component with appropriate resizeMode
- Pull-to-refresh on all list screens
- useIsFocused hook to refetch data when tab becomes active

---

# DEMO ACCOUNTS (same as before)

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | admin@depaul.edu | admin123 | Can approve/reject listings, verify orgs |
| Student | student1@depaul.edu | student123 | Has 2 saved listings, 3 notifications |
| Student | student2@depaul.edu | student123 | Clean account |
| Org (Verified) | robotics@depaul.edu | org123 | DePaul Robotics Club — can post listings |
| Org (Verified) | csclub@depaul.edu | org123 | CS Student Association — can post listings |
| Org (Pending) | sga@depaul.edu | org123 | SGA — cannot post until admin verifies |

---

# ENVIRONMENT VARIABLES

```
# .env (backend root)
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_minimum_32_characters
PORT=3001
NODE_ENV=development

# mobile/.env (Expo)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

For Expo Go testing on a real phone: change EXPO_PUBLIC_API_URL to your actual Replit backend URL.

---

# PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev:backend": "nodemon backend/server.js",
    "dev:mobile":  "cd mobile && expo start --web",
    "dev":         "concurrently \"npm run dev:backend\" \"npm run dev:mobile\"",
    "db:generate": "prisma generate --schema=backend/prisma/schema.prisma",
    "db:push":     "prisma db push --schema=backend/prisma/schema.prisma",
    "db:seed":     "node backend/prisma/seed.js",
    "db:setup":    "npm run db:push && npm run db:seed"
  }
}
```

---

# app.json (Expo config)

```json
{
  "expo": {
    "name": "Free Stuff on Campus",
    "slug": "free-stuff-campus",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "backgroundColor": "#16a34a"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "edu.depaul.freestuff"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#16a34a"
      },
      "package": "edu.depaul.freestuff"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    }
  }
}
```

---

# BUILD ORDER

Build in this exact order. Do not jump ahead.

1. Set up project structure, install all npm packages
2. Build backend: Prisma schema → db:push → seed
3. Build backend: auth middleware (Bearer token), all routes (identity, listings, engagement)
4. Verify backend with curl/Postman: test login, get listings, save listing, approve listing
5. Build mobile: theme.js constants file
6. Build mobile: AuthContext + api.js service layer
7. Build mobile: RootNavigator + AuthStack (Login + Signup screens)
8. Test auth flow: login, rehydration on refresh, logout
9. Build mobile: StudentTabs + BrowseScreen + ListingDetailScreen
10. Build mobile: SavedScreen + NotificationsScreen
11. Build mobile: OrgTabs + CreateListingScreen + MyListingsScreen + ListingSubmittedScreen
12. Build mobile: AdminTabs + ApprovalQueueScreen + ActivityDashboardScreen + OrgVerificationScreen
13. Build mobile: ProfileScreen (shared)
14. Apply all 7 bug fixes
15. Test end-to-end with each demo account

---

# IMPORTANT NOTES

- **Run with:** `npm run dev:mobile` uses `expo start --web` for browser-based demo in Replit. For a real phone: run `expo start` and scan QR code with Expo Go app.
- **Backend must be running** for the mobile app to work. Run both with `npm run dev`.
- **This is a modular monolith.** All modules are in the same Express process. Cross-module calls are direct function imports (e.g. listings.service.js imports identity.service.js directly — not HTTP calls).
- **No real email sending.** All email notifications are simulated as in-app notifications stored in the DB.
- **No real push notifications.** The FCM integration is mocked — in-app notifications only.
- **DePaul @depaul.edu email validation** is a domain check only — not verified against DePaul's actual systems.
- **Keep all colors exactly as defined in theme.js.** Do not introduce any other colors. Do not use purple. Do not use generic blue except where DePaul blue (#005EB8) is specified.
- **Use real DePaul building names** in seed data and placeholders: DePaul Center, CDM, Schmitt Academic Center, Lewis Center, Student Center, Richardson Library, Daley Building.
