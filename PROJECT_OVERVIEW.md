# Tổng Quan Dự Án SmashX

Ngày cập nhật: 2026-06-12

File này tổng hợp toàn bộ dự án ở mức hệ thống: mục tiêu, kiến trúc, module nghiệp vụ, frontend, backend, cơ sở dữ liệu, SEO/GEO, luồng vận hành, trạng thái hiện tại và các điểm cần hoàn thiện.

## 1. Mục Tiêu Dự Án

SmashX là hệ thống thương mại điện tử đa người bán chuyên ngành cầu lông. Hệ thống hỗ trợ người mua tìm kiếm, xem sản phẩm, quản lý giỏ hàng, đặt hàng, thanh toán, xác thực đơn hàng và theo dõi vận chuyển. Đồng thời, nền tảng cung cấp khu vực quản trị cho admin và khu vực vận hành riêng cho seller.

Mục tiêu chính:

- Xây dựng sàn thương mại điện tử chuyên biệt cho sản phẩm cầu lông.
- Hỗ trợ nhiều vai trò: customer, admin, seller.
- Cho phép seller đăng ký, gửi hồ sơ KYB, quản lý sản phẩm và xử lý đơn hàng thuộc phạm vi của mình.
- Cho phép admin quản lý danh mục, thương hiệu, sản phẩm, người dùng, seller, KYB, chiến dịch, bài viết và báo cáo.
- Hỗ trợ quy trình mua hàng gồm giỏ hàng, checkout, OTP xác thực đơn, VNPay và tracking vận chuyển.
- Xây dựng nền tảng kỹ thuật phục vụ SEO/GEO bằng metadata, sitemap, robots và structured data.

## 2. Kiến Trúc Tổng Thể

Dự án được tổ chức theo kiến trúc full-stack tách frontend và backend.

```text
Browser / Next.js UI
  -> client/lib/api.ts
  -> Express REST API /api/v1
  -> Route
  -> Controller
  -> Service
  -> Prisma Client
  -> PostgreSQL
```

Các phần chính:

- `client/`: ứng dụng frontend Next.js App Router.
- `server/`: REST API Express + TypeScript.
- `server/prisma/schema.prisma`: schema dữ liệu Prisma/PostgreSQL.
- `main.tex`: báo cáo/luận văn LaTeX.
- `PROJECT_DOCUMENTATION.md`: tài liệu kỹ thuật chi tiết hiện có.
- `SEO_GEO_IMPLEMENTATION_AUDIT.md`: audit riêng cho SEO/GEO.
- `PROJECT_OVERVIEW.md`: file tổng quan toàn dự án này.

## 3. Công Nghệ Sử Dụng

### Frontend

- Next.js `16.1.1`.
- React `19.2.3`.
- TypeScript.
- Tailwind CSS 4.
- Radix UI, Base UI, shadcn-style components.
- Lucide React icons.
- Sonner toast notification.
- TipTap editor cho nội dung bài viết/admin.
- XLSX cho xuất dữ liệu Excel.
- js-cookie cho token phía client.

### Backend

- Node.js + Express `4.18.2`.
- TypeScript.
- Prisma ORM `5.22.0`.
- PostgreSQL.
- JWT authentication.
- bcryptjs password hashing.
- Multer upload.
- Nodemailer email/OTP.
- VNPay integration.

## 4. Cấu Trúc Thư Mục Chính

```text
D:\doan2
|-- client/
|   |-- app/                 # Next.js App Router pages/layouts
|   |-- components/          # UI, shop, admin, seller components
|   |-- contexts/            # Auth, cart, seller auth, theme providers
|   |-- hooks/               # Custom hooks
|   |-- lib/                 # API client, types, mappers, SEO helpers
|   |-- public/              # Static assets
|   |-- package.json
|
|-- server/
|   |-- prisma/
|   |   |-- schema.prisma     # Database schema
|   |-- src/
|   |   |-- controllers/      # HTTP controllers
|   |   |-- services/         # Business logic
|   |   |-- routes/           # REST route definitions
|   |   |-- middlewares/      # Auth, error, async middlewares
|   |   |-- lib/              # Prisma client
|   |   |-- enums/            # Shared backend enums
|   |   |-- index.ts          # Express entry point
|   |-- package.json
|
|-- main.tex
|-- PROJECT_DOCUMENTATION.md
|-- PROJECT_OVERVIEW.md
|-- SEO_GEO_IMPLEMENTATION_AUDIT.md
```

## 5. Vai Trò Người Dùng

### Customer

Customer có thể:

- Đăng ký, đăng nhập.
- Xem danh sách sản phẩm và chi tiết sản phẩm.
- Lọc/tìm kiếm sản phẩm theo danh mục, thương hiệu, giá.
- Thêm sản phẩm vào giỏ hàng.
- Checkout và tạo đơn hàng.
- Xác thực OTP đơn hàng.
- Thanh toán COD/chuyển khoản/VNPay tùy luồng.
- Quản lý thông tin tài khoản, địa chỉ, đơn hàng.
- Theo dõi vận đơn bằng tracking number.
- Đọc blog, FAQ, chính sách và các trang nội dung.

### Seller

Seller có thể:

- Đăng ký tài khoản seller riêng.
- Đăng nhập bằng token seller riêng.
- Cập nhật hồ sơ cửa hàng.
- Gửi hồ sơ KYB.
- Quản lý sản phẩm thuộc seller.
- Xem và xử lý đơn hàng có sản phẩm của mình.
- Quản lý fulfillment: picking, packing, ready, handover, delivery.
- Xem báo cáo seller.

### Admin

Admin có thể:

- Đăng nhập bằng tài khoản user có role `admin`.
- Xem dashboard thống kê.
- Quản lý user/customer.
- Quản lý danh mục, thương hiệu, sản phẩm, bộ sưu tập.
- Quản lý bài viết/blog.
- Quản lý campaign/voucher và flash sale.
- Quản lý seller và duyệt KYB.
- Quản lý đơn hàng và fulfillment.
- Cấu hình hệ thống ở khu vực admin settings.

## 6. Frontend Overview

Frontend dùng Next.js App Router trong `client/app`.

### Nhóm Shop/Public

- `/`: trang chủ.
- `/products`: danh sách sản phẩm.
- `/products/[id]`: chi tiết sản phẩm.
- `/cart`: giỏ hàng.
- `/checkout`: thanh toán.
- `/checkout/verify`: xác thực OTP đơn hàng.
- `/checkout/success`: đặt hàng thành công.
- `/checkout/vnpay-return`: callback/return từ VNPay.
- `/login`: đăng nhập customer/admin.
- `/account`: tài khoản.
- `/account/register`: đăng ký customer.
- `/account/forgot-password`: quên mật khẩu.
- `/account/orders`: đơn hàng của customer.
- `/account/orders/[id]`: chi tiết đơn hàng.
- `/tracking/[trackingNumber]`: theo dõi vận đơn.
- `/blog`: danh sách bài viết.
- `/blog/[slug]`: chi tiết bài viết.
- `/about`, `/contact`, `/faq`, `/policy`, `/yonex`: trang nội dung/landing.

### Nhóm Admin

- `/admin`: dashboard.
- `/admin/customers`: quản lý khách hàng.
- `/admin/categories`: quản lý danh mục.
- `/admin/brands`: quản lý thương hiệu.
- `/admin/campaigns`: quản lý chiến dịch/voucher.
- `/admin/campaigns/new`: tạo chiến dịch.
- `/admin/campaigns/[id]/edit`: sửa chiến dịch.
- `/admin/posts`: quản lý bài viết.
- `/admin/posts/new`: tạo bài viết.
- `/admin/posts/[id]/edit`: sửa bài viết.
- `/admin/collections`: quản lý bộ sưu tập.
- `/admin/sellers`: quản lý seller.
- `/admin/kyb`: duyệt KYB.
- `/admin/settings`: cài đặt.

### Nhóm Seller

- `/seller/login`: đăng nhập seller.
- `/seller/register`: đăng ký seller.
- `/seller`: dashboard seller.
- `/seller/products`: sản phẩm của seller.
- `/seller/products/new`: tạo sản phẩm seller.
- `/seller/products/[id]/edit`: sửa sản phẩm seller.
- `/seller/orders`: đơn hàng seller.
- `/seller/orders/[id]`: chi tiết đơn seller.
- `/seller/fulfillment`: xử lý vận chuyển.
- `/seller/reports`: báo cáo seller.
- `/seller/settings`: cài đặt cửa hàng.

### State Và Provider

- `AuthProvider`: quản lý auth customer/admin.
- `SellerAuthProvider`: quản lý auth seller riêng.
- `CartProvider`: quản lý giỏ hàng.
- `ThemeProvider`: theme cho admin/seller.
- `Toaster`: hiển thị notification.

### API Client Frontend

API client tập trung ở `client/lib/api.ts`.

Các module chính:

- `uploadApi`
- `userApi`
- `productApi`
- `categoryApi`
- `brandApi`
- `collectionApi`
- `orderApi`
- `fulfillmentApi`
- `cartApi`
- `addressApi`
- `reviewApi`
- `campaignApi`
- `flashSaleApi`
- `statsApi`
- `postApi`
- `sellerApi`
- `vnpayApi`

