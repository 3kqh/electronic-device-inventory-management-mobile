# 📊 Electronic Device Inventory Management System

## Slide Presentation Script

---

## SLIDE 1: TRANG BÌA

**Tiêu đề:** Electronic Device Inventory Management System

**Phụ đề:** Hệ thống quản lý vòng đời thiết bị điện tử trong tổ chức

**Thông tin:**

- Ứng dụng Mobile Cross-platform (iOS / Android / Web)
- Công nghệ: React Native + Expo SDK 54 + Node.js + MongoDB
- Phiên bản: 1.0.0

---

## SLIDE 2: TỔNG QUAN DỰ ÁN

**Tiêu đề:** Tổng quan hệ thống

**Nội dung chính:**

| Thuộc tính    | Mô tả                                                       |
| ------------- | ----------------------------------------------------------- |
| Mục đích      | Quản lý vòng đời thiết bị điện tử — từ mua sắm đến thanh lý |
| Loại ứng dụng | Mobile App (iOS, Android, Web)                              |
| Quy mô        | 100,000 thiết bị, 1,000 người dùng đồng thời                |
| Đối tượng     | Doanh nghiệp, tổ chức có nhu cầu quản lý tài sản IT         |

**Điểm nhấn:**

- Quản lý toàn bộ vòng đời thiết bị: mua sắm → gán → bảo trì → khấu hao → thanh lý
- Hỗ trợ đa nền tảng từ một codebase duy nhất

---

## SLIDE 3: CÁC MODULE CHỨC NĂNG (8 Modules)

**Tiêu đề:** 8 Module chức năng chính

**Nội dung (dạng grid/icon):**

| #   | Module               | Mô tả                                      | Số Use Case |
| --- | -------------------- | ------------------------------------------ | ----------- |
| 1   | 🔐 Authentication    | Đăng nhập, phân quyền, quản lý session     | 4           |
| 2   | 📱 Device Management | CRUD thiết bị, barcode, bulk import/export | 11          |
| 3   | 👤 Assignment        | Gán thiết bị cho nhân viên/phòng ban       | 6           |
| 4   | 🔧 Maintenance       | Bảo trì, sửa chữa, lịch bảo dưỡng          | 5           |
| 5   | 📋 Warranty          | Quản lý bảo hành, claims                   | 4           |
| 6   | 📉 Depreciation      | Tính khấu hao tự động                      | 2           |
| 7   | 📊 Reports           | Báo cáo tổng hợp, xuất PDF/Excel           | 8           |
| 8   | ⚙️ Administration    | Quản lý user, audit trail, cấu hình        | 10          |

**Tổng cộng: 50 Use Cases**

---

## SLIDE 4: PHÂN QUYỀN NGƯỜI DÙNG (RBAC)

**Tiêu đề:** Phân quyền — 3 vai trò người dùng

**Nội dung:**

| Role                  | Mô tả                  | Quyền hạn                                                     |
| --------------------- | ---------------------- | ------------------------------------------------------------- |
| **Admin**             | Quản trị viên hệ thống | Toàn quyền (100% — 50 UC)                                     |
| **Inventory Manager** | Quản lý kho thiết bị   | Quản lý thiết bị, gán/thu hồi, bảo trì, báo cáo (84% — 42 UC) |
| **Staff**             | Nhân viên              | Xem thiết bị được gán, yêu cầu bảo trì (26% — 13 UC)          |

**Ma trận phân quyền:**

| Module            | Admin | Inventory Manager |    Staff     |
| ----------------- | :---: | :---------------: | :----------: |
| Device Management | Full  |       Full        |  View only   |
| Assignment        | Full  |       Full        | Acknowledge  |
| Maintenance       | Full  |       Full        | Request only |
| Reports           | Full  |       Full        |      ✗       |
| Administration    | Full  |      Limited      |      ✗       |

---

## SLIDE 5: KIẾN TRÚC HỆ THỐNG

**Tiêu đề:** Kiến trúc 3 tầng (Three-Tier Architecture)

**Nội dung (sơ đồ):**

```
┌─────────────────────────────────────────────────┐
│              📱 CLIENT LAYER                     │
│     Mobile App (iOS / Android / Web)             │
│     Expo SDK 54 / React Native 0.81              │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS (REST API)
                       │ JWT Bearer Token
┌──────────────────────┴──────────────────────────┐
│            🖥️ APPLICATION LAYER                  │
│           Node.js + Express.js 4.18              │
│  11 Controllers · 5 Middleware · 13 Routes       │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────┐
│              💾 DATA LAYER                       │
│         MongoDB Atlas (Mongoose 8.x)             │
│              13 Collections                      │
└─────────────────────────────────────────────────┘
```

