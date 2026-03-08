# Tài liệu Yêu cầu - Tích hợp API Backend vào Mobile App

## Giới thiệu

Tích hợp toàn bộ API backend (Node.js/Express) vào ứng dụng mobile React Native/Expo để thay thế dữ liệu mock/hardcoded hiện tại. Chỉ sửa đổi phía mobile app, không thay đổi backend. Bao gồm: tạo API service layer, quản lý xác thực (auth), kết nối dữ liệu thực cho tất cả các màn hình, và cập nhật UI nếu cần thiết.

## Thuật ngữ

- **Mobile_App**: Ứng dụng React Native/Expo quản lý thiết bị điện tử (electronic-device-inventory-management)
- **Backend_API**: Server Node.js/Express cung cấp REST API tại base URL `/api/` (Electronic-Device-Inventory-Management)
- **API_Client**: Module HTTP client trong mobile app dùng để gọi Backend_API
- **Auth_Service**: Module quản lý xác thực, lưu trữ token, và refresh token trong Mobile_App
- **Device_Service**: Module gọi API liên quan đến thiết bị (CRUD, tìm kiếm, lọc)
- **Maintenance_Service**: Module gọi API liên quan đến bảo trì
- **Assignment_Service**: Module gọi API liên quan đến gán thiết bị
- **User_Service**: Module gọi API liên quan đến quản lý người dùng
- **Report_Service**: Module gọi API liên quan đến báo cáo
- **Auth_Token**: JWT access token dùng để xác thực các request tới Backend_API
- **Refresh_Token**: Token dùng để lấy Auth_Token mới khi hết hạn
- **Auth_Context**: React Context cung cấp trạng thái xác thực cho toàn bộ Mobile_App

## Yêu cầu

### Yêu cầu 1: Thiết lập API Client và cấu hình cơ sở

**User Story:** Là một developer, tôi muốn có một API client tập trung với cấu hình base URL, để tất cả các service có thể gọi Backend_API một cách nhất quán.

#### Tiêu chí chấp nhận

1. THE API_Client SHALL cung cấp một instance HTTP client (fetch hoặc axios) với base URL cấu hình được thông qua biến môi trường hoặc file config
2. THE API_Client SHALL tự động đính kèm Auth_Token vào header `Authorization: Bearer <token>` cho mọi request được xác thực
3. WHEN Auth_Token hết hạn (response 401), THE API_Client SHALL tự động gọi endpoint `/api/auth/refresh-token` với Refresh_Token để lấy token mới và retry request ban đầu
4. IF việc refresh token thất bại, THEN THE API_Client SHALL xóa toàn bộ token đã lưu và điều hướng người dùng về màn hình đăng nhập
5. THE API_Client SHALL cung cấp các phương thức GET, POST, PUT, PATCH, DELETE với type-safe response

### Yêu cầu 2: Xác thực và quản lý phiên đăng nhập

**User Story:** Là một người dùng, tôi muốn đăng nhập bằng email và mật khẩu thực, để truy cập hệ thống với quyền hạn phù hợp.

#### Tiêu chí chấp nhận

1. WHEN người dùng nhấn nút "Sign In" trên màn hình login, THE Auth_Service SHALL gọi `POST /api/auth/signin` với email và password
2. WHEN Backend_API trả về response thành công với token, THE Auth_Service SHALL lưu Auth_Token và Refresh_Token vào SecureStore (hoặc AsyncStorage)
3. WHEN đăng nhập thành công, THE Mobile_App SHALL lưu thông tin profile người dùng (tên, email, role) vào Auth_Context và điều hướng đến màn hình Dashboard
4. IF email hoặc password không hợp lệ, THEN THE Mobile_App SHALL hiển thị thông báo lỗi cụ thể từ Backend_API trên màn hình login
5. IF tài khoản bị khóa, THEN THE Mobile_App SHALL hiển thị thông báo tài khoản bị khóa
6. WHEN người dùng nhấn "Sign Out", THE Auth_Service SHALL gọi `POST /api/auth/signout`, xóa token đã lưu, và điều hướng về màn hình login
7. WHEN Mobile_App khởi động, THE Auth_Service SHALL kiểm tra token đã lưu và gọi `GET /api/auth/me` để xác thực phiên hiện tại
8. IF token đã lưu không hợp lệ khi khởi động, THEN THE Mobile_App SHALL điều hướng về màn hình login