API base URL mặc định:

```text
NEXT_PUBLIC_API_URL || http://localhost:3000/api/v1
```

## 7. Backend Overview

Backend là Express API đặt tại `server/src`.

Entry point:

- `server/src/index.ts`

Các trách nhiệm chính:

- Load biến môi trường.
- Cấu hình CORS.
- Parse JSON/body.
- Expose `/` và `/health`.
- Mount toàn bộ route dưới `/api/v1`.
- Xử lý lỗi tập trung bằng `errorMiddleware`.

### Route Modules

Các route được mount trong `server/src/routes/index.ts`:

- `/auth`: đăng ký, đăng nhập, auth customer/admin.
- `/users`: quản lý user.
- `/categories`: danh mục.
- `/brands`: thương hiệu.
- `/products`: sản phẩm.
- `/orders`: đơn hàng.
- `/carts`: giỏ hàng.
- `/addresses`: địa chỉ.
- `/reviews`: đánh giá.
- `/campaigns`: campaign/voucher.
- `/flash-sales`: flash sale.
- `/upload`: upload ảnh.
- `/stats`: thống kê dashboard.
- `/seed`: seed dữ liệu.
- `/posts`: bài viết/blog.
- `/fulfillment`: vận chuyển/tracking.
- `/collections`: bộ sưu tập.
- `/sellers`: seller auth/profile/orders/products.
- `/kyb`: xác thực doanh nghiệp seller.
- `/vnpay`: tạo URL thanh toán, return và IPN.

### Middleware Auth Và Quyền

Middleware chính nằm ở `server/src/middlewares/auth.middleware.ts`.

Các middleware quan trọng:

- `authenticate`: xác thực JWT.
- `authorize(...roles)`: phân quyền theo role.
- `requireSelfOrAdmin`: user chỉ truy cập tài nguyên của mình hoặc admin.
- `requireActiveSeller`: seller phải active.
- `attachSellerIdToBody`: tự gắn `seller_id` khi seller tạo sản phẩm.
- `requireProductAccess`: seller chỉ sửa/xóa sản phẩm của mình.
- `requireOrderAccess`: kiểm tra quyền truy cập đơn hàng.
- `requireTrackingAccess`: kiểm tra quyền truy cập tracking/shipment.

Vai trò hiện có:

- `admin`.
- `customer`.
- `seller`, dùng trong JWT seller riêng, không nằm trong enum Prisma `UserRole`.

## 8. Cơ Sở Dữ Liệu

Database dùng PostgreSQL qua Prisma.

Schema chính: `server/prisma/schema.prisma`.

### Enum Chính

