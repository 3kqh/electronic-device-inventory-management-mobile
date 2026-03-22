# Tài liệu Yêu cầu — Tích hợp Toàn bộ API Backend vào Mobile App

## Giới thiệu

Hệ thống quản lý thiết bị điện tử hiện có backend Node.js/Express với 13 nhóm API route, nhưng ứng dụng mobile React Native (Expo) chỉ tích hợp một phần. Tài liệu này mô tả yêu cầu để tích hợp toàn bộ API còn thiếu, xây dựng các màn hình mới cần thiết, và cập nhật màu xanh (blue) của theme sáng hơn.

## Bảng thuật ngữ

- **Mobile_App**: Ứng dụng React Native/Expo tại `electronic-device-inventory-management/`
- **Backend_API**: Server Node.js/Express tại `Electronic-Device-Inventory-Management/src/`
- **Service_Layer**: Các file TypeScript trong `services/` của Mobile_App gọi đến Backend_API
- **Theme_System**: Hệ thống màu sắc định nghĩa trong `constants/theme.ts`
- **Admin_User**: Người dùng có role `admin`
- **Manager_User**: Người dùng có role `inventory_manager`
- **Staff_User**: Người dùng có role `staff`
- **Warranty_Service**: Module service mới quản lý bảo hành thiết bị
- **Depreciation_Service**: Module service mới quản lý khấu hao thiết bị
- **Department_Service**: Module service mới quản lý phòng ban
- **AuditLog_Service**: Module service mới quản lý nhật ký hệ thống

## Yêu cầu

### Yêu cầu 1: Tích hợp API Bảo hành (Warranty)

**User Story:** Là một Manager_User, tôi muốn quản lý bảo hành thiết bị trên mobile, để theo dõi tình trạng bảo hành và xử lý yêu cầu bảo hành mọi lúc mọi nơi.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL cung cấp Warranty_Service với các phương thức gọi đến tất cả endpoint bảo hành của Backend_API: tạo, xem danh sách, xem chi tiết, cập nhật, xóa bảo hành, và xem bảo hành sắp hết hạn
2. THE Mobile_App SHALL cung cấp Warranty_Service với các phương thức gọi đến tất cả endpoint warranty claim của Backend_API: tạo, xem danh sách, xem chi tiết, cập nhật, xóa warranty claim
3. WHEN người dùng mở màn hình Warranty, THE Mobile_App SHALL hiển thị danh sách tất cả bảo hành với thông tin thiết bị, nhà cung cấp, ngày hết hạn và trạng thái
4. WHEN Manager_User nhấn nút tạo bảo hành mới, THE Mobile_App SHALL hiển thị form nhập thông tin bảo hành và gửi request POST đến Backend_API
5. WHEN người dùng nhấn vào một bảo hành, THE Mobile_App SHALL hiển thị chi tiết bảo hành bao gồm danh sách warranty claims liên quan
6. WHEN Manager_User nhấn nút tạo warranty claim, THE Mobile_App SHALL hiển thị form nhập thông tin claim và gửi request POST đến Backend_API
7. IF Backend_API trả về lỗi khi thao tác bảo hành, THEN THE Mobile_App SHALL hiển thị thông báo lỗi rõ ràng cho người dùng

### Yêu cầu 2: Tích hợp API Khấu hao (Depreciation)

**User Story:** Là một Manager_User, tôi muốn xem thông tin khấu hao thiết bị trên mobile, để đánh giá giá trị tài sản hiện tại.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL cung cấp Depreciation_Service với các phương thức gọi đến tất cả endpoint khấu hao của Backend_API: CRUD quy tắc khấu hao, tính khấu hao thiết bị, xem khấu hao theo danh mục, và cập nhật hàng loạt giá trị
2. WHEN người dùng mở màn hình Depreciation, THE Mobile_App SHALL hiển thị danh sách quy tắc khấu hao với thông tin danh mục, phương pháp, thời gian sử dụng và tỷ lệ khấu hao
3. WHEN Manager_User nhấn nút tạo quy tắc khấu hao mới, THE Mobile_App SHALL hiển thị form nhập thông tin và gửi request POST đến Backend_API
4. WHEN người dùng xem chi tiết thiết bị, THE Mobile_App SHALL hiển thị thông tin khấu hao tính toán từ Backend_API bao gồm giá trị hiện tại và lịch khấu hao
5. IF Backend_API trả về lỗi khi tính khấu hao, THEN THE Mobile_App SHALL hiển thị thông báo lỗi và giá trị mặc định "N/A"