### Yêu cầu 3: Màn hình Dashboard - Dữ liệu thực

**User Story:** Là một người dùng, tôi muốn xem thống kê tổng quan thực từ hệ thống, để nắm bắt tình trạng thiết bị hiện tại.

#### Tiêu chí chấp nhận

1. WHEN màn hình Dashboard được mở, THE Mobile_App SHALL gọi `GET /api/devices` để lấy tổng số thiết bị và số lượng theo trạng thái (available, assigned, in_maintenance, retired)
2. WHEN màn hình Dashboard được mở, THE Mobile_App SHALL gọi `GET /api/reports/warranty-alerts` để lấy cảnh báo bảo hành sắp hết hạn
3. WHEN màn hình Dashboard được mở, THE Mobile_App SHALL gọi `GET /api/maintenance/upcoming` để lấy danh sách bảo trì sắp tới
4. THE Mobile_App SHALL hiển thị danh sách thiết bị gần đây từ dữ liệu API thay vì dữ liệu hardcoded
5. THE Mobile_App SHALL hiển thị tên và role của người dùng đang đăng nhập từ Auth_Context trong header Dashboard
6. WHILE dữ liệu đang được tải, THE Mobile_App SHALL hiển thị loading indicator cho từng section

### Yêu cầu 4: Quản lý thiết bị - CRUD và tìm kiếm

**User Story:** Là một người dùng, tôi muốn xem, tìm kiếm, thêm, sửa, và xóa thiết bị từ dữ liệu thực, để quản lý kho thiết bị hiệu quả.

#### Tiêu chí chấp nhận

1. WHEN màn hình Devices được mở, THE Device_Service SHALL gọi `GET /api/devices` với pagination để lấy danh sách thiết bị
2. WHEN người dùng nhập từ khóa vào thanh tìm kiếm, THE Device_Service SHALL gọi `GET /api/devices/search?q=<keyword>` với debounce 300ms
3. WHEN người dùng chọn bộ lọc trạng thái (Available, Assigned, Maintenance, Retired), THE Device_Service SHALL gọi `GET /api/devices/filter?status=<status>`
4. WHEN người dùng nhấn vào một thiết bị, THE Mobile_App SHALL điều hướng đến màn hình Device Details và gọi `GET /api/devices/:id` để lấy chi tiết
5. WHEN người dùng điền form thêm thiết bị và nhấn "Save Device", THE Device_Service SHALL gọi `POST /api/devices` với dữ liệu từ form
6. WHEN người dùng sửa thiết bị và nhấn "Save", THE Device_Service SHALL gọi `PUT /api/devices/:id` với dữ liệu cập nhật
7. IF Backend_API trả về lỗi validation, THEN THE Mobile_App SHALL hiển thị lỗi tương ứng bên cạnh trường nhập liệu
8. THE Mobile_App SHALL gọi `GET /api/categories` để lấy danh sách category thực cho form thêm/sửa thiết bị thay vì danh sách hardcoded
9. THE Mobile_App SHALL gọi `GET /api/locations` để lấy danh sách location thực cho dropdown chọn vị trí

### Yêu cầu 5: Chi tiết thiết bị - Dữ liệu thực và hành động

**User Story:** Là một người dùng, tôi muốn xem chi tiết đầy đủ của thiết bị bao gồm thông số, lịch sử gán, bảo hành, và bảo trì từ dữ liệu thực.

#### Tiêu chí chấp nhận

