# Tai lieu du an BadmintonPro

## 1. Tong quan

BadmintonPro la du an thuong mai dien tu chuyen ve san pham cau long chinh hang. He thong duoc xay dung theo kien truc full-stack gom:

- `client`: ung dung web Next.js cho khach hang, admin va seller.
- `server`: REST API Express + TypeScript, su dung Prisma ORM va PostgreSQL.
- `server/prisma/schema.prisma`: mo hinh du lieu chinh cua he thong.

Du an ho tro cac nhom tinh nang chinh:

- Khach hang dang ky, dang nhap, xem san pham, quan ly gio hang, dat hang va xac thuc OTP don hang.
- Admin quan ly dashboard, khach hang, danh muc, thuong hieu, san pham, bai viet, chien dich, bo suu tap, seller va ho so KYB.
- Seller dang ky/dang nhap rieng, quan ly ho so cua hang, san pham, don hang va fulfillment.
- He thong van hanh don hang gom shipment, tracking number, trang thai picking/packing/handover/delivery.
- Upload anh cho san pham va noi dung thong qua API upload.

## 2. Cong nghe su dung

### Frontend

- Next.js `16.1.1`
- React `19.2.3`
- TypeScript
- Tailwind CSS 4
- Radix UI, Base UI, shadcn style components
- Sonner cho toast notification
- TipTap cho editor bai viet/noi dung admin
- XLSX cho xuat du lieu Excel
- js-cookie de luu JWT token tren client

### Backend

- Node.js + Express `4.18.2`
- TypeScript
- Prisma ORM `5.22.0`
- PostgreSQL, schema co ghi chu su dung Supabase/pgBouncer
- JWT cho xac thuc
- bcryptjs cho hash password
- Multer cho upload file anh
- Nodemailer cho email/OTP

## 3. Cau truc thu muc chinh

```text
D:\doan2
|-- client/
|   |-- app/                 # Next.js App Router pages/layouts
|   |-- components/          # UI, shop, admin, seller components
|   |-- contexts/            # Auth, cart, theme, seller auth state
|   |-- hooks/               # Custom hooks
|   |-- lib/                 # API clients, auth helpers, mapper, export utils
|   |-- public/              # Static assets neu co
|   |-- package.json
|
|-- server/
|   |-- prisma/
|   |   |-- schema.prisma     # Database schema
|   |-- src/
|   |   |-- controllers/      # Xu ly HTTP request/response
|   |   |-- services/         # Business logic va Prisma queries
|   |   |-- routes/           # Khai bao REST endpoints
|   |   |-- middlewares/      # Auth, error, async middlewares
|   |   |-- lib/              # Prisma client
|   |   |-- enums/            # Enum dung chung
|   |   |-- index.ts          # Entry point Express server
|   |-- package.json
|
|-- kilo.md                  # Ghi chu rule UI reference
|-- SECURITY_HARDENING_CHECKLIST.md
|-- PROJECT_DOCUMENTATION.md # File tai lieu nay
```

## 4. Kien truc tong the

Client goi REST API qua `client/lib/api.ts`. API base URL lay tu bien moi truong `NEXT_PUBLIC_API_URL`, neu khong co se fallback ve `http://localhost:3000/api/v1`.

Server khoi tao Express trong `server/src/index.ts`, ket noi Prisma, cau hinh CORS, parse JSON/body URL-encoded, expose health check va mount tat ca API duoi prefix `/api/v1`.

Luong request co dang:

```text
Browser/Next.js UI
  -> client/lib/api.ts hoac auth helper
  -> Express route /api/v1/...
  -> Controller
  -> Service
  -> Prisma Client
  -> PostgreSQL
```

## 5. Frontend chi tiet

### 5.1 App Router va cac khu vuc man hinh

Frontend su dung Next.js App Router trong `client/app`.

Khu vuc shop/khach hang:

- `/`: trang chu.
- `/products`: danh sach san pham.
- `/products/[id]`: chi tiet san pham.
- `/cart`: gio hang.
- `/checkout`: thanh toan.
- `/checkout/verify`: xac thuc OTP don hang.
- `/checkout/success`: dat hang thanh cong.
- `/login`: dang nhap customer/admin.
- `/account`: thong tin tai khoan.
- `/account/register`: dang ky.
- `/account/orders`: danh sach don hang.
- `/account/orders/[id]`: chi tiet don hang.
- `/blog`, `/blog/[slug]`: bai viet.
- `/tracking/[trackingNumber]`: tra cuu van don.
- `/about`, `/contact`, `/faq`, `/policy`, `/yonex`: trang noi dung/landing.

Khu vuc admin:

- `/admin`: dashboard.
- `/admin/customers`: quan ly khach hang.
- `/admin/categories`: danh muc.
- `/admin/brands`: thuong hieu.
- `/admin/campaigns`: chien dich/voucher.
- `/admin/posts`: bai viet.
- `/admin/collections`: bo suu tap.
- `/admin/sellers`: seller.
- `/admin/kyb`: duyet ho so KYB.
- `/admin/settings`: cai dat.

Khu vuc seller:

- `/seller/login`: dang nhap seller.
- `/seller/register`: dang ky seller.
- `/seller`: dashboard seller.
- `/seller/products`: san pham cua seller.
- `/seller/products/new`: tao san pham.
- `/seller/products/[id]/edit`: sua san pham.
- `/seller/orders`: don hang cua seller.
- `/seller/orders/[id]`: chi tiet don seller.
- `/seller/fulfillment`: xu ly van don.
- `/seller/reports`: bao cao.
- `/seller/settings`: cai dat cua hang.

### 5.2 Layout va provider

- `client/app/layout.tsx` boc toan app bang `AuthProvider` va `CartProvider`, cau hinh font va `Toaster`.
- `client/app/admin/layout.tsx` dung `ThemeProvider`, `SidebarProvider`, `AdminSidebar`, `AdminHeader`.
- `client/app/seller/layout.tsx` dung `ThemeProvider`, `SellerAuthProvider`; cac trang login/register seller khong hien sidebar/header.
- `client/app/(shop)/layout.tsx` la layout rieng cho nhom shop neu route group duoc dung.

### 5.3 Quan ly state phia client

- `contexts/AuthContext.tsx`: quan ly customer/admin auth state, nap user tu `localStorage`, verify lai voi `/auth/me`.
- `contexts/SellerAuthContext.tsx`: quan ly seller auth state rieng, verify lai voi `/sellers/profile`.
- `contexts/CartContext.tsx`: quan ly gio hang theo user dang nhap, goi API cart, optimistic update khi them/xoa/cap nhat so luong.
- `contexts/ThemeContext.tsx`: phuc vu theme cho admin/seller.

### 5.4 API client

File `client/lib/api.ts` gom cac client module:

- `uploadApi`: upload anh chung, anh san pham, lay/xoa anh san pham.
- `userApi`: CRUD user.
- `productApi`: danh sach, filter, lay theo category/brand/collection/slug, CRUD.
- `categoryApi`, `brandApi`, `collectionApi`: quan ly danh muc, thuong hieu, bo suu tap.
- `orderApi`: danh sach don, chi tiet, tao/cap nhat/xoa, lay theo user, verify/resend OTP.
- `fulfillmentApi`: tao shipment, picking, packing, ready, tracking, handover, confirm delivery, cancel, sync carrier.
- `cartApi`: lay/tao gio hang va them item.
- `addressApi`: quan ly dia chi.
- `reviewApi`: danh gia san pham va diem trung binh.
- `campaignApi`: chien dich/voucher.
- `flashSaleApi`: flash sale.
- `statsApi`: dashboard stats admin.
- `postApi`: bai viet/blog.
- `sellerApi`: profile seller, KYB, san pham va don hang seller.

## 6. Backend chi tiet

### 6.1 Entry point va cau hinh server

File `server/src/index.ts`:

- Load `.env` bang `dotenv/config`.
- Ep DNS uu tien IPv4 bang `dns.setDefaultResultOrder('ipv4first')`.
- Cau hinh CORS cho `http://localhost:3000`, `http://localhost:3001`, `CLIENT_URL`, `CLIENT_URLS`.
- Expose `GET /` de kiem tra API dang chay.
- Expose `GET /health` de kiem tra ket noi database.
- Mount routes tai `/api/v1`.
- Dung `errorMiddleware` de xu ly loi tap trung.

### 6.2 Route modules

Tat ca route duoc mount trong `server/src/routes/index.ts`:

- `/auth`: customer/admin auth.
- `/users`: quan ly user.
- `/categories`: danh muc.
- `/brands`: thuong hieu.
- `/products`: san pham.
- `/orders`: don hang.
- `/carts`: gio hang.
- `/addresses`: dia chi giao hang.
- `/reviews`: danh gia.
- `/campaigns`: voucher/chien dich.
- `/flash-sales`: flash sale.
- `/upload`: upload anh.
- `/stats`: thong ke dashboard.
- `/seed`: seed du lieu.
- `/posts`: bai viet.
- `/fulfillment`: van hanh giao hang.
- `/collections`: bo suu tap.
- `/sellers`: seller auth/profile/orders/products.
- `/kyb`: xac thuc doanh nghiep seller.

### 6.3 Xac thuc va phan quyen