---

## SLIDE 6: CÔNG NGHỆ SỬ DỤNG — FRONTEND

**Tiêu đề:** Tech Stack — Mobile App

**Nội dung:**

| Công nghệ            | Phiên bản | Mục đích                              |
| -------------------- | --------- | ------------------------------------- |
| React Native         | 0.81.5    | Cross-platform mobile framework       |
| React                | 19.1.0    | UI library                            |
| Expo SDK             | 54        | Managed workflow, build & deploy      |
| TypeScript           | 5.9.2     | Type safety (strict mode)             |
| Expo Router          | 6.x       | File-based routing                    |
| React Navigation     | 7.x       | Bottom tabs, stack navigator          |
| Reanimated           | 4.1.1     | Performant animations                 |
| expo-secure-store    | —         | JWT token storage (Keychain/Keystore) |
| expo-linear-gradient | —         | Gradient UI elements                  |
| Ionicons             | —         | Icon system                           |

---

## SLIDE 7: CÔNG NGHỆ SỬ DỤNG — BACKEND

**Tiêu đề:** Tech Stack — Backend API

**Nội dung:**

| Công nghệ         | Phiên bản | Mục đích                      |
| ----------------- | --------- | ----------------------------- |
| Node.js           | 18+       | Runtime environment           |
| Express.js        | 4.18      | Web framework / REST API      |
| Mongoose          | 8.x       | MongoDB ODM                   |
| MongoDB Atlas     | —         | Cloud database                |
| jsonwebtoken      | —         | JWT access + refresh token    |
| bcrypt            | —         | Password hashing (salt: 10)   |
| express-validator | —         | Request validation            |
| cors              | —         | Cross-Origin Resource Sharing |
| multer            | —         | File upload handling          |

---

## SLIDE 8: CẤU TRÚC DATABASE

**Tiêu đề:** Database Schema — 13 Collections

**Nội dung (sơ đồ quan hệ):**

| #   | Collection         | Mô tả                | Quan hệ                 |
| --- | ------------------ | -------------------- | ----------------------- |
| 1   | users              | Tài khoản người dùng | → departments           |
| 2   | devices            | Thiết bị điện tử     | → categories, locations |
| 3   | devicecategories   | Danh mục thiết bị    | —                       |
| 4   | locations          | Vị trí lưu trữ       | → locations (parent)    |
| 5   | departments        | Phòng ban            | —                       |
| 6   | assignments        | Gán thiết bị         | → devices, users        |
| 7   | maintenancerecords | Bảo trì              | → devices, users        |
| 8   | warranties         | Bảo hành             | → devices               |
| 9   | warrantyclaims     | Yêu cầu bảo hành     | → warranties            |
| 10  | depreciationrules  | Quy tắc khấu hao     | → categories            |
| 11  | auditlogs          | Nhật ký thao tác     | → users                 |
| 12  | systemsettings     | Cấu hình hệ thống    | —                       |
| 13  | reportconfigs      | Cấu hình báo cáo     | —                       |

---

## SLIDE 9: LUỒNG XÁC THỰC (Authentication Flow)

**Tiêu đề:** Authentication — JWT + Auto Refresh

**Nội dung (sequence diagram):**

```
Client                              Server
  │                                    │
  ├── POST /auth/signin ──────────────►│  Validate credentials
  │◄── { accessToken, refreshToken } ──│  Generate JWT pair
  │                                    │
  ├── GET /api/* ─────────────────────►│  Verify accessToken
  │   Authorization: Bearer xxx        │
  │◄── Response ───────────────────────│
  │                                    │
  │   (Token expired → 401)            │
  ├── POST /auth/refresh-token ───────►│  Verify refreshToken
  │◄── { new accessToken } ────────────│  Generate new pair
  │                                    │
  ├── Retry original request ─────────►│
  │◄── Response ───────────────────────│
```

**Đặc điểm:**

- Access token TTL: 7 ngày
- Refresh token TTL: 7 ngày
- Token storage: expo-secure-store (Keychain iOS / Keystore Android)
- Auto-refresh: apiClient tự động refresh khi nhận 401
- Concurrent request queuing: Queue các request song song khi đang refresh

