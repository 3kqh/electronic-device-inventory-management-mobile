# Danh sách Tác vụ — Tích hợp Toàn bộ API Backend vào Mobile App

## Task 1: Cập nhật TypeScript Types

- [x] 1.1 Thêm types cho Warranty, WarrantyClaim, CreateWarrantyData, UpdateWarrantyData, CreateWarrantyClaimData, UpdateWarrantyClaimData vào `types/api.ts`
- [x] 1.2 Thêm types cho DepreciationRule, DeviceDepreciation, CategoryDepreciation, BatchUpdateResult, CreateDepreciationRuleData, UpdateDepreciationRuleData vào `types/api.ts`
- [x] 1.3 Thêm types cho Department, CreateDepartmentData, UpdateDepartmentData vào `types/api.ts`
- [x] 1.4 Thêm types cho AuditLog, AuditLogFilterParams vào `types/api.ts`
- [x] 1.5 Thêm types cho LocationFull, CreateLocationData, UpdateLocationData vào `types/api.ts`
- [x] 1.6 Thêm types cho DeviceCategoryFull, CreateCategoryData, UpdateCategoryData vào `types/api.ts`
- [x] 1.7 Thêm types cho CreateUserData, UpdateUserData, ChangePasswordData, UpdateProfileData vào `types/api.ts`
- [x] 1.8 Thêm types cho InventoryValueReport, MaintenanceReport, ReportConfig, CreateReportConfigData vào `types/api.ts`
- [x] 1.9 Thêm types cho SystemStats, BackupInfo, SystemLog vào `types/api.ts`

## Task 2: Tạo Service mới — warrantyService

- [x] 2.1 Tạo file `services/warrantyService.ts` với các method: getAll, getById, create, update, delete, getExpiring
- [x] 2.2 Thêm các method warranty claim: createClaim, getAllClaims, getClaimById, updateClaim, deleteClaim

## Task 3: Tạo Service mới — depreciationService

- [x] 3.1 Tạo file `services/depreciationService.ts` với các method: getAll, getRuleById, getRuleByCategory, create, update, delete
- [x] 3.2 Thêm các method tính khấu hao: calculateDeviceDepreciation, getCategoryDepreciation, batchUpdateValues

## Task 4: Tạo Service mới — departmentService

- [x] 4.1 Tạo file `services/departmentService.ts` với các method: getAll, getById, create, update, delete

## Task 5: Tạo Service mới — auditLogService

- [x] 5.1 Tạo file `services/auditLogService.ts` với các method: getAll (với filter params), exportCsv

## Task 6: Bổ sung method vào deviceService

- [x] 6.1 Thêm các method: advancedSearch, scanBarcode, generateBarcode, generateMultipleBarcodes vào `services/deviceService.ts`
- [x] 6.2 Thêm các method: printAssetLabel, bulkPrintAssetLabels vào `services/deviceService.ts`
- [x] 6.3 Thêm các method: bulkImportDevices, bulkExportDevices, bulkUpdateStatus, bulkUpdateLocation, disposeDevice vào `services/deviceService.ts`

## Task 7: Bổ sung method vào assignmentService

- [x] 7.1 Thêm các method: getAll, getById, update, unassign, transfer, acknowledge, getUserAssignments vào `services/assignmentService.ts`

## Task 8: Bổ sung method vào maintenanceService

- [x] 8.1 Thêm các method: getById, recordMaintenance, scheduleMaintenance, updateMaintenance, completeMaintenance, cancelMaintenance vào `services/maintenanceService.ts`

## Task 9: Bổ sung method vào các service còn lại

- [x] 9.1 Thêm các method: getById, create, update, delete vào `services/categoryService.ts`
- [x] 9.2 Thêm các method: getById, create, update, delete vào `services/locationService.ts`
- [x] 9.3 Thêm các method: create, update, delete, assignRole, deactivate vào `services/userService.ts`
- [x] 9.4 Thêm các method: changePassword, updateProfile, resetPassword, confirmResetPassword vào `services/authService.ts`
- [x] 9.5 Thêm các method: getInventoryValue, getMaintenance, generateCustomReport, createReportConfig, getReportConfigs, updateReportConfig, deleteReportConfig, exportReport vào `services/reportService.ts`
- [x] 9.6 Thêm các method: healthCheck, getStats, deleteSetting, createBackup, getBackupList, downloadBackup, deleteBackup, getSystemLogs vào `services/systemService.ts`

