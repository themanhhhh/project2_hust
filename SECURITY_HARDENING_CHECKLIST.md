# Security Hardening Checklist (hungserver)

Checklist này tập trung cho backend Express + TypeORM + PostgreSQL trong repo hiện tại.

## Cách dùng

- [ ] Mỗi mục được tick khi đã triển khai + verify.
- [ ] Ưu tiên hoàn thành theo thứ tự **P0 -> P1 -> P2**.
- [ ] Với mỗi mục, nên tạo issue/PR riêng để dễ review và rollback.

---

## P0 — Bắt buộc (Critical)

### Secrets & cấu hình nhạy cảm

- [ ] **Xóa toàn bộ secret hardcoded** (API key, secret key, JWT secret fallback) khỏi source code.
- [ ] Bắt buộc đọc secret từ environment variables; nếu thiếu thì fail fast khi start app.
- [ ] Rotate toàn bộ key đã từng commit lên git (Pinata, JWT, SMTP, DB).
- [ ] Tạo và commit file `.env.example` (không chứa giá trị thật), chuẩn hóa tên biến môi trường.
- [ ] Thiết lập secret scanning trong CI (ví dụ: gitleaks / GitHub secret scanning).

### AuthN / AuthZ

- [ ] Sửa nhất quán payload user trong request (`userId` vs `id`) để tránh bypass/lỗi runtime.
- [ ] Bắt buộc auth cho tất cả route write (POST/PUT/PATCH/DELETE) trừ route public có chủ đích.
- [ ] Áp dụng RBAC rõ ràng (admin/staff/customer) cho route quản trị (stats, seed, upload quản trị, CRUD catalog).
- [ ] Dùng JWT secret mạnh, thời gian sống token hợp lý, phân tách access/refresh token nếu cần.
- [ ] Không trả chi tiết lỗi đăng nhập gây user enumeration.

### HTTP / API protections

- [ ] Bổ sung `helmet` và cấu hình các header bảo mật quan trọng (CSP, X-Frame-Options, HSTS khi chạy HTTPS).
- [ ] Thêm **rate limit** cho auth endpoints (`/auth/login`, `/auth/register`, verify/resend OTP).
- [ ] CORS theo allowlist chặt chẽ theo từng môi trường; không dùng wildcard ngoài ngữ cảnh server-to-server có kiểm soát.
- [ ] Giới hạn body size cho JSON/urlencoded để tránh DoS.
- [ ] Chuẩn hóa error response, không lộ stack trace ở production.

### OTP / Email flow

- [ ] Lưu OTP ở dạng hash thay vì plain text trong DB.
- [ ] Giới hạn số lần verify OTP sai và số lần resend OTP theo thời gian.
- [ ] Thêm lockout tạm thời hoặc backoff khi brute force OTP.
- [ ] Log/audit các sự kiện OTP (create, verify success/fail, resend) không chứa OTP thật.

### Upload & File handling

- [ ] Kiểm tra MIME type + magic bytes (không chỉ dựa vào `mimetype` từ client).
- [ ] Quét malware cho file upload (nếu có điều kiện hạ tầng).
- [ ] Giới hạn kích thước/định dạng ảnh nghiêm ngặt, sanitize tên file.
- [ ] Chặn upload file không phải ảnh và trả lỗi chuẩn hoá.

---

## P1 — Nên làm sớm (High)

### Validation & dữ liệu đầu vào

- [ ] Áp dụng schema validation tập trung (zod/class-validator/Joi) cho toàn bộ request DTO.
- [ ] Validate query params pagination/sorting/filtering để tránh query bất thường.
- [ ] Sanitize input cho các field text để giảm nguy cơ injection ở tầng hiển thị/log.

### Database & truy vấn

- [ ] Tắt `synchronize` ở production (và tiến tới chỉ dùng migrations).
- [ ] Thiết lập migrations + quy trình rollout/rollback chuẩn.
- [ ] Dùng least-privilege DB user (không dùng superuser cho app runtime).
- [ ] Bật TLS bắt buộc cho DB ở mọi môi trường cloud.
- [ ] Rà soát toàn bộ query builder/raw query để tránh SQL injection.

### Logging / Monitoring / Audit

- [ ] Dùng structured logging (JSON) với correlation/request ID.
- [ ] Redact dữ liệu nhạy cảm khỏi logs (password, token, key, otp, PII).
- [ ] Bổ sung audit log cho hành động nhạy cảm (đổi mật khẩu, xóa dữ liệu, upload/delete ảnh).
- [ ] Thiết lập alert cho các tín hiệu tấn công (spike login fail, OTP fail, 5xx).

### Dependency & supply-chain

- [ ] Bật Dependabot/Renovate.
- [ ] Chạy `npm audit` định kỳ và xử lý lỗ hổng mức high/critical.
- [ ] Pin phiên bản runtime Node LTS và lockfile nhất quán CI/CD.

---

## P2 — Tăng cường nâng cao (Medium)

### Session & token lifecycle

- [ ] Thêm cơ chế revoke token (denylist/versioning) cho logout cưỡng bức.
- [ ] Xem xét refresh token rotation + phát hiện reuse.

### Application hardening

- [ ] Áp dụng idempotency key cho endpoint tạo đơn/thanh toán.
- [ ] Chống mass assignment ở tầng update/create (whitelist field cho từng role).
- [ ] Chuẩn hóa soft-delete policy và kiểm tra không lộ dữ liệu đã xóa.

### Hạ tầng / vận hành

- [ ] Bật WAF/CDN rule cơ bản cho API public.
- [ ] Thiết lập backup + restore drill định kỳ cho PostgreSQL.
- [ ] Tách môi trường dev/staging/prod với secret riêng biệt.
- [ ] Thiết lập SLO/SLA và runbook xử lý sự cố bảo mật.

### Quy trình phát triển an toàn

- [ ] PR template có mục security impact + data impact.
- [ ] Bổ sung checklist secure code review cho reviewer.
- [ ] Viết test bảo mật cơ bản: authz, rate-limit, input validation, upload abuse.

---

## Quick wins đề xuất cho repo này (thực hiện ngay)

- [ ] Gỡ ngay Pinata key/secret hardcoded khỏi code và rotate key cũ.
- [ ] Sửa bug mapping `req.user` giữa middleware và controller đổi mật khẩu.
- [ ] Đảo lại thứ tự route product để tránh route shadowing.
- [ ] Thêm `helmet` + `express-rate-limit` cho auth và OTP endpoints.
- [ ] Tạo `.env.example` + startup validation cho biến môi trường bắt buộc.