---

## SLIDE 10: MÀN HÌNH ỨNG DỤNG — TỔNG QUAN

**Tiêu đề:** 11+ Màn hình chính

**Nội dung (navigation flow):**

```
Login (SCR-01)
    │
    ▼
Tab Navigator ──────────────────────────────────────┐
    │                                                │
    ├── 📊 Dashboard ── xem thống kê, alerts         │
    │                                                │
    ├── 📱 Devices ── danh sách, search, filter      │
    │     ├── Device Details                         │
    │     ├── Device Form (Add/Edit)                 │
    │     └── Assignment                             │
    │                                                │
    ├── 🔧 Maintenance ── bảo trì, lịch sử          │
    │                                                │
    ├── 📊 Reports ── báo cáo, export                │
    │                                                │
    └── ⚙️ Admin (ẩn với Staff) ─────────────────────│
          ├── User Management                        │
          ├── System Settings                        │
          ├── Device Categories                      │
          ├── Locations                              │
          ├── Departments                            │
          ├── Audit Logs                             │
          ├── Warranty Management                    │
          ├── Depreciation Rules                     │
          └── Profile                                │
◄────────────────────────────────────────────────────┘
```

---

## SLIDE 11: MÀN HÌNH — DASHBOARD

**Tiêu đề:** SCR-02: Dashboard

**Mô tả:**

- Hiển thị tổng quan hệ thống với dữ liệu real-time từ API
- 4 StatCard: Total Devices, Available, Assigned, In Maintenance
- Alerts section: Warranty expiring, Upcoming maintenance
- Recent Devices: 5 thiết bị mới nhất với DeviceCard
- Header actions: Notifications (badge count), Barcode scan
- Welcome message hiển thị tên user và role

---

## SLIDE 12: MÀN HÌNH — DEVICE LIST & DETAILS

**Tiêu đề:** SCR-03 & SCR-04: Quản lý thiết bị

**Device List:**

- SearchBar: Tìm kiếm theo tên, asset tag, serial number (debounce 300ms)
- Filter chips: All, Available, Assigned, Maintenance, Retired
- DeviceCard: Hiển thị tên, asset tag, category, status badge
- FAB button: Thêm thiết bị mới (chỉ Admin/Inventory Manager)
- Pagination support

**Device Details:**

- Thông tin chi tiết: specs, purchase info, location
- Tabs: Info, Specifications, History
- Actions: Edit, Assign, Dispose (role-based)

---

## SLIDE 13: MÀN HÌNH — MAINTENANCE & REPORTS

**Tiêu đề:** SCR-08 & SCR-07: Bảo trì & Báo cáo

**Maintenance:**

- Stats: Pending, Completed, Scheduled
- Maintenance records với type icons (preventive/corrective/other)
- Modal form: Tạo yêu cầu bảo trì mới
- StatusBadge cho mỗi record

**Reports:**

- 4 loại báo cáo: Inventory, Assignment, Warranty, Depreciation
- Quick Export: CSV / PDF
- Real-time data fetching khi chọn report
- Permission-based: Staff không thể xem

---

## SLIDE 14: MÀN HÌNH — ADMIN PANEL

**Tiêu đề:** SCR-09: Admin Panel

**Nội dung:**

- User stats: Total Users, Active, Locked
- 9 menu quản trị:
  - User Management — Quản lý người dùng & roles
  - System Settings — Cấu hình hệ thống
  - Device Categories — Danh mục & custom fields
  - Locations — Buildings, floors, rooms
  - Departments — Cơ cấu tổ chức
  - Audit Trail — Nhật ký hoạt động
  - Profile — Thông tin cá nhân
  - Warranty Management — Quản lý bảo hành
  - Depreciation — Quy tắc khấu hao
- Recent Activity feed
- Chỉ hiển thị cho Admin & Inventory Manager

---

## SLIDE 15: KIẾN TRÚC FRONTEND

**Tiêu đề:** Frontend Architecture — Service Layer Pattern

**Nội dung (sơ đồ):**

```
Screen (app/*.tsx)
    │
    ├── useApiData hook ──► Service (services/*.ts) ──► apiClient.ts ──► fetch()
    │                                                       │
    │                                                       ├── Auto-attach Bearer token
    │                                                       ├── 401 → refresh → retry
    │                                                       ├── Network error → Vietnamese msg
    │                                                       └── Queue concurrent requests
    │
    └── AuthContext ──► authService ──► tokenManager (SecureStore)
```

