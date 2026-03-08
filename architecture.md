# Architecture & Technology Stack

## Electronic Device Inventory Management System

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│         Mobile App (iOS / Android / Web)                    │
│              Expo SDK 54 / React Native 0.81                │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS (REST API)
                              │ JWT Bearer Token
┌─────────────────────────────┴───────────────────────────────┐
│                   APPLICATION LAYER                         │
│                  Node.js + Express.js                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Auth   │ │ Device  │ │ Assign  │ │ Report  │           │
│  │Controller│ │Controller│ │Controller│ │Controller│          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Maint  │ │Warranty │ │  User   │ │ System  │           │
│  │Controller│ │Controller│ │Controller│ │Controller│          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐                      │
│  │Category │ │Location │ │Depreciat.│                      │
│  │Controller│ │Controller│ │Controller│                      │
│  └─────────┘ └─────────┘ └──────────┘                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                      DATA LAYER                             │
│              MongoDB Atlas (Mongoose ODM)                    │
│    Collections: Users, Devices, Assignments, Maintenance,   │
│    DeviceCategories, Locations, Departments, Warranties,     │
│    WarrantyClaims, DepreciationRules, SystemSettings,       │
│    ReportConfigs                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend — Mobile App

### 2.1 Core Framework

| Công nghệ    | Phiên bản | Mục đích                         |
| ------------ | --------- | -------------------------------- |
| React Native | 0.81.5    | Cross-platform mobile framework  |
| React        | 19.1.0    | UI library                       |
| Expo SDK     | 54        | Managed workflow, build & deploy |
| TypeScript   | 5.9.2     | Type safety (strict mode)        |

### 2.2 Navigation

| Công nghệ        | Phiên bản | Mục đích                     |
| ---------------- | --------- | ---------------------------- |
| Expo Router      | 6.x       | File-based routing           |
| React Navigation | 7.x       | Bottom tabs, stack navigator |

### 2.3 UI & Styling

| Công nghệ                      | Mục đích                            |
| ------------------------------ | ----------------------------------- |
| React Native StyleSheet        | Styling (không dùng thư viện ngoài) |
| expo-linear-gradient           | Gradient cho header, button, card   |
| @expo/vector-icons (Ionicons)  | Icon system                         |
| expo-image                     | Optimized image rendering           |
| react-native-safe-area-context | Safe area handling                  |
| react-native-screens           | Native screen containers            |

### 2.4 Animation & Interaction

| Công nghệ                    | Phiên bản | Mục đích                 |
| ---------------------------- | --------- | ------------------------ |
| react-native-reanimated      | 4.1.1     | Performant animations    |
| react-native-gesture-handler | 2.28.0    | Touch & gesture handling |
| react-native-worklets        | 0.5.1     | Worklet-based threading  |
| expo-haptics                 | 15.x      | Haptic feedback          |

### 2.5 Networking & Security

| Công nghệ         | Mục đích                                       |
| ----------------- | ---------------------------------------------- |
| fetch (built-in)  | HTTP client (wrapped in apiClient)             |
| expo-secure-store | Lưu trữ JWT tokens an toàn (Keychain/Keystore) |

### 2.6 Developer Tooling

| Công cụ                       | Mục đích                    |
| ----------------------------- | --------------------------- |
| ESLint 9 + eslint-config-expo | Linting & code quality      |
| React Compiler (experimental) | Auto-memoization            |
| Path aliases (`@/*`)          | Clean imports               |
| expo-splash-screen            | Splash screen configuration |

---

## 3. Backend — REST API

### 3.1 Core Stack

| Công nghệ     | Phiên bản | Mục đích                 |
| ------------- | --------- | ------------------------ |
| Node.js       | 18+       | Runtime environment      |
| Express.js    | 4.18      | Web framework / REST API |
| Mongoose      | 8.x       | MongoDB ODM              |
| MongoDB Atlas | —         | Cloud database           |

### 3.2 Authentication & Security

| Công nghệ         | Mục đích                           |
| ----------------- | ---------------------------------- |
| jsonwebtoken      | JWT access token + refresh token   |
| bcrypt            | Password hashing (salt rounds: 10) |
| cors              | Cross-Origin Resource Sharing      |
| express-validator | Request validation                 |

### 3.3 Utilities

| Công nghệ | Mục đích                |
| --------- | ----------------------- |
| dotenv    | Environment variables   |
| multer    | File upload handling    |
| nodemon   | Dev server auto-restart |

