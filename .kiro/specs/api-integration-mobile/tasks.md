# Kế hoạch Triển khai: Tích hợp API Backend vào Mobile App

## Tổng quan

Triển khai tích hợp API backend vào ứng dụng mobile React Native/Expo theo kiến trúc service layer. Bắt đầu từ hạ tầng cốt lõi (types, config, token manager, API client), sau đó xác thực, rồi tích hợp từng màn hình. Chỉ sửa đổi phía mobile app (`electronic-device-inventory-management/`), không thay đổi backend.

## Tasks

- [x] 1. Thiết lập types, config, và hạ tầng cốt lõi
  - [x] 1.1 Tạo file `types/api.ts` với tất cả TypeScript type definitions
    - Định nghĩa các types: `Device`, `User`, `MaintenanceRecord`, `Assignment`, `DeviceCategory`, `Location`, `PaginatedResponse`, `ApiErrorResponse`, `SignInResponse`, `DeviceStatusReport`, `WarrantyAlert`, và các enum types (`DeviceStatus`, `UserRole`, `MaintenanceStatus`, v.v.)
    - Tham chiếu đầy đủ từ phần Mô hình Dữ liệu trong design document
    - _Yêu cầu: 1.5, 4.1, 5.1, 7.1, 9.2_

  - [x] 1.2 Tạo file `config/api.ts` với cấu hình API base URL
    - Export `API_BASE_URL` từ biến môi trường hoặc giá trị mặc định
    - _Yêu cầu: 1.1_

  - [x] 1.3 Tạo `services/tokenManager.ts` - quản lý JWT tokens
    - Implement các hàm: `getAccessToken`, `getRefreshToken`, `saveTokens`, `clearTokens`, `hasTokens`
    - Sử dụng `expo-secure-store` để lưu trữ token an toàn
    - _Yêu cầu: 1.2, 2.2, 2.6_

  - [ ]\* 1.4 Viết property test cho Token Manager
    - **Property 4: Token storage round-trip**
    - **Validates: Yêu cầu 2.2, 2.6**

  - [x] 1.5 Tạo `services/apiClient.ts` - HTTP client tập trung
    - Implement wrapper quanh `fetch` với các phương thức `get`, `post`, `put`, `patch`, `delete`
    - Tự động đính kèm `Authorization: Bearer <token>` vào header cho mọi request
    - Xử lý auto-refresh token khi nhận 401 với concurrent refresh protection (flag `isRefreshing` + `failedQueue`)
    - Gọi `onUnauthorized` callback khi refresh thất bại
    - Parse error response thành `ApiError` object thống nhất
    - _Yêu cầu: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3_

  - [ ]\* 1.6 Viết property test cho API Client - URL construction
    - **Property 1: URL construction**
    - **Validates: Yêu cầu 1.1**

  - [ ]\* 1.7 Viết property test cho API Client - Token attachment
    - **Property 2: Token attachment to authenticated requests**
    - **Validates: Yêu cầu 1.2**

  - [ ]\* 1.8 Viết property test cho API Client - Auto-refresh
    - **Property 3: Auto-refresh and cleanup on token expiry**
    - **Validates: Yêu cầu 1.3, 1.4**

  - [ ]\* 1.9 Viết property test cho Error classification
    - **Property 7: Error response classification**
    - **Validates: Yêu cầu 4.7, 11.1, 11.2, 11.3**