- `UserRole`: `admin`, `customer`.
- `ProductBadge`: `new`, `bestseller`, `sale`, `none`.
- `OrderStatus`: `pending`, `pending_payment`, `paid`, `awaiting_shipment`, `awaiting_collection`, `in_transit`, `delivered`, `completed`, `confirmed`, `shipping`, `cancelled`.
- `PaymentStatus`: `pending`, `paid`, `failed`, `refunded`.
- `ShipmentStatus`: `pending`, `picking`, `packing`, `ready_for_pickup`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed_delivery`, `returned`.
- `ShippingMethod`: `seller_fulfillment`, `platform_fulfillment`.
- `CarrierService`: `standard`, `express`, `same_day`.
- `DiscountType`: `percentage`, `fixed_amount`.
- `SellerStatus`: `pending`, `active`, `suspended`.
- `KybStatus`: `pending`, `approved`, `rejected`.

### Model Chính

- `User`: tài khoản customer/admin.
- `Seller`: tài khoản seller độc lập với `User`.
- `Kyb`: hồ sơ xác thực doanh nghiệp seller.
- `Category`: danh mục, hỗ trợ parent/children.
- `Brand`: thương hiệu.
- `Product`: sản phẩm, liên kết seller/category/brand/images/reviews/collections.
- `ProductImage`: ảnh sản phẩm.
- `Order`: đơn hàng, OTP, trạng thái thanh toán, trạng thái vận hành.
- `OrderItem`: dòng sản phẩm trong đơn.
- `Cart`, `CartItem`: giỏ hàng.
- `Address`: địa chỉ giao hàng.
- `Review`: đánh giá sản phẩm.
- `Campaign`: voucher/discount.
- `FlashSale`, `FlashSaleProduct`: chương trình flash sale.
- `Shipment`: vận chuyển và tracking.
- `Post`: bài viết/blog.
- `Collection`: bộ sưu tập sản phẩm.

## 9. Luồng Nghiệp Vụ Chính

### Customer Mua Hàng

1. Customer đăng ký hoặc đăng nhập.
2. Customer xem/lọc/tìm kiếm sản phẩm.
3. Customer thêm sản phẩm vào giỏ hàng.
4. Customer checkout và tạo đơn hàng.
5. Server tạo order, order items và OTP.
6. Customer xác thực OTP.
7. Customer thanh toán bằng phương thức phù hợp, bao gồm VNPay nếu chọn.
8. Admin/seller xử lý fulfillment.
9. Customer theo dõi đơn hàng/tracking.

### Seller Bán Hàng

1. Seller đăng ký tài khoản.
2. Seller đăng nhập bằng luồng riêng.
3. Seller cập nhật hồ sơ cửa hàng.
4. Seller gửi KYB.
5. Admin duyệt KYB và kích hoạt seller.
6. Seller tạo/sửa/xóa sản phẩm.
7. Seller xem đơn hàng liên quan đến sản phẩm của mình.
8. Seller xử lý picking, packing, ready, handover và trạng thái giao hàng.

### Admin Vận Hành

1. Admin đăng nhập bằng tài khoản role `admin`.
2. Admin xem dashboard.
3. Admin quản lý catalog, user, seller, KYB, campaign, post, collection.
4. Admin kiểm soát đơn hàng và fulfillment khi cần.
5. Admin theo dõi dữ liệu vận hành và nội dung.

### VNPay

1. Customer tạo đơn và chọn VNPay.
2. Client gọi `/api/v1/vnpay/create-payment`.
3. Server tạo payment URL.
4. User được redirect sang VNPay.
5. VNPay redirect về `/checkout/vnpay-return`.
6. Backend xử lý `/api/v1/vnpay/return` và `/api/v1/vnpay/ipn`.

### Fulfillment Và Tracking

1. Admin/seller tạo shipment cho order.
2. Shipment đi qua các trạng thái như pending, picking, packing, ready, in transit, delivered.
3. Tracking number được cập nhật.
4. Frontend có route `/tracking/[trackingNumber]` để tra cứu.

## 10. SEO/GEO Hiện Tại

Hệ thống đã được bổ sung nền tảng SEO/GEO ở frontend Next.js.

Đã có:

- Global metadata trong `client/app/layout.tsx`.
- Metadata tĩnh cho các route public chính.
- Metadata động cho `/products/[id]` và `/blog/[slug]`.
- Canonical URL.
- Open Graph metadata.
- Twitter card metadata.
- `/sitemap.xml` sinh từ route tĩnh, product và post.
- `/robots.txt` chặn admin/seller/checkout/account.
- JSON-LD `Organization`.
- JSON-LD `WebSite` + `SearchAction`.
- JSON-LD `Product`.
- JSON-LD `Article`.
- JSON-LD `BreadcrumbList` cho product detail và blog detail.
- JSON-LD `FAQPage` cho `/faq`.
- `noindex` metadata cho login, cart, checkout và account route group.

Chi tiết riêng nằm trong:

- `SEO_GEO_IMPLEMENTATION_AUDIT.md`.
- `client/lib/server-seo.ts`.
- `client/app/sitemap.ts`.
- `client/app/robots.ts`.

## 11. Bảo Mật Và Phân Quyền

Các điểm đã có:

- JWT cho customer/admin.
- JWT/token riêng cho seller.
- Password hashing bằng bcryptjs.
- Middleware auth và authorize theo vai trò.
- Seller access control cho sản phẩm và đơn hàng.
- KYB để kiểm soát seller.
- Một số route private được bảo vệ bằng middleware.

Các điểm cần review trước production:

- Rà lại tất cả route CRUD admin để đảm bảo có `authenticate` và `authorize` đúng.
- Rà route public tracking vì frontend có trang tra cứu nhưng backend có thể vẫn yêu cầu admin/seller ở một số luồng.
- Chuẩn hóa CORS theo domain production.
- Không commit secret thật trong `.env` hoặc `.env.example`.
- Bổ sung rate limiting cho auth, OTP, checkout, upload nếu triển khai thật.

## 12. Trạng Thái Kỹ Thuật Hiện Tại

Kết quả kiểm tra gần nhất ở frontend:

```bash
npm run build
npm run lint
```

Kết quả:

- Build frontend pass.
- Lint frontend pass ở mức không có error.
- Còn `99 warnings`, chủ yếu là `any`, unused imports/vars và hook dependency warnings.

Các thay đổi gần đây:

- Giảm nhiều lỗi TypeScript/lint ở frontend.
- Thay toàn bộ `<img>` trong client bằng `next/image`.
- Thêm metadata, sitemap, robots và JSON-LD SEO/GEO.
- Tách product detail/blog detail thành server wrapper + client UI để hỗ trợ dynamic metadata.
- Tạo `SEO_GEO_IMPLEMENTATION_AUDIT.md`.
- Tạo `PROJECT_OVERVIEW.md`.

## 13. Điểm Chưa Đồng Bộ Hoàn Toàn

Các khu vực cần đồng bộ tiếp:

- API response còn trộn `snake_case` và `camelCase`.
- Frontend types đang dùng bridge type để tương thích response cũ.
- `Post` giữa schema/backend/frontend/tài liệu chưa hoàn toàn thống nhất ở các field như `thumbnail`, `featured_image`, `meta_title`, `meta_description`, `status`, `is_published`, `author`.
- `Collection` chưa thống nhất hoàn toàn ở `image_url`, `thumbnail`, `country`, `sport`, `achievement`.
- `Address` chưa thống nhất hoàn toàn ở `address_line`, `street`, `city`, `province`.
- Một số admin page vẫn còn nhiều `any` và unused imports.
- `main.tex` cần cập nhật lại phần SEO/GEO vì code đã implement nhiều mục trước đó được ghi là “cần bổ sung”.

## 14. Biến Môi Trường Quan Trọng

### Client

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Server

Các biến cần có tùy môi trường:

- `PORT`.
- `CLIENT_URL`.
- `CLIENT_URLS`.
- `DATABASE_URL`.
- `DIRECT_URL`.
- JWT secret.
- Email/SMTP config nếu dùng OTP/email.
- Upload provider config nếu dùng dịch vụ ngoài.
- VNPay config nếu bật thanh toán VNPay.

## 15. Lệnh Phát Triển

### Client

Chạy trong `client`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

### Server

Chạy trong `server`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:push
npm run prisma:studio
```