### 3.4 API Endpoints

| Prefix              | Controller             | Chức năng                                                 |
| ------------------- | ---------------------- | --------------------------------------------------------- |
| `/api/auth`         | authController         | Sign in, sign out, register, refresh token, profile       |
| `/api/devices`      | deviceController       | CRUD, search, filter, barcode, bulk ops                   |
| `/api/users`        | userController         | CRUD users, assign roles                                  |
| `/api/assignments`  | assignmentController   | Assign/unassign devices, history                          |
| `/api/maintenance`  | maintenanceController  | Record, request, schedule, complete                       |
| `/api/categories`   | categoryController     | Device categories CRUD                                    |
| `/api/locations`    | locationController     | Locations CRUD                                            |
| `/api/reports`      | reportController       | Device status, warranty, depreciation, assignment reports |
| `/api/system`       | systemController       | Health check, settings, backup, DB stats                  |
| `/api/warranties`   | warrantyController     | Warranty CRUD, claims                                     |
| `/api/depreciation` | depreciationController | Depreciation rules & calculations                         |

### 3.5 Authentication Flow

```
Client                          Server
  │                               │
  ├── POST /auth/signin ─────────►│ Validate credentials
  │◄── { accessToken,             │ Generate JWT pair
  │     refreshToken, user } ─────│
  │                               │
  ├── GET /api/* ────────────────►│ Verify accessToken
  │   Authorization: Bearer xxx   │ (middleware: authenticate)
  │◄── Response ──────────────────│
  │                               │
  ├── 401 (token expired) ───────►│
  │                               │
  ├── POST /auth/refresh-token ──►│ Verify refreshToken
  │   { refreshToken }            │ Generate new pair
  │◄── { accessToken,             │
  │     refreshToken } ───────────│
  │                               │
  ├── Retry original request ────►│
  │◄── Response ──────────────────│
```

- Access token TTL: 7 ngày
- Refresh token TTL: 7 ngày
- Token storage: `expo-secure-store` (Keychain trên iOS, Keystore trên Android)
- Auto-refresh: `apiClient.ts` tự động refresh khi nhận 401, queue các request song song

### 3.6 Role-Based Access Control

| Role                | Quyền                                                            |
| ------------------- | ---------------------------------------------------------------- |
| `admin`             | Full access: CRUD devices, users, settings, reports, assignments |
| `inventory_manager` | CRUD devices, assignments, maintenance, reports                  |
| `staff`             | View assigned devices, request maintenance                       |

---

## 4. Database Schema (MongoDB)

### Collections & Models

| Collection           | Mô tả                         | Quan hệ chính                 |
| -------------------- | ----------------------------- | ----------------------------- |
| `users`              | Tài khoản người dùng          | → departments                 |
| `devices`            | Thiết bị điện tử              | → devicecategories, locations |
| `devicecategories`   | Danh mục thiết bị             | —                             |
| `locations`          | Vị trí lưu trữ                | —                             |
| `departments`        | Phòng ban                     | —                             |
| `assignments`        | Gán thiết bị cho user         | → devices, users, departments |
| `maintenancerecords` | Bản ghi bảo trì               | → devices, users              |
| `warranties`         | Bảo hành thiết bị             | → devices                     |
| `warrantyclaims`     | Yêu cầu bảo hành              | → warranties                  |
| `depreciationrules`  | Quy tắc khấu hao              | → devicecategories            |
| `systemsettings`     | Cấu hình hệ thống (key-value) | —                             |
| `reportconfigs`      | Cấu hình báo cáo              | —                             |

---

## 5. Frontend Architecture

### 5.1 Cấu trúc thư mục