### Yêu cầu 3: Tích hợp API Phòng ban (Department)

**User Story:** Là một Admin_User, tôi muốn quản lý phòng ban trên mobile, để cập nhật cơ cấu tổ chức nhanh chóng.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL cung cấp Department_Service với các phương thức gọi đến tất cả endpoint phòng ban của Backend_API: tạo, xem danh sách, xem chi tiết, cập nhật, xóa phòng ban
2. WHEN Admin_User mở màn hình Department Management, THE Mobile_App SHALL hiển thị danh sách phòng ban với tên, mã và mô tả
3. WHEN Admin_User nhấn nút tạo phòng ban mới, THE Mobile_App SHALL hiển thị form nhập thông tin phòng ban và gửi request POST đến Backend_API
4. WHEN Admin_User nhấn nút xóa phòng ban, THE Mobile_App SHALL hiển thị dialog xác nhận trước khi gửi request DELETE đến Backend_API
5. IF Backend_API trả về lỗi khi xóa phòng ban đang có nhân viên, THEN THE Mobile_App SHALL hiển thị thông báo lỗi giải thích lý do không thể xóa

### Yêu cầu 4: Tích hợp API Nhật ký Hệ thống (Audit Log)

**User Story:** Là một Admin_User, tôi muốn xem nhật ký hoạt động hệ thống trên mobile, để giám sát các thay đổi quan trọng.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL cung cấp AuditLog_Service với các phương thức gọi đến tất cả endpoint audit log của Backend_API: xem danh sách và xuất CSV
2. WHEN Admin_User mở màn hình Audit Logs, THE Mobile_App SHALL hiển thị danh sách nhật ký với thông tin hành động, người thực hiện, thời gian và đối tượng bị ảnh hưởng
3. WHEN Admin_User sử dụng bộ lọc, THE Mobile_App SHALL gửi tham số lọc đến Backend_API và hiển thị kết quả phù hợp
4. IF Backend_API trả về danh sách rỗng, THEN THE Mobile_App SHALL hiển thị thông báo "Không có nhật ký nào"

### Yêu cầu 5: Hoàn thiện API Quản lý Thiết bị (Device) còn thiếu

**User Story:** Là một Manager_User, tôi muốn sử dụng đầy đủ tính năng quản lý thiết bị trên mobile, bao gồm quét barcode, in nhãn và thao tác hàng loạt.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào deviceService các phương thức: advancedSearch, scanBarcode, generateBarcode, generateMultipleBarcodes, printAssetLabel, bulkPrintAssetLabels, bulkImportDevices, bulkExportDevices, bulkUpdateStatus, bulkUpdateLocation, và disposeDevice
2. WHEN người dùng quét barcode/QR code, THE Mobile_App SHALL gửi mã quét đến endpoint `/devices/barcode/scan/:code` và hiển thị thông tin thiết bị tương ứng
3. WHEN Manager_User chọn thao tác hàng loạt trên danh sách thiết bị, THE Mobile_App SHALL hiển thị giao diện chọn nhiều thiết bị và các tùy chọn: cập nhật trạng thái, cập nhật vị trí, xuất dữ liệu, in nhãn
4. WHEN Manager_User nhấn nút thanh lý thiết bị, THE Mobile_App SHALL hiển thị dialog xác nhận và gửi request PATCH đến endpoint `/devices/:id/dispose`
5. IF thao tác hàng loạt thất bại cho một số thiết bị, THEN THE Mobile_App SHALL hiển thị danh sách thiết bị thành công và thất bại

### Yêu cầu 6: Hoàn thiện API Giao việc (Assignment) còn thiếu

**User Story:** Là một Manager_User, tôi muốn quản lý đầy đủ việc giao và thu hồi thiết bị trên mobile.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào assignmentService các phương thức: getAll, getById, update, unassign, transfer, acknowledge, và getUserAssignments
2. WHEN Manager_User mở danh sách giao việc, THE Mobile_App SHALL hiển thị tất cả assignment với thông tin thiết bị, người nhận, ngày giao và trạng thái
3. WHEN Manager_User nhấn nút thu hồi thiết bị, THE Mobile_App SHALL gửi request DELETE đến Backend_API và cập nhật danh sách
4. WHEN Manager_User nhấn nút chuyển thiết bị, THE Mobile_App SHALL hiển thị form chọn người nhận mới và gửi request POST transfer đến Backend_API
5. WHEN Staff_User nhấn nút xác nhận nhận thiết bị, THE Mobile_App SHALL gửi request PATCH acknowledge đến Backend_API