## 16. Định Hướng Hoàn Thiện Tiếp Theo

Ưu tiên kỹ thuật:

1. Chuẩn hóa API response và naming convention `snake_case`/`camelCase`.
2. Dọn `any` còn lại ở cụm admin và một số trang checkout/auth.
3. Rà quyền toàn bộ route backend trước production.
4. Đồng bộ Prisma schema, frontend types và nội dung `main.tex`.
5. Bổ sung test cho auth, checkout, order, seller, fulfillment và payment.
6. Hoàn thiện production env, CORS, secret management và rate limiting.
7. Validate SEO rich results sau khi deploy.
8. Đo lường index/search performance bằng Google Search Console.

Ưu tiên nghiệp vụ:

1. Hoàn thiện luồng seller KYB và trạng thái seller.
2. Hoàn thiện tracking public/customer nếu muốn người dùng tra cứu không cần quyền admin/seller.
3. Hoàn thiện dữ liệu review để dùng `Review`/`AggregateRating` chính xác.
4. Cải thiện liên kết nội bộ giữa blog, product, category, brand và collection.
5. Chuẩn hóa nội dung bài viết theo hướng tư vấn, FAQ và so sánh sản phẩm để phục vụ GEO tốt hơn.

## 17. Tóm Tắt Ngắn Gọn Cho Báo Cáo

SmashX là hệ thống thương mại điện tử đa người bán chuyên ngành cầu lông, được xây dựng theo kiến trúc tách frontend Next.js và backend Express/Prisma/PostgreSQL. Hệ thống hỗ trợ ba nhóm vai trò chính gồm customer, seller và admin. Customer có thể xem sản phẩm, quản lý giỏ hàng, đặt hàng, xác thực OTP, thanh toán và theo dõi vận chuyển. Seller có khu vực riêng để đăng ký, gửi hồ sơ KYB, quản lý sản phẩm và xử lý đơn hàng. Admin có thể quản lý catalog, người dùng, seller, KYB, chiến dịch, bài viết, bộ sưu tập, đơn hàng và thống kê.

Về kỹ thuật, hệ thống sử dụng REST API, Prisma ORM, JWT authentication, middleware phân quyền, upload ảnh, VNPay payment, fulfillment/tracking và frontend App Router. Dự án cũng đã có nền tảng SEO/GEO gồm metadata, canonical URL, sitemap, robots.txt và JSON-LD cho Organization, WebSite, Product, Article, BreadcrumbList và FAQPage. Tuy nhiên, hệ thống vẫn cần tiếp tục chuẩn hóa API response, đồng bộ schema/types/tài liệu, rà quyền backend, giảm lint warnings và bổ sung kiểm thử trước khi triển khai production.