```
├── app/                          # Screens (file-based routing)
│   ├── _layout.tsx               # Root layout (AuthProvider, ThemeProvider, Stack)
│   ├── login.tsx                 # SCR-01: Login
│   ├── device-details.tsx        # SCR-04: Device Details
│   ├── device-form.tsx           # SCR-05: Add/Edit Device
│   ├── assignment.tsx            # SCR-06: Assignment
│   ├── user-management.tsx       # SCR-10: User Management
│   ├── system-settings.tsx       # SCR-11: System Settings
│   └── (tabs)/                   # Tab navigation group
│       ├── _layout.tsx           # Tab layout (5 tabs, role-based visibility)
│       ├── index.tsx             # SCR-02: Dashboard
│       ├── devices.tsx           # SCR-03: Device List
│       ├── maintenance.tsx       # SCR-08: Maintenance
│       ├── reports.tsx           # SCR-07: Reports
│       └── admin.tsx             # SCR-09: Admin Panel
├── components/                   # Reusable UI components
│   ├── device-card.tsx
│   ├── gradient-header.tsx
│   ├── search-bar.tsx
│   ├── stat-card.tsx
│   ├── status-badge.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                       # Low-level UI primitives
├── config/
│   └── api.ts                    # API_BASE_URL configuration
├── constants/
│   └── theme.ts                  # Colors, gradients, fonts
├── contexts/
│   └── AuthContext.tsx            # Auth state (user, login, logout, token refresh)
├── hooks/
│   ├── use-color-scheme.ts
│   ├── use-theme-color.ts
│   └── useApiData.ts            # Generic data fetching hook
├── services/                     # API service layer
│   ├── apiClient.ts              # Fetch wrapper (auto token, 401 refresh, error handling)
│   ├── tokenManager.ts           # SecureStore token CRUD
│   ├── authService.ts            # /auth endpoints
│   ├── deviceService.ts          # /devices endpoints
│   ├── categoryService.ts        # /categories endpoints
│   ├── locationService.ts        # /locations endpoints
│   ├── maintenanceService.ts     # /maintenance endpoints
│   ├── assignmentService.ts      # /assignments endpoints
│   ├── userService.ts            # /users endpoints
│   ├── reportService.ts          # /reports endpoints
│   └── systemService.ts          # /system endpoints
├── types/
│   └── api.ts                    # TypeScript interfaces (Device, User, etc.)
├── utils/
│   ├── permissions.ts            # Role-based permission checks
│   ├── filters.ts                # Device filtering utilities
│   ├── maintenanceUtils.ts       # Maintenance status counting
│   ├── userUtils.ts              # User display helpers
│   └── networkError.ts           # Network error detection & messages
└── assets/                       # Static assets (images, icons)
```

### 5.2 Service Layer Architecture

```
Screen (app/*.tsx)
  │
  ├── useApiData hook ──► Service (services/*.ts) ──► apiClient.ts ──► fetch()
  │                                                       │
  │                                                       ├── Auto-attach Bearer token
  │                                                       ├── 401 → refresh token → retry
  │                                                       ├── Network error → Vietnamese message
  │                                                       └── Queue concurrent requests during refresh
  │
  └── AuthContext ──► authService ──► tokenManager (SecureStore)
```

### 5.3 Design System

**Color Tokens**

```
Primary:       #1E3A8A (dark blue)
Primary Light: #3B82F6 (blue)
Accent:        #60A5FA (light blue)

Status Colors:
  Active/Available: #22C55E (green)
  Assigned:         #8B5CF6 (purple)
  In Maintenance:   #F59E0B (amber)
  Retired:          #EF4444 (red)
  Disposed:         #6B7280 (gray)

Background:
  Primary: #F8FAFC
  Card:    #FFFFFF
  Input:   #F1F5F9
  Border:  #E2E8F0
```

**Gradient Presets**

```
Header:  ['#1E2A5E', '#1E3A8A', '#2563EB']
Primary: ['#1E3A8A', '#3B82F6']
Card:    ['#EFF6FF', '#DBEAFE']
Dark:    ['#0F172A', '#1E293B']
```

### 5.4 Reusable Components

| Component        | Props                                     | Mô tả                         |
| ---------------- | ----------------------------------------- | ----------------------------- |
| `GradientHeader` | title, subtitle, children                 | Header gradient với safe area |
| `DeviceCard`     | name, assetTag, category, status, onPress | Card hiển thị thiết bị        |
| `StatCard`       | icon, label, value, color/gradient        | Card thống kê                 |
| `StatusBadge`    | status, size                              | Badge trạng thái (9 variants) |
| `SearchBar`      | placeholder, value, onChangeText          | Input tìm kiếm                |
| `ThemedText`     | style, children                           | Text theo theme               |

---

## 6. Navigation Flow