**Cấu trúc thư mục:**

- `app/` — 11+ screens (file-based routing)
- `components/` — 8 reusable UI components
- `services/` — 15 API service modules
- `contexts/` — AuthContext (global state)
- `hooks/` — useApiData, useColorScheme, useThemeColor
- `types/` — TypeScript interfaces (30+ types)
- `utils/` — permissions, filters, network error handling
- `constants/` — Design system (colors, gradients)
- `config/` — API base URL

---

## SLIDE 16: API ENDPOINTS

**Tiêu đề:** Backend REST API — 11 Route Groups

**Nội dung:**

| Prefix              | Controller             | Chức năng                                     |
| ------------------- | ---------------------- | --------------------------------------------- |
| `/api/auth`         | authController         | Sign in/out, register, refresh token, profile |
| `/api/devices`      | deviceController       | CRUD, search, filter, barcode, bulk ops       |
| `/api/users`        | userController         | CRUD users, assign roles                      |
| `/api/assignments`  | assignmentController   | Assign/unassign devices, history              |
| `/api/maintenance`  | maintenanceController  | Record, request, schedule, complete           |
| `/api/categories`   | categoryController     | Device categories CRUD                        |
| `/api/locations`    | locationController     | Locations CRUD                                |
| `/api/reports`      | reportController       | Device status, warranty, depreciation reports |
| `/api/system`       | systemController       | Health check, settings, backup, DB stats      |
| `/api/warranties`   | warrantyController     | Warranty CRUD, claims                         |
| `/api/depreciation` | depreciationController | Depreciation rules & calculations             |

---

## SLIDE 17: DESIGN SYSTEM

**Tiêu đề:** Design System — Colors & Components

**Color Palette:**

- Primary: `#1E3A8A` (dark blue) / `#3B82F6` (blue) / `#60A5FA` (light blue)
- Status: Available `#22C55E` · Assigned `#8B5CF6` · Maintenance `#F59E0B` · Retired `#EF4444`
- Background: Primary `#F8FAFC` · Card `#FFFFFF` · Input `#F1F5F9`

**Gradient Presets:**

- Header: `['#1E2A5E', '#1E3A8A', '#2563EB']`
- Primary: `['#1E3A8A', '#3B82F6']`

**Reusable Components:**

| Component      | Mô tả                           |
| -------------- | ------------------------------- |
| GradientHeader | Header gradient với safe area   |
| DeviceCard     | Card hiển thị thiết bị          |
| StatCard       | Card thống kê với icon/gradient |
| StatusBadge    | Badge trạng thái (9 variants)   |
| SearchBar      | Input tìm kiếm                  |
| ThemedText     | Text theo theme                 |

---

## SLIDE 18: TÍNH NĂNG NỔI BẬT

**Tiêu đề:** Tính năng nổi bật

**Nội dung (dạng icon + text):**

| Tính năng              | Mô tả                                            |
| ---------------------- | ------------------------------------------------ |
| 🔍 Barcode/QR Scanning | Quét mã để tra cứu nhanh thiết bị                |
| 📉 Auto Depreciation   | Tự động tính khấu hao (straight-line, declining) |
| ⚠️ Warranty Alerts     | Cảnh báo hết hạn bảo hành 30, 14, 7 ngày trước   |
| 📦 Bulk Operations     | Import/Export hàng loạt CSV/Excel                |
| 📝 Comprehensive Audit | Lưu vết mọi thao tác, retention 7 năm            |
| 🔐 Role-based Access   | Phân quyền chi tiết 3 cấp                        |
| 📊 Scheduled Reports   | Báo cáo tự động daily/weekly/monthly             |
| 🔎 Full-text Search    | Tìm kiếm nhanh với debounce 300ms                |
| 🌙 Dark/Light Mode     | Hỗ trợ chuyển đổi theme tự động                  |
| 📱 Multi-platform      | iOS, Android, Web từ một codebase                |

---

## SLIDE 19: BUSINESS RULES QUAN TRỌNG

**Tiêu đề:** Business Rules

**Device Management:**

- Serial number phải unique trong hệ thống
- Asset tag theo naming convention của tổ chức
- Purchase date không được trong tương lai

**Assignment:**