### Yêu cầu 7: Hoàn thiện API Bảo trì (Maintenance) còn thiếu

**User Story:** Là một Manager_User, tôi muốn quản lý đầy đủ quy trình bảo trì trên mobile, bao gồm lên lịch, ghi nhận và hoàn thành bảo trì.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào maintenanceService các phương thức: getById, recordMaintenance, scheduleMaintenance, updateMaintenance, completeMaintenance, và cancelMaintenance
2. WHEN Manager_User nhấn nút ghi nhận bảo trì đã hoàn thành, THE Mobile_App SHALL hiển thị form nhập thông tin và gửi request POST đến endpoint `/maintenance/record`
3. WHEN Manager_User nhấn nút lên lịch bảo trì, THE Mobile_App SHALL hiển thị form chọn ngày và gửi request POST đến endpoint `/maintenance/schedule`
4. WHEN Manager_User nhấn nút hoàn thành bảo trì, THE Mobile_App SHALL gửi request PATCH đến endpoint `/maintenance/:id/complete` với thông tin chi phí và ghi chú
5. WHEN Manager_User nhấn nút hủy bảo trì, THE Mobile_App SHALL hiển thị dialog xác nhận và gửi request PATCH đến endpoint `/maintenance/:id/cancel`

### Yêu cầu 8: Hoàn thiện API Danh mục Thiết bị (Category) còn thiếu

**User Story:** Là một Admin_User, tôi muốn quản lý danh mục thiết bị trên mobile, để thêm, sửa, xóa danh mục.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào categoryService các phương thức: getById, create, update, và delete
2. WHEN Admin_User mở màn hình Category Management, THE Mobile_App SHALL hiển thị danh sách danh mục với tên, mã, mô tả và số lượng custom fields
3. WHEN Admin_User nhấn nút tạo danh mục mới, THE Mobile_App SHALL hiển thị form nhập thông tin danh mục bao gồm custom fields và gửi request POST đến Backend_API
4. WHEN Admin_User nhấn nút xóa danh mục, THE Mobile_App SHALL hiển thị dialog xác nhận trước khi gửi request DELETE đến Backend_API

### Yêu cầu 9: Hoàn thiện API Vị trí (Location) còn thiếu

**User Story:** Là một Manager_User, tôi muốn quản lý vị trí (tòa nhà, tầng, phòng) trên mobile.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào locationService các phương thức: getById, create, update, và delete
2. WHEN Manager_User mở màn hình Location Management, THE Mobile_App SHALL hiển thị danh sách vị trí dạng phân cấp (tòa nhà > tầng > phòng)
3. WHEN Manager_User nhấn nút tạo vị trí mới, THE Mobile_App SHALL hiển thị form nhập thông tin vị trí bao gồm loại (building/floor/room) và vị trí cha
4. WHEN Manager_User nhấn nút xóa vị trí, THE Mobile_App SHALL hiển thị dialog xác nhận trước khi gửi request DELETE đến Backend_API

### Yêu cầu 10: Hoàn thiện API Người dùng (User) còn thiếu

**User Story:** Là một Admin_User, tôi muốn quản lý đầy đủ người dùng trên mobile, bao gồm tạo, sửa, xóa, phân quyền và vô hiệu hóa tài khoản.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào userService các phương thức: create, update, delete, assignRole, và deactivate
2. WHEN Admin_User nhấn nút tạo người dùng mới trên màn hình User Management, THE Mobile_App SHALL hiển thị form nhập thông tin và gửi request POST đến Backend_API
3. WHEN Admin_User nhấn nút chỉnh sửa người dùng, THE Mobile_App SHALL hiển thị form cập nhật thông tin và gửi request PUT đến Backend_API
4. WHEN Admin_User nhấn nút phân quyền, THE Mobile_App SHALL hiển thị danh sách role (admin, inventory_manager, staff) và gửi request PATCH đến endpoint `/users/:id/role`
5. WHEN Admin_User nhấn nút vô hiệu hóa tài khoản, THE Mobile_App SHALL hiển thị dialog xác nhận và gửi request PATCH đến endpoint `/users/:id/deactivate`

### Yêu cầu 11: Hoàn thiện API Xác thực (Auth) còn thiếu