Middleware chinh nam o `server/src/middlewares/auth.middleware.ts`.

- `authenticate`: doc JWT tu header `Authorization: Bearer <token>`, verify token va gan `req.user`.
- `authorize(...roles)`: gioi han theo role.
- `requireSelfOrAdmin`: user chi duoc xem tai nguyen cua minh tru admin.
- `requireActiveSeller`: seller phai active, khong bi xoa va co status `active`.
- `attachSellerIdToBody`: tu dong gan `seller_id` khi seller tao san pham.
- `requireProductAccess`: seller chi duoc sua/xoa san pham cua minh.
- `requireOrderAccess`: kiem tra quyen truy cap don hang theo customer, seller, admin.
- `requireTrackingAccess`: kiem tra quyen truy cap tracking/shipment.

Role hien co:

- `admin`
- `customer`
- `seller` la role trong JWT seller, khong nam trong enum `UserRole` cua Prisma.

### 6.4 Cac API quan trong

Auth:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/change-password`

Seller:

- `POST /api/v1/sellers/register`
- `POST /api/v1/sellers/login`
- `GET /api/v1/sellers/profile`
- `PUT /api/v1/sellers/profile`
- `GET /api/v1/sellers/profile/orders`
- `PATCH /api/v1/sellers/profile/orders/:id`
- `DELETE /api/v1/sellers/profile/orders/:id`
- `GET /api/v1/sellers/:id/products`

Products:

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `GET /api/v1/products/:id/details`
- `GET /api/v1/products/slug/:slug`
- `GET /api/v1/products/category/:categoryId`
- `GET /api/v1/products/brand/:brandId`
- `GET /api/v1/products/collection/:collectionId`
- `POST /api/v1/products`
- `PUT /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

Orders va OTP:

- `GET /api/v1/orders`
- `GET /api/v1/orders/number/:orderNumber`
- `GET /api/v1/orders/user/:userId`
- `GET /api/v1/orders/:id`
- `POST /api/v1/orders`
- `POST /api/v1/orders/:id/verify-otp`
- `POST /api/v1/orders/:id/resend-otp`
- `PUT /api/v1/orders/:id`
- `DELETE /api/v1/orders/:id`

Fulfillment:

- `POST /api/v1/fulfillment/order/:orderId/shipment`
- `POST /api/v1/fulfillment/order/:orderId/picking`
- `POST /api/v1/fulfillment/order/:orderId/packing`
- `POST /api/v1/fulfillment/order/:orderId/ready`
- `POST /api/v1/fulfillment/order/:orderId/tracking`
- `POST /api/v1/fulfillment/order/:orderId/handover`
- `POST /api/v1/fulfillment/order/:orderId/confirm-delivery`
- `POST /api/v1/fulfillment/order/:orderId/cancel`
- `GET /api/v1/fulfillment/order/:orderId/shipment`
- `GET /api/v1/fulfillment/order/:orderId/shipments`
- `GET /api/v1/fulfillment/tracking/:trackingNumber`
- `PUT /api/v1/fulfillment/order/:orderId/status`
- `POST /api/v1/fulfillment/sync-carrier/:trackingNumber`

Upload:

- `POST /api/v1/upload/image`
- `POST /api/v1/upload/product/:productId/image`
- `GET /api/v1/upload/product/:productId/images`
- `DELETE /api/v1/upload/product-image/:imageId`

## 7. Co so du lieu

Database dung PostgreSQL qua Prisma. Schema chinh nam o `server/prisma/schema.prisma`.

### 7.1 Enum chinh

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

### 7.2 Model chinh

- `User`: customer/admin, co orders, carts, addresses, reviews.
- `Seller`: tai khoan nguoi ban doc lap voi `User`, co products va KYB.
- `Kyb`: ho so xac thuc doanh nghiep cua seller.
- `Category`: danh muc co parent/children.
- `Brand`: thuong hieu.
- `Product`: san pham, lien ket category, brand, seller, images, reviews, cart/order items, flash sale, collections.
- `ProductImage`: anh san pham, co `is_primary` va `sort_order`.
- `Order`: don hang, co order number, user, campaign, status, payment status, OTP.
- `OrderItem`: chi tiet san pham trong don.
- `Cart`, `CartItem`: gio hang va san pham trong gio.
- `Address`: dia chi giao hang cua user.
- `Review`: danh gia san pham.
- `Campaign`: voucher/discount.
- `FlashSale`, `FlashSaleProduct`: chuong trinh flash sale va san pham tham gia.
- `Shipment`: thong tin van chuyen va tracking.
- `Post`: bai viet/blog.
- `Collection`: bo suu tap san pham.

## 8. Luong nghiep vu chinh

### 8.1 Customer mua hang