## Task 10: Cập nhật Theme màu xanh sáng hơn

- [x] 10.1 Cập nhật `constants/theme.ts`: primary → `#2563EB`, primaryDark → `#1D4ED8`
- [x] 10.2 Cập nhật gradient.primary, gradient.header trong `constants/theme.ts`
- [x] 10.3 Cập nhật Colors.light.tint và Colors.light.tabIconSelected sang giá trị primary mới
- [x] 10.4 Xác nhận dark mode accent `#60A5FA` giữ nguyên

## Task 11: Xây dựng màn hình Warranty Management

- [x] 11.1 Tạo file `app/warranty.tsx` với danh sách bảo hành, bộ lọc theo trạng thái (active, expired, expiring soon), nút tạo mới
- [x] 11.2 Tạo file `app/warranty-detail.tsx` với chi tiết bảo hành và danh sách warranty claims
- [x] 11.3 Đăng ký route warranty và warranty-detail trong `app/_layout.tsx`

## Task 12: Xây dựng màn hình Depreciation

- [x] 12.1 Tạo file `app/depreciation.tsx` với danh sách quy tắc khấu hao, form tạo mới, xem chi tiết
- [x] 12.2 Đăng ký route depreciation trong `app/_layout.tsx`

## Task 13: Xây dựng màn hình Department Management

- [x] 13.1 Tạo file `app/department.tsx` với danh sách phòng ban, form tạo/sửa, xóa với dialog xác nhận
- [x] 13.2 Đăng ký route department trong `app/_layout.tsx`

## Task 14: Xây dựng màn hình Location Management

- [x] 14.1 Tạo file `app/location-management.tsx` với danh sách vị trí phân cấp, form tạo/sửa, xóa với dialog xác nhận
- [x] 14.2 Đăng ký route location-management trong `app/_layout.tsx`

## Task 15: Xây dựng màn hình Audit Logs

- [x] 15.1 Tạo file `app/audit-logs.tsx` với danh sách nhật ký, phân trang, bộ lọc (hành động, người dùng, khoảng thời gian)
- [x] 15.2 Đăng ký route audit-logs trong `app/_layout.tsx`

## Task 16: Xây dựng màn hình Profile và Đổi Mật khẩu

- [x] 16.1 Tạo file `app/profile.tsx` với hiển thị thông tin cá nhân, form chỉnh sửa hồ sơ, form đổi mật khẩu
- [x] 16.2 Đăng ký route profile trong `app/_layout.tsx`

## Task 17: Xây dựng màn hình Category Management

- [x] 17.1 Tạo file `app/category-management.tsx` với danh sách danh mục, form tạo/sửa với custom fields, xóa với dialog xác nhận
- [x] 17.2 Đăng ký route category-management trong `app/_layout.tsx`

## Task 18: Cập nhật Navigation — thêm điều hướng đến màn hình mới

- [x] 18.1 Cập nhật màn hình Admin (`app/(tabs)/admin.tsx`) thêm nút điều hướng đến: Department, Location, Category, Audit Logs, Profile
- [x] 18.2 Cập nhật màn hình phù hợp thêm nút điều hướng đến: Warranty, Depreciation

## Task 19: Viết Property-Based Tests

- [ ] 19.1 Cài đặt fast-check và cấu hình test environment
- [ ] 19.2 Viết property test cho Property 1: Service method gọi đúng endpoint (Feature: mobile-api-full-integration, Property 1: Service method gọi đúng endpoint)
- [ ] 19.3 Viết property test cho Property 5: Tỷ lệ tương phản WCAG AA (Feature: mobile-api-full-integration, Property 5: Tỷ lệ tương phản WCAG AA)
- [ ] 19.4 Viết property test cho Property 6: Không còn màu primary cũ trong gradient (Feature: mobile-api-full-integration, Property 6: Không còn màu primary cũ trong gradient)
- [ ] 19.5 Viết property test cho Property 4: Tham số lọc được truyền chính xác (Feature: mobile-api-full-integration, Property 4: Tham số lọc được truyền chính xác)
- [ ] 19.6 Viết property test cho Property 7: Barcode scan gọi đúng endpoint (Feature: mobile-api-full-integration, Property 7: Barcode scan gọi đúng endpoint)