**User Story:** Là một người dùng, tôi muốn đổi mật khẩu, cập nhật hồ sơ cá nhân và đặt lại mật khẩu trên mobile.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào authService các phương thức: changePassword, updateProfile, resetPassword, và confirmResetPassword
2. WHEN người dùng mở màn hình Profile, THE Mobile_App SHALL hiển thị thông tin cá nhân và cho phép cập nhật firstName, lastName, email
3. WHEN người dùng nhấn nút đổi mật khẩu, THE Mobile_App SHALL hiển thị form nhập mật khẩu cũ và mật khẩu mới, gửi request PUT đến endpoint `/auth/change-password`
4. WHEN người dùng nhấn "Quên mật khẩu" trên màn hình đăng nhập, THE Mobile_App SHALL hiển thị form nhập email và gửi request POST đến endpoint `/auth/reset-password`
5. IF Backend_API trả về lỗi mật khẩu cũ không đúng, THEN THE Mobile_App SHALL hiển thị thông báo "Mật khẩu hiện tại không chính xác"

### Yêu cầu 12: Hoàn thiện API Báo cáo (Report) còn thiếu

**User Story:** Là một Manager_User, tôi muốn xem đầy đủ các loại báo cáo trên mobile, bao gồm báo cáo giá trị tồn kho, bảo trì và xuất báo cáo.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào reportService các phương thức: getInventoryValue, getMaintenance, generateCustomReport, createReportConfig, getReportConfigs, updateReportConfig, deleteReportConfig, và exportReport
2. WHEN Manager_User chọn báo cáo Inventory Value, THE Mobile_App SHALL gọi endpoint `/reports/inventory-value` và hiển thị tổng giá trị tài sản
3. WHEN Manager_User chọn báo cáo Maintenance, THE Mobile_App SHALL gọi endpoint `/reports/maintenance` và hiển thị thống kê bảo trì
4. WHEN Manager_User nhấn nút xuất báo cáo, THE Mobile_App SHALL gửi request POST đến endpoint `/reports/export` và thông báo kết quả

### Yêu cầu 13: Hoàn thiện API Hệ thống (System) còn thiếu

**User Story:** Là một Admin_User, tôi muốn xem thống kê hệ thống, quản lý backup và xem log trên mobile.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL bổ sung vào systemService các phương thức: healthCheck, getStats, deleteSetting, createBackup, getBackupList, downloadBackup, deleteBackup, và getSystemLogs
2. WHEN Admin_User mở màn hình System Settings, THE Mobile_App SHALL hiển thị thống kê database (số lượng thiết bị, người dùng, v.v.) từ endpoint `/system/stats`
3. WHEN Admin_User nhấn nút tạo backup, THE Mobile_App SHALL gửi request POST đến endpoint `/system/backup/create` và hiển thị kết quả
4. WHEN Admin_User mở phần System Logs, THE Mobile_App SHALL hiển thị danh sách log từ endpoint `/system/logs`

### Yêu cầu 14: Cập nhật Theme Màu Xanh Sáng hơn

**User Story:** Là một người dùng, tôi muốn giao diện ứng dụng có màu xanh sáng hơn, để trải nghiệm sử dụng dễ chịu và hiện đại hơn.

#### Tiêu chí chấp nhận

1. THE Theme_System SHALL cập nhật giá trị `primary` từ `#1E3A8A` (xanh đậm) sang một giá trị sáng hơn trong dải `#2563EB` đến `#3B82F6`
2. THE Theme_System SHALL cập nhật giá trị `primaryDark` tương ứng để duy trì độ tương phản phù hợp
3. THE Theme_System SHALL cập nhật tất cả gradient sử dụng màu primary cũ sang giá trị mới
4. THE Theme_System SHALL đảm bảo tỷ lệ tương phản giữa text trắng và màu primary mới đạt tối thiểu 4.5:1 theo tiêu chuẩn WCAG AA
5. WHILE người dùng sử dụng dark mode, THE Theme_System SHALL giữ nguyên màu accent hiện tại `#60A5FA` cho dark mode

### Yêu cầu 15: Xây dựng Màn hình Quản lý Bảo hành

**User Story:** Là một người dùng, tôi muốn có màn hình riêng để xem và quản lý bảo hành thiết bị trên mobile.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Warranty Management hiển thị danh sách bảo hành với khả năng lọc theo trạng thái (active, expired, expiring soon)
2. WHEN Manager_User nhấn nút thêm bảo hành, THE Mobile_App SHALL hiển thị form modal với các trường: thiết bị, loại bảo hành, nhà cung cấp, ngày bắt đầu, ngày kết thúc, phạm vi bảo hành, chi phí
3. WHEN người dùng nhấn vào một bảo hành, THE Mobile_App SHALL điều hướng đến màn hình chi tiết bảo hành hiển thị thông tin đầy đủ và danh sách claims
4. THE Mobile_App SHALL đăng ký route mới cho màn hình Warranty trong navigation stack