1. WHEN màn hình Device Details được mở, THE Mobile_App SHALL gọi `GET /api/devices/:id` để hiển thị thông tin chi tiết thiết bị
2. WHEN màn hình Device Details được mở, THE Mobile_App SHALL gọi `GET /api/assignments/history/:deviceId` để hiển thị lịch sử gán thiết bị
3. WHEN màn hình Device Details được mở, THE Mobile_App SHALL gọi `GET /api/maintenance/history/:deviceId` để hiển thị lịch sử bảo trì
4. THE Mobile_App SHALL hiển thị thông tin bảo hành thực từ dữ liệu thiết bị thay vì dữ liệu hardcoded
5. WHEN người dùng nhấn nút "Assign" trên Device Details, THE Mobile_App SHALL điều hướng đến màn hình Assignment với deviceId

### Yêu cầu 6: Gán thiết bị

**User Story:** Là một admin hoặc inventory manager, tôi muốn gán thiết bị cho nhân viên từ danh sách người dùng thực, để theo dõi ai đang sử dụng thiết bị nào.

#### Tiêu chí chấp nhận

1. WHEN màn hình Assignment được mở, THE Mobile_App SHALL gọi `GET /api/users` để lấy danh sách nhân viên thực thay vì danh sách hardcoded
2. WHEN người dùng chọn nhân viên và nhấn "Assign Device", THE Assignment_Service SHALL gọi `POST /api/assignments` với deviceId và userId
3. WHEN gán thành công, THE Mobile_App SHALL hiển thị thông báo thành công và quay lại màn hình trước
4. IF gán thất bại (thiết bị đã được gán, quyền không đủ), THEN THE Mobile_App SHALL hiển thị thông báo lỗi cụ thể từ Backend_API
5. WHEN người dùng tìm kiếm nhân viên trên màn hình Assignment, THE Mobile_App SHALL lọc danh sách nhân viên theo tên hoặc phòng ban

### Yêu cầu 7: Quản lý bảo trì

**User Story:** Là một người dùng, tôi muốn xem và tạo yêu cầu bảo trì từ dữ liệu thực, để theo dõi tình trạng sửa chữa thiết bị.

#### Tiêu chí chấp nhận

1. WHEN màn hình Maintenance được mở, THE Maintenance_Service SHALL gọi `GET /api/maintenance` để lấy danh sách bản ghi bảo trì
2. THE Mobile_App SHALL hiển thị số lượng pending, completed, và scheduled từ dữ liệu API thay vì giá trị hardcoded
3. WHEN người dùng nhấn nút FAB (+) trên màn hình Maintenance, THE Mobile_App SHALL hiển thị form tạo yêu cầu bảo trì
4. WHEN người dùng điền form và gửi yêu cầu bảo trì, THE Maintenance_Service SHALL gọi `POST /api/maintenance/request` với dữ liệu từ form
5. WHEN tạo yêu cầu thành công, THE Mobile_App SHALL refresh danh sách bảo trì và hiển thị thông báo thành công
6. IF tạo yêu cầu thất bại, THEN THE Mobile_App SHALL hiển thị thông báo lỗi cụ thể từ Backend_API

### Yêu cầu 8: Báo cáo

**User Story:** Là một người dùng, tôi muốn xem các báo cáo thực từ hệ thống, để phân tích tình trạng thiết bị và tài sản.

#### Tiêu chí chấp nhận

1. WHEN người dùng chọn "Inventory Report", THE Report_Service SHALL gọi `GET /api/reports/device-status` để lấy báo cáo trạng thái thiết bị
2. WHEN người dùng chọn "Assignment Report", THE Report_Service SHALL gọi `GET /api/reports/assignments` để lấy báo cáo gán thiết bị
3. WHEN người dùng chọn "Warranty Report", THE Report_Service SHALL gọi `GET /api/reports/warranty` để lấy báo cáo bảo hành
4. WHEN người dùng chọn "Depreciation Report", THE Report_Service SHALL gọi `GET /api/reports/depreciation` để lấy báo cáo khấu hao
5. WHILE báo cáo đang được tải, THE Mobile_App SHALL hiển thị loading indicator
6. IF người dùng không có quyền xem báo cáo, THEN THE Mobile_App SHALL hiển thị thông báo không đủ quyền