```
Login (Stack)
  │
  ▼
(tabs) ─── Tab Navigator ──────────────────────────────┐
  │                                                     │
  ├── Dashboard (index)                                 │
  │     └── → Device Details (Stack, card)              │
  │     └── → Devices tab                               │
  │                                                     │
  ├── Devices                                           │
  │     ├── → Device Details (Stack, card)              │
  │     │     ├── → Assignment (Stack, modal)           │
  │     │     └── → Device Form (Stack, modal)          │
  │     └── → Device Form (Stack, modal)                │
  │                                                     │
  ├── Maintenance                                       │
  │                                                     │
  ├── Reports                                           │
  │                                                     │
  └── Admin (ẩn với role staff)                         │
        ├── → User Management (Stack, card)             │
        └── → System Settings (Stack, card)             │
◄───────────────────────────────────────────────────────┘
```

**Auth Guard**: `_layout.tsx` kiểm tra `isAuthenticated` → redirect `/login` nếu chưa đăng nhập, redirect `/(tabs)` nếu đã đăng nhập.

---

## 7. Backend Architecture

### 7.1 Cấu trúc thư mục

```
src/
├── server.js                     # Entry point (Express app, middleware, routes)
├── config/
│   └── database.js               # MongoDB connection (Mongoose)
├── controllers/                  # Request handlers
│   ├── authController.js
│   ├── deviceController.js
│   ├── userController.js
│   ├── assignmentController.js
│   ├── maintenanceController.js
│   ├── categoryController.js
│   ├── locationController.js
│   ├── reportController.js
│   ├── systemController.js
│   ├── warrantyController.js
│   └── depreciationController.js
├── middleware/
│   ├── auth.js                   # JWT verification, role-based authorization
│   ├── errorHandler.js           # Global error handler
│   ├── roleMiddleware.js         # Role checking utilities
│   └── validators.js             # express-validator rules
├── models/                       # Mongoose schemas
│   ├── User.js
│   ├── Device.js
│   ├── DeviceCategory.js
│   ├── Location.js
│   ├── Department.js
│   ├── Assignment.js
│   ├── MaintenanceRecord.js
│   ├── Warranty.js
│   ├── WarrantyClaim.js
│   ├── DepreciationRule.js
│   ├── SystemSettings.js
│   └── ReportConfigs.js
├── routes/                       # Express routers
│   ├── authRoutes.js
│   ├── deviceRoutes.js
│   ├── userRoutes.js
│   ├── assignmentRoutes.js
│   ├── maintenanceRoutes.js
│   ├── deviceCategoryRoutes.js
│   ├── locationRoutes.js
│   ├── reportRoutes.js
│   ├── systemRoutes.js
│   ├── warrantyRoutes.js
│   └── depreciationRoutes.js
├── services/                     # Business logic
│   ├── categoryService.js
│   ├── locationService.js
│   ├── depreciationService.js
│   └── warrantyService.js
├── utils/
│   ├── helpers.js
│   └── passwordHelper.js
└── scripts/
    ├── createAdmin.js            # Tạo tài khoản admin đầu tiên
    └── seedDatabase.js           # Seed dữ liệu mẫu
```

### 7.2 API Response Formats

**Paginated list** (devices, maintenance):

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Single resource** (device details, user):

```json
{
  "_id": "...",
  "name": "...",
  ...
}
```

**Action response** (delete, update status):

```json
{
  "message": "Operation successful",
  ...
}
```

---

## 8. Trạng thái hiện tại & Roadmap

### Đã hoàn thành ✅

- [x] Project setup (Expo SDK 54, TypeScript strict)
- [x] Navigation structure (5 tabs + stack screens)
- [x] Design system (colors, gradients, typography)
- [x] 11 screens UI hoàn chỉnh
- [x] Reusable component library (6 components)
- [x] Dark/Light mode support
- [x] Multi-platform support (iOS, Android, Web)
- [x] Backend API (Node.js + Express.js + MongoDB)
- [x] Database schema (MongoDB / Mongoose)
- [x] Authentication (JWT access + refresh token, bcrypt)
- [x] API integration (service layer + apiClient)
- [x] Auth state management (AuthContext + SecureStore)
- [x] Role-based access control (admin, inventory_manager, staff)
- [x] Error handling (network errors, token expiry, Vietnamese messages)
- [x] All 11 screens connected to real API data

### Cần triển khai 🔲

- [ ] Barcode/QR scanning (expo-camera / expo-barcode-scanner)
- [ ] File upload & document management
- [ ] Push notifications
- [ ] Offline support & data sync
- [ ] E2E testing
- [ ] CI/CD pipeline
- [ ] Production deployment (backend hosting, environment configs)

---

_Document Version: 2.0_
_Last Updated: March 2026_