### Yêu cầu 16: Xây dựng Màn hình Khấu hao

**User Story:** Là một Manager_User, tôi muốn có màn hình riêng để xem quy tắc khấu hao và giá trị khấu hao thiết bị.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Depreciation hiển thị danh sách quy tắc khấu hao theo danh mục thiết bị
2. WHEN Manager_User nhấn nút thêm quy tắc, THE Mobile_App SHALL hiển thị form modal với các trường: danh mục, phương pháp (straight_line/declining_balance), thời gian sử dụng, tỷ lệ giá trị còn lại, tỷ lệ khấu hao
3. WHEN người dùng nhấn vào một quy tắc, THE Mobile_App SHALL hiển thị chi tiết quy tắc và danh sách thiết bị áp dụng quy tắc đó với giá trị khấu hao tính toán

### Yêu cầu 17: Xây dựng Màn hình Quản lý Phòng ban

**User Story:** Là một Admin_User, tôi muốn có màn hình riêng để quản lý phòng ban trong tổ chức.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Department Management hiển thị danh sách phòng ban với tên, mã và mô tả
2. WHEN Admin_User nhấn nút thêm phòng ban, THE Mobile_App SHALL hiển thị form modal với các trường: tên, mã, mô tả
3. WHEN Admin_User nhấn nút chỉnh sửa phòng ban, THE Mobile_App SHALL hiển thị form modal với dữ liệu hiện tại để cập nhật
4. THE Mobile_App SHALL đăng ký route mới cho màn hình Department Management trong navigation stack

### Yêu cầu 18: Xây dựng Màn hình Quản lý Vị trí

**User Story:** Là một Manager_User, tôi muốn có màn hình riêng để quản lý vị trí (tòa nhà, tầng, phòng).

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Location Management hiển thị danh sách vị trí dạng phân cấp
2. WHEN Manager_User nhấn nút thêm vị trí, THE Mobile_App SHALL hiển thị form modal với các trường: tên, mã, loại (building/floor/room), địa chỉ (cho building), vị trí cha
3. WHEN Manager_User nhấn nút chỉnh sửa vị trí, THE Mobile_App SHALL hiển thị form modal với dữ liệu hiện tại để cập nhật

### Yêu cầu 19: Xây dựng Màn hình Nhật ký Hệ thống

**User Story:** Là một Admin_User, tôi muốn có màn hình riêng để xem nhật ký hoạt động hệ thống.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Audit Logs hiển thị danh sách nhật ký với phân trang
2. WHEN Admin_User sử dụng bộ lọc (theo hành động, người dùng, khoảng thời gian), THE Mobile_App SHALL cập nhật danh sách nhật ký theo bộ lọc
3. THE Mobile_App SHALL đăng ký route mới cho màn hình Audit Logs trong navigation stack

### Yêu cầu 20: Xây dựng Màn hình Hồ sơ Cá nhân và Đổi Mật khẩu

**User Story:** Là một người dùng, tôi muốn có màn hình để xem và cập nhật hồ sơ cá nhân, đổi mật khẩu.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Profile hiển thị thông tin cá nhân: họ tên, email, role, phòng ban, trạng thái
2. WHEN người dùng nhấn nút chỉnh sửa hồ sơ, THE Mobile_App SHALL hiển thị form cập nhật và gửi request PUT đến endpoint `/auth/profile`
3. WHEN người dùng nhấn nút đổi mật khẩu, THE Mobile_App SHALL hiển thị form nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới
4. THE Mobile_App SHALL đăng ký route mới cho màn hình Profile trong navigation stack

### Yêu cầu 21: Xây dựng Màn hình Quản lý Danh mục Thiết bị

**User Story:** Là một Admin_User, tôi muốn có màn hình riêng để quản lý danh mục thiết bị với custom fields.

#### Tiêu chí chấp nhận

1. THE Mobile_App SHALL có màn hình Category Management hiển thị danh sách danh mục với tên, mã, mô tả và số lượng custom fields
2. WHEN Admin_User nhấn nút thêm danh mục, THE Mobile_App SHALL hiển thị form modal với các trường: tên, mã, mô tả, và khả năng thêm/xóa custom fields (fieldName, fieldType, required)
3. WHEN Admin_User nhấn nút chỉnh sửa danh mục, THE Mobile_App SHALL hiển thị form modal với dữ liệu hiện tại bao gồm custom fields để cập nhật