- [x] 2. Checkpoint - Kiểm tra hạ tầng cốt lõi
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Xác thực và Auth Context
  - [x] 3.1 Tạo `services/authService.ts`
    - Implement: `signIn(email, password)`, `signOut()`, `getProfile()`, `register(data)`
    - Gọi đúng endpoints: `POST /api/auth/signin`, `POST /api/auth/signout`, `GET /api/auth/me`, `POST /api/auth/register`
    - _Yêu cầu: 2.1, 2.6, 2.7, 9.3_

  - [x] 3.2 Tạo `contexts/AuthContext.tsx` - React Context cho auth state
    - Cung cấp: `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `checkAuth()`
    - Khi login thành công: lưu tokens qua tokenManager, cập nhật user state
    - Khi logout: gọi authService.signOut, xóa tokens, reset state
    - Khi app khởi động: kiểm tra token đã lưu, gọi `getProfile()` để xác thực phiên
    - Kết nối `apiClient.setOnUnauthorized` để tự động logout khi refresh token thất bại
    - _Yêu cầu: 2.2, 2.3, 2.6, 2.7, 2.8, 12.4_

  - [ ]\* 3.3 Viết property test cho Auth state consistency
    - **Property 5: Auth state consistency after login**
    - **Validates: Yêu cầu 2.3**

  - [x] 3.4 Tạo helper `utils/permissions.ts` cho phân quyền theo role
    - Implement hàm xác định quyền dựa trên role: `canAccessAdmin(role)`, `canCRUDDevices(role)`, `hasPermission(role, action)`
    - Role "staff" → không có quyền admin, không có quyền CRUD thiết bị
    - Role "admin" hoặc "inventory_manager" → đầy đủ quyền
    - _Yêu cầu: 9.4, 10.4, 12.1, 12.2, 12.3_

  - [ ]\* 3.5 Viết property test cho Role-based visibility
    - **Property 8: Role-based UI visibility**
    - **Validates: Yêu cầu 9.4, 10.4, 12.1, 12.2, 12.3**

  - [x] 3.6 Cập nhật `app/_layout.tsx` - Wrap app với AuthProvider
    - Bọc toàn bộ app trong `<AuthProvider>`
    - Thêm logic điều hướng: nếu chưa đăng nhập → login screen, nếu đã đăng nhập → tabs
    - _Yêu cầu: 2.3, 2.7, 2.8_

  - [x] 3.7 Cập nhật `app/login.tsx` - Kết nối với Auth API thực
    - Thay thế logic đăng nhập mock bằng `AuthContext.login(email, password)`
    - Hiển thị lỗi cụ thể từ API (sai credentials, tài khoản bị khóa)
    - Hiển thị loading state khi đang xử lý
    - _Yêu cầu: 2.1, 2.4, 2.5_

- [x] 4. Checkpoint - Kiểm tra luồng xác thực
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Service layer cho các domain
  - [x] 5.1 Tạo `services/deviceService.ts`
    - Implement: `getAll(params)`, `getById(id)`, `search(query)`, `filter(status)`, `create(data)`, `update(id, data)`, `delete(id)`
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]\* 5.2 Viết property test cho Device service query parameters
    - **Property 6: Device service query parameter construction**
    - **Validates: Yêu cầu 4.1, 4.2, 4.3**

  - [x] 5.3 Tạo `services/categoryService.ts` và `services/locationService.ts`
    - categoryService: `getAll()` → `GET /api/categories`
    - locationService: `getAll()` → `GET /api/locations`
    - _Yêu cầu: 4.8, 4.9_

  - [x] 5.4 Tạo `services/maintenanceService.ts`
    - Implement: `getAll()`, `getUpcoming()`, `getHistory(deviceId)`, `requestMaintenance(data)`
    - _Yêu cầu: 7.1, 3.3, 5.3, 7.4_

  - [x] 5.5 Tạo `services/assignmentService.ts`
    - Implement: `assign(data)`, `getHistory(deviceId)`
    - _Yêu cầu: 6.2, 5.2_

  - [x] 5.6 Tạo `services/userService.ts`
    - Implement: `getAll()`, `getById(id)`
    - _Yêu cầu: 6.1, 9.1_

  - [x] 5.7 Tạo `services/reportService.ts`
    - Implement: `getDeviceStatus()`, `getAssignments()`, `getWarranty()`, `getWarrantyAlerts()`, `getDepreciation()`
    - _Yêu cầu: 3.2, 8.1, 8.2, 8.3, 8.4_

  - [x] 5.8 Tạo `services/systemService.ts`
    - Implement: `getSettings()`, `updateSetting(key, value)`
    - _Yêu cầu: 10.1, 10.2_

- [x] 6. Custom hook và utility functions
  - [x] 6.1 Tạo `hooks/useApiData.ts` - Generic data fetching hook
    - Quản lý state: `data`, `loading`, `error`, `refetch`
    - Hỗ trợ loading indicator và error state cho tất cả màn hình
    - _Yêu cầu: 3.6, 8.5, 11.4, 11.5_

  - [x] 6.2 Tạo `utils/filters.ts` - Hàm lọc client-side
    - Hàm lọc nhân viên theo tên hoặc phòng ban (case-insensitive)
    - Hàm lọc user theo role
    - _Yêu cầu: 6.5, 9.5_

  - [ ]\* 6.3 Viết property test cho Employee filter
    - **Property 9: Client-side employee filter by name or department**
    - **Validates: Yêu cầu 6.5**

  - [ ]\* 6.4 Viết property test cho User role filter
    - **Property 10: Client-side user filter by role**
    - **Validates: Yêu cầu 9.5**

  - [x] 6.5 Tạo `utils/maintenanceUtils.ts` - Hàm đếm maintenance theo status
    - Hàm đếm số lượng pending, completed, scheduled từ danh sách records
    - _Yêu cầu: 7.2_

  - [ ]\* 6.6 Viết property test cho Maintenance count
    - **Property 11: Maintenance record count by status**
    - **Validates: Yêu cầu 7.2**

  - [x] 6.7 Tạo `utils/userUtils.ts` - Hàm format user display data
    - Hàm format tên đầy đủ, đảm bảo hiển thị đủ: tên, email, role, status
    - _Yêu cầu: 9.2_

  - [ ]\* 6.8 Viết property test cho User display completeness
    - **Property 12: User display data completeness**
    - **Validates: Yêu cầu 9.2**

- [x] 7. Checkpoint - Kiểm tra service layer và utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Tích hợp màn hình Dashboard
  - [x] 8.1 Cập nhật `app/(tabs)/index.tsx` - Dashboard với dữ liệu thực
    - Gọi `deviceService.getAll()` để lấy tổng số thiết bị và số lượng theo trạng thái
    - Gọi `reportService.getWarrantyAlerts()` để lấy cảnh báo bảo hành
    - Gọi `maintenanceService.getUpcoming()` để lấy bảo trì sắp tới
    - Hiển thị danh sách thiết bị gần đây từ API
    - Hiển thị tên và role người dùng từ AuthContext trong header
    - Hiển thị loading indicator cho từng section
    - Thay thế toàn bộ dữ liệu hardcoded
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Tích hợp màn hình Devices
  - [x] 9.1 Cập nhật `app/(tabs)/devices.tsx` - Danh sách thiết bị với API
    - Gọi `deviceService.getAll()` với pagination
    - Tích hợp tìm kiếm với `deviceService.search()` và debounce 300ms
    - Tích hợp bộ lọc trạng thái với `deviceService.filter()`
    - Hiển thị loading state và error state với nút "Thử lại"
    - _Yêu cầu: 4.1, 4.2, 4.3, 11.4, 11.5_

  - [x] 9.2 Cập nhật `app/device-details.tsx` - Chi tiết thiết bị với API
    - Gọi `deviceService.getById(id)` để hiển thị thông tin chi tiết
    - Gọi `assignmentService.getHistory(deviceId)` để hiển thị lịch sử gán
    - Gọi `maintenanceService.getHistory(deviceId)` để hiển thị lịch sử bảo trì
    - Hiển thị thông tin bảo hành thực từ dữ liệu thiết bị
    - Nút "Assign" điều hướng đến màn hình Assignment với deviceId
    - _Yêu cầu: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 9.3 Cập nhật `app/device-form.tsx` - Form thêm/sửa thiết bị với API
    - Gọi `categoryService.getAll()` để lấy danh sách category thực cho dropdown
    - Gọi `locationService.getAll()` để lấy danh sách location thực cho dropdown
    - Gọi `deviceService.create()` khi thêm mới hoặc `deviceService.update()` khi sửa
    - Hiển thị lỗi validation từ API bên cạnh trường nhập liệu
    - _Yêu cầu: 4.5, 4.6, 4.7, 4.8, 4.9_

- [x] 10. Tích hợp màn hình Assignment
  - [x] 10.1 Cập nhật `app/assignment.tsx` - Gán thiết bị với API
    - Gọi `userService.getAll()` để lấy danh sách nhân viên thực
    - Tích hợp tìm kiếm nhân viên client-side (lọc theo tên hoặc phòng ban) sử dụng `utils/filters.ts`
    - Gọi `assignmentService.assign()` khi gán thiết bị
    - Hiển thị thông báo thành công và quay lại màn hình trước
    - Hiển thị lỗi cụ thể khi gán thất bại
    - _Yêu cầu: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Tích hợp màn hình Maintenance
  - [x] 11.1 Cập nhật `app/(tabs)/maintenance.tsx` - Bảo trì với API
    - Gọi `maintenanceService.getAll()` để lấy danh sách bản ghi bảo trì
    - Hiển thị số lượng pending, completed, scheduled từ API sử dụng `utils/maintenanceUtils.ts`
    - Tích hợp form tạo yêu cầu bảo trì với `maintenanceService.requestMaintenance()`
    - Refresh danh sách sau khi tạo thành công
    - Hiển thị lỗi cụ thể khi tạo thất bại
    - _Yêu cầu: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 12. Tích hợp màn hình Reports
  - [x] 12.1 Cập nhật `app/(tabs)/reports.tsx` - Báo cáo với API
    - Gọi `reportService.getDeviceStatus()` cho Inventory Report
    - Gọi `reportService.getAssignments()` cho Assignment Report
    - Gọi `reportService.getWarranty()` cho Warranty Report
    - Gọi `reportService.getDepreciation()` cho Depreciation Report
    - Hiển thị loading indicator cho từng báo cáo
    - Hiển thị thông báo không đủ quyền nếu cần
    - _Yêu cầu: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 13. Tích hợp màn hình Admin
  - [x] 13.1 Cập nhật `app/(tabs)/admin.tsx` - Phân quyền Admin tab
    - Sử dụng `permissions.ts` để kiểm tra quyền admin
    - Ẩn tab hoặc hiển thị thông báo không đủ quyền cho role "staff"
    - _Yêu cầu: 9.4, 12.1, 12.2_

  - [x] 13.2 Cập nhật `app/user-management.tsx` - Quản lý người dùng với API
    - Gọi `userService.getAll()` để lấy danh sách người dùng thực
    - Hiển thị tên, email, role, status từ API sử dụng `utils/userUtils.ts`
    - Tích hợp form đăng ký user mới với `authService.register()`
    - Lọc theo role phía client sử dụng `utils/filters.ts`
    - Bảo vệ route: redirect về Dashboard nếu không có quyền admin
    - _Yêu cầu: 9.1, 9.2, 9.3, 9.4, 9.5, 12.3_

  - [x] 13.3 Cập nhật `app/system-settings.tsx` - Cài đặt hệ thống với API
    - Gọi `systemService.getSettings()` để lấy cài đặt hiện tại
    - Gọi `systemService.updateSetting()` khi thay đổi cài đặt
    - Hiển thị thông báo thành công/thất bại
    - Vô hiệu hóa chỉnh sửa cho user không phải admin
    - _Yêu cầu: 10.1, 10.2, 10.3, 10.4_

- [x] 14. Xử lý lỗi và trạng thái mạng toàn app
  - [x] 14.1 Cập nhật tất cả màn hình với error handling thống nhất
    - Đảm bảo mọi màn hình hiển thị "Không có kết nối mạng" + nút "Thử lại" khi lỗi mạng
    - Đảm bảo hiển thị loading state (spinner) khi chờ response
    - Đảm bảo hiển thị empty state với nút "Thử lại" khi tải thất bại
    - Đảm bảo lỗi validation (4xx) hiển thị message cụ thể từ response
    - _Yêu cầu: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 14.2 Cập nhật `app/(tabs)/_layout.tsx` - Phân quyền tab navigation
    - Ẩn tab Admin cho role "staff" dựa trên AuthContext
    - Hiển thị đầy đủ tabs cho role "admin" và "inventory_manager"
    - _Yêu cầu: 12.1, 12.2, 12.4_

- [x] 15. Checkpoint cuối - Kiểm tra toàn bộ tích hợp
  - Ensure all tests pass, ask the user if questions arise.

## Ghi chú

- Các task đánh dấu `*` là tùy chọn và có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu đến yêu cầu cụ thể để đảm bảo truy vết
- Các checkpoint đảm bảo kiểm tra tăng dần sau mỗi giai đoạn
- Property tests xác minh tính đúng đắn phổ quát, unit tests kiểm tra ví dụ cụ thể và edge cases
- Chỉ sửa đổi code trong `electronic-device-inventory-management/`, KHÔNG thay đổi backend