1. Customer dang ky/dang nhap bang `/auth/register` hoac `/auth/login`.
2. Client luu token trong cookie `auth_token` va user trong `localStorage`.
3. Customer xem san pham qua `/products` va them vao gio hang.
4. `CartContext` tao hoac lay gio hang bang `/carts/user/:userId`.
5. Customer checkout, server tao `Order` va `OrderItem`.
6. Don hang co OTP, customer xac thuc qua `/orders/:id/verify-otp`.
7. Admin/seller xu ly trang thai don va fulfillment.

### 8.2 Seller ban hang

1. Seller dang ky tai `/sellers/register`.
2. Seller dang nhap tai `/sellers/login`, client luu token rieng `seller_auth_token`.
3. Seller nop KYB tai `/kyb/submit`.
4. Admin duyet KYB va kich hoat seller.
5. Seller active co the tao/sua/xoa san pham, he thong gan `seller_id` tu token.
6. Seller xem va xu ly don hang co san pham thuoc seller do.

### 8.3 Admin van hanh

1. Admin dang nhap bang auth user co role `admin`.
2. Admin truy cap dashboard `/admin` va API `/stats/dashboard`.
3. Admin quan ly catalog, user, content, campaign, seller va KYB.
4. Admin co quyen cao hon trong cac middleware `authorize(UserRole.ADMIN)` va `requireOrderAccess`.

### 8.4 Fulfillment va tracking

1. Admin/seller tao shipment cho order.
2. Trang thai shipment chuyen qua cac buoc picking, packing, ready, handover, in transit, delivered.
3. Tracking number duoc cap nhat qua endpoint tracking.
4. Trang tracking client co the tra cuu theo `trackingNumber`.

## 9. Bien moi truong

### Client

Can cau hinh:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Neu khong cau hinh, client fallback ve `http://localhost:3000/api/v1`.

### Server

Server can cac bien moi truong lien quan den:

- `PORT`: cong chay API.
- `CLIENT_URL`: origin frontend duoc phep CORS.
- `CLIENT_URLS`: danh sach origin frontend cach nhau bang dau phay.
- `DATABASE_URL`: connection string PostgreSQL/Prisma.
- `DIRECT_URL`: direct connection string dung cho Prisma migration neu dung Supabase pooler.
- JWT secret va cac bien email/upload neu service tuong ung yeu cau.

Luu y: khong commit gia tri secret that vao repo. File `.env.example` hien tai can duoc lam sach neu co chua thong tin database/password that.

## 10. Lenh phat trien

### Client

Chay trong thu muc `client`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

Mac dinh Next.js chay tren `http://localhost:3000`.

### Server

Chay trong thu muc `server`:

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

API base URL mac dinh phu thuoc `PORT`, thuong la `http://localhost:3000/api/v1` hoac `http://localhost:3001/api/v1` tuy bien moi truong.

## 11. Quy uoc response API

Client `fetchApi` mong server tra ve format chuan:

```json
{
  "success": true,
  "data": {},
  "message": "optional",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Neu response khong co `success` va `data`, client fallback tra ve raw JSON.

## 12. Luu y ky thuat va rui ro hien tai

- `client/README.md` van la README mac dinh cua create-next-app, chua mo ta du an that.
- `PROJECT_DOCUMENTATION.md` la tai lieu tong hop moi o root repo.
- `server/.env.example` co ve dang chua gia tri database cu the; nen thay bang placeholder truoc khi public repo.
- Client fallback API ve `http://localhost:3000/api/v1`, trong khi server fallback port trong code la `3001` neu `PORT` khong co. Khi dev can thong nhat `PORT` va `NEXT_PUBLIC_API_URL`.
- Mot so route public hien chua gan middleware auth/authorize day du, vi du mot so CRUD campaign/flash-sale/collection/review/cart tuy vao file route. Can review lai neu trien khai production.
- Type client co noi dung camelCase va snake_case song song de thich nghi response server; khi refactor API nen chuan hoa mapper de giam loi UI.

## 13. Huong dan mo rong

Khi them tinh nang moi nen di theo thu tu:

1. Cap nhat Prisma schema neu can bang model/field moi.
2. Tao service trong `server/src/services` de gom business logic.
3. Tao controller trong `server/src/controllers` de xu ly HTTP.
4. Tao route trong `server/src/routes` va mount trong `routes/index.ts` neu la module moi.
5. Cap nhat `client/lib/api.ts` de frontend goi API.
6. Them/cap nhat type trong `client/lib/types.ts`.
7. Xay UI page/component trong `client/app` va `client/components`.
8. Kiem tra auth/permission bang middleware phu hop.
9. Chay build/lint/migration truoc khi merge.