### Yêu cầu 9: Quản lý người dùng (Admin)

**User Story:** Là một admin, tôi muốn xem và quản lý danh sách người dùng từ dữ liệu thực, để kiểm soát quyền truy cập hệ thống.

#### Tiêu chí chấp nhận

1. WHEN màn hình User Management được mở, THE User_Service SHALL gọi `GET /api/users` để lấy danh sách người dùng thực
2. THE Mobile_App SHALL hiển thị tên, email, role, và trạng thái của từng người dùng từ dữ liệu API
3. WHEN người dùng nhấn nút thêm user, THE Mobile_App SHALL hiển thị form đăng ký và gọi `POST /api/auth/register` khi submit
4. IF người dùng không có role admin, THEN THE Mobile_App SHALL ẩn tab Admin hoặc hiển thị thông báo không đủ quyền
5. WHEN lọc theo role, THE Mobile_App SHALL lọc danh sách người dùng phía client từ dữ liệu đã tải

### Yêu cầu 10: Cài đặt hệ thống (Admin)

**User Story:** Là một admin, tôi muốn xem và cập nhật cài đặt hệ thống từ dữ liệu thực, để cấu hình hệ thống theo nhu cầu.

#### Tiêu chí chấp nhận

1. WHEN màn hình System Settings được mở, THE Mobile_App SHALL gọi `GET /api/system/settings` để lấy cài đặt hệ thống hiện tại
2. WHEN người dùng thay đổi một cài đặt, THE Mobile_App SHALL gọi `POST /api/system/settings` với key và value mới
3. IF cập nhật thành công, THEN THE Mobile_App SHALL hiển thị thông báo thành công và cập nhật UI
4. IF người dùng không có role admin, THEN THE Mobile_App SHALL ẩn hoặc vô hiệu hóa các tùy chọn chỉnh sửa

### Yêu cầu 11: Xử lý lỗi và trạng thái mạng

**User Story:** Là một người dùng, tôi muốn nhận thông báo rõ ràng khi có lỗi xảy ra hoặc mất kết nối mạng, để biết cách xử lý.

#### Tiêu chí chấp nhận

1. WHEN một API request thất bại do lỗi mạng, THE Mobile_App SHALL hiển thị thông báo "Không có kết nối mạng" với nút "Thử lại"
2. WHEN một API request trả về lỗi server (5xx), THE Mobile_App SHALL hiển thị thông báo lỗi chung và ghi log lỗi
3. WHEN một API request trả về lỗi validation (4xx), THE Mobile_App SHALL hiển thị thông báo lỗi cụ thể từ response body
4. THE Mobile_App SHALL hiển thị loading state (spinner hoặc skeleton) trong khi chờ response từ Backend_API
5. WHEN dữ liệu tải thất bại, THE Mobile_App SHALL hiển thị empty state với nút "Thử lại" thay vì màn hình trống

### Yêu cầu 12: Phân quyền hiển thị theo role

**User Story:** Là một người dùng, tôi muốn chỉ thấy các chức năng phù hợp với role của mình, để tránh nhầm lẫn và bảo mật.

#### Tiêu chí chấp nhận

1. WHILE người dùng có role "staff", THE Mobile_App SHALL ẩn tab Admin và các nút thêm/sửa/xóa thiết bị
2. WHILE người dùng có role "admin" hoặc "inventory_manager", THE Mobile_App SHALL hiển thị đầy đủ các chức năng CRUD và quản trị
3. WHEN người dùng cố truy cập route không có quyền (ví dụ: staff truy cập /user-management), THE Mobile_App SHALL điều hướng về Dashboard
4. THE Mobile_App SHALL lấy thông tin role từ Auth_Context để quyết định hiển thị UI