- Mỗi thiết bị chỉ có 1 assignment active tại một thời điểm
- Không thể xóa thiết bị đang được gán
- Assignment yêu cầu acknowledgment từ người nhận

**Security:**

- Khóa tài khoản sau 5 lần đăng nhập sai
- Session timeout sau 30 phút không hoạt động
- Audit log không thể sửa hoặc xóa (immutable)
- Lưu trữ audit log 7 năm

---

## SLIDE 20: YÊU CẦU PHI CHỨC NĂNG

**Tiêu đề:** Non-Functional Requirements

| Hạng mục         | Metric            | Target                           |
| ---------------- | ----------------- | -------------------------------- |
| **Performance**  | Page load time    | < 2 giây                         |
|                  | Search response   | < 1 giây                         |
|                  | Report generation | < 30 giây                        |
|                  | Concurrent users  | 1,000                            |
| **Security**     | Authentication    | JWT + Refresh token rotation     |
|                  | Password          | bcrypt hashing, complexity rules |
|                  | Data protection   | HTTPS, input validation          |
| **Availability** | Uptime            | 99.5%                            |
|                  | Data capacity     | 100,000 devices                  |
|                  | Backup            | Daily automated                  |
|                  | Recovery          | RPO: 24h, RTO: 4h                |

---

## SLIDE 21: TRẠNG THÁI DỰ ÁN

**Tiêu đề:** Trạng thái hiện tại

**Đã hoàn thành ✅:**

- Project setup (Expo SDK 54, TypeScript strict)
- Navigation structure (5 tabs + stack screens)
- Design system (colors, gradients, typography)
- 11+ screens UI hoàn chỉnh
- Reusable component library (8 components)
- Backend API (Node.js + Express + MongoDB) — 11 route groups, 14 controllers
- Database schema (13 collections)
- Authentication (JWT access + refresh token, bcrypt)
- API integration (15 services + apiClient)
- Role-based access control (3 roles)
- Error handling (network errors, token expiry, Vietnamese messages)
- Dark/Light mode + Multi-platform (iOS, Android, Web)

**Cần triển khai 🔲:**

- Barcode/QR scanning (expo-camera)
- File upload & document management
- Push notifications
- Offline support & data sync
- E2E testing & CI/CD pipeline
- Production deployment

---

## SLIDE 22: KẾ HOẠCH TRIỂN KHAI (8 Phases)

**Tiêu đề:** Roadmap — 8 giai đoạn

| Phase | Nội dung                                                   | Ưu tiên   |
| ----- | ---------------------------------------------------------- | --------- |
| 1     | Core Infrastructure — Project setup, DB schema             | 🔴 High   |
| 2     | Authentication — JWT, Middleware, RBAC                     | 🔴 High   |
| 3     | Device Management — CRUD, Search, Barcode, Bulk            | 🔴 High   |
| 4     | Assignment & Maintenance — Assign/Unassign, Tracking       | 🟡 Medium |
| 5     | Warranty & Depreciation — Warranty mgmt, Auto depreciation | 🟡 Medium |
| 6     | Reports & Audit — Report generation, Audit trail           | 🟡 Medium |
| 7     | Frontend — React Native screens (11+ screens)              | 🟡 Medium |
| 8     | Integration & Polish — E2E testing, Accessibility          | 🟢 Low    |

---

## SLIDE 23: DEMO / SCREENSHOTS

**Tiêu đề:** Demo ứng dụng

**Gợi ý nội dung slide:**

- Screenshot màn hình Login
- Screenshot Dashboard với stats & alerts
- Screenshot Device List với search & filter
- Screenshot Device Details
- Screenshot Maintenance với form modal
- Screenshot Admin Panel
- Screenshot Reports

_(Chèn ảnh chụp màn hình thực tế của ứng dụng)_

---

## SLIDE 24: KẾT LUẬN

**Tiêu đề:** Tổng kết

**Nội dung:**

- Hệ thống quản lý thiết bị điện tử toàn diện với 50 use cases
- Cross-platform: iOS, Android, Web từ một codebase React Native
- Kiến trúc 3 tầng: Mobile App → REST API → MongoDB
- Bảo mật: JWT + RBAC + Audit Trail
- 11+ màn hình, 15 services, 13 collections, 14 controllers
- Sẵn sàng mở rộng: barcode scanning, push notifications, offline support

**Cảm ơn!**

---

_Tổng cộng: 24 slides_
_Thời lượng trình bày gợi ý: 20–30 phút_
