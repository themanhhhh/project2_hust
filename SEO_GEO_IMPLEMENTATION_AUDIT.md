# SEO/GEO Implementation Audit

Date: 2026-06-12

This file summarizes the current SEO/GEO implementation status of the SmashX project and compares it with the content currently described in `main.tex`.

## 1. Current Implementation Status

### Implemented In Code

The project now has a practical SEO/GEO foundation implemented in the Next.js frontend.

Implemented items:

- Global metadata in `client/app/layout.tsx`.
- `metadataBase` using `NEXT_PUBLIC_SITE_URL` with fallback to `http://localhost:3000`.
- Global title template and default title.
- Global description and keywords.
- Canonical URL support through `alternates.canonical`.
- Open Graph metadata for social sharing.
- Twitter card metadata.
- Vietnamese language declaration through `<html lang="vi">`.
- Dynamic product metadata in `client/app/products/[id]/page.tsx`.
- Dynamic blog post metadata in `client/app/blog/[slug]/page.tsx`.
- Product JSON-LD schema in `client/app/products/[id]/page.tsx`.
- Article JSON-LD schema in `client/app/blog/[slug]/page.tsx`.
- Organization JSON-LD schema in `client/app/layout.tsx`.
- WebSite JSON-LD schema with `SearchAction` in `client/app/layout.tsx`.
- BreadcrumbList JSON-LD schema in `client/app/products/[id]/page.tsx`.
- BreadcrumbList JSON-LD schema in `client/app/blog/[slug]/page.tsx`.
- FAQPage JSON-LD schema in `client/app/faq/layout.tsx`.
- Sitemap generation in `client/app/sitemap.ts`.
- Robots configuration in `client/app/robots.ts`.
- Noindex metadata for account, cart, checkout and login route groups.
- Static metadata for public pages and route groups:
  - `client/app/products/layout.tsx`
  - `client/app/blog/layout.tsx`
  - `client/app/contact/layout.tsx`
  - `client/app/faq/layout.tsx`
  - `client/app/yonex/layout.tsx`
  - `client/app/about/page.tsx`
  - `client/app/policy/page.tsx`

### Public Routes Covered

The following public routes have SEO metadata coverage:

- `/`
- `/products`
- `/products/[id]`
- `/blog`
- `/blog/[slug]`
- `/about`
- `/contact`
- `/faq`
- `/policy`
- `/yonex`

The generated sitemap includes:

- Static public routes.
- Active products from the product API.
- Published blog posts from the post API.

The generated robots file allows public crawling and blocks private or transactional areas:

- `/admin/`
- `/seller/`
- `/checkout/`
- `/account/`

## 2. Verification

Latest verification command:

```bash
npm run build
```

Result:

- Build passed successfully in `D:\doan2\client`.
- Next.js generated `/robots.txt`.
- Next.js generated `/sitemap.xml`.
- Dynamic routes `/products/[id]` and `/blog/[slug]` remain valid.

## 3. Comparison With `main.tex`

### Sections That Match The Current System

The following ideas in `main.tex` are still accurate:

- SmashX has a foundation for SEO/GEO.
- The system uses structured product, category, brand, collection, post and review data.
- Public pages such as products, product detail, blog, article detail, about, contact, policy and brand/landing pages are useful for indexing.
- GEO potential comes from domain-specific badminton content, product descriptions, collections, brand context and advisory blog posts.
- The system should not be described as fully optimized for SEO/GEO yet.

### Sections That Are Now Outdated

Some statements in `main.tex` were accurate before the latest implementation but are now outdated.

Outdated statement in `main.tex` around lines 301-303:

```text
Đây là nền tảng quan trọng để mở rộng các kỹ thuật như sinh metadata tự động, tạo sitemap, bổ sung schema markup...
...cần tiếp tục bổ sung metadata động cho từng trang, sitemap, robots.txt, schema markup, canonical URL...
```

Current status:

- Metadata is no longer only a future extension.
- Sitemap is implemented.
- Robots.txt is implemented.
- Canonical URLs are implemented for global, static and dynamic public pages.
- Product schema markup is implemented.
- Article schema markup is implemented.
- Organization and WebSite schema markup are implemented.
- BreadcrumbList schema markup is implemented for product and blog detail pages.
- FAQPage schema markup is implemented for `/faq`.

Outdated statement in `main.tex` around line 1359:

```text
Các hạng mục cần bổ sung trong giai đoạn tiếp theo gồm: metadata động cho từng trang, sitemap, robots.txt, schema markup cho Product, Article...
```

Current status:

- Dynamic metadata for product detail and blog detail pages has been added.
- Sitemap and robots.txt have been added.
- Product and Article schema markup have been added.
- Organization, WebSite, SearchAction, BreadcrumbList and FAQPage schema markup have been added.
- Remaining schema work should focus on reliable `Review`/`AggregateRating` data and deeper content relationships.

## 4. Suggested Updates For `main.tex`

### Replace The Current Limitation Wording

Current idea:

```text
Hệ thống mới dừng ở mức có nền tảng để phục vụ SEO/GEO. Để đạt hiệu quả hoàn chỉnh hơn, cần tiếp tục bổ sung metadata động cho từng trang, sitemap, robots.txt, schema markup, canonical URL...
```

Suggested replacement:

```text
Ở trạng thái hiện tại, hệ thống đã triển khai một số thành phần kỹ thuật nền tảng phục vụ SEO/GEO như metadata toàn cục, metadata cho các trang public chính, metadata động cho trang chi tiết sản phẩm và bài viết, canonical URL, sitemap.xml, robots.txt và schema markup dạng JSON-LD cho Organization, WebSite, SearchAction, Product, Article, BreadcrumbList và FAQPage. Các thành phần này giúp công cụ tìm kiếm thu thập dữ liệu tốt hơn, đồng thời cung cấp ngữ cảnh có cấu trúc để các hệ thống AI dễ hiểu nội dung sản phẩm, bài viết, cấu trúc website và nhóm câu hỏi hỗ trợ khách hàng.

Tuy nhiên, hệ thống chưa thể xem là đã tối ưu SEO/GEO hoàn chỉnh. Các hạng mục cần tiếp tục bổ sung gồm schema Review/AggregateRating dựa trên dữ liệu đánh giá đáng tin cậy; tối ưu liên kết nội bộ giữa bài viết, sản phẩm, danh mục và thương hiệu; chuẩn hóa nội dung theo dạng câu hỏi--trả lời; bổ sung thông tin tác giả, ngày cập nhật, nguồn tham khảo cho bài viết chuyên sâu; và đo lường hiệu quả thực tế thông qua Search Console hoặc công cụ phân tích truy cập.
```

### Replace The Evaluation Section Limitation

Current idea around `main.tex` line 1359:

```text
Các hạng mục cần bổ sung trong giai đoạn tiếp theo gồm: metadata động cho từng trang, sitemap, robots.txt, schema markup cho Product, Article, BreadcrumbList và Review, canonical URL...
```

Suggested replacement:

```text
Tuy nhiên, hệ thống chưa thể xem là đã tối ưu SEO/GEO hoàn chỉnh. Mặc dù đã có metadata, sitemap, robots.txt, canonical URL và các schema Organization, WebSite, SearchAction, Product, Article, BreadcrumbList và FAQPage, hệ thống vẫn cần bổ sung Review/AggregateRating khi dữ liệu đánh giá đủ tin cậy; cải thiện liên kết nội bộ; chuẩn hóa dữ liệu tác giả/ngày cập nhật/nguồn tham khảo; tối ưu tốc độ tải trang và đo lường hiệu quả index thực tế sau khi triển khai production.
```

## 5. Remaining SEO/GEO Work

Recommended next implementation items:

1. Add `Review` or improve `AggregateRating` only after review data is reliable and count values are accurate.
2. Improve internal links between blog posts, products, categories, brands and collections.
3. Standardize article fields such as author, updated date, excerpt, thumbnail and references.
4. Configure `NEXT_PUBLIC_SITE_URL` correctly in production.
5. Validate generated rich results with Google Rich Results Test after deployment.
6. Measure real indexing and search performance with Google Search Console after deployment.

## 6. Data And Documentation Consistency Notes

The implementation is functional, but some data model and documentation areas should still be synchronized.

Known consistency risks:

- `Post` fields differ across backend, frontend and documentation in places such as `thumbnail`, `featured_image`, `meta_title`, `meta_description`, `status`, `is_published`, `view_count` and `author`.
- `Collection` fields differ in places such as `image_url`, `thumbnail`, `country`, `sport` and `achievement`.
- `Address` fields differ in places such as `address_line`, `street`, `city` and `province`.
- Some API responses still mix `snake_case` and `camelCase`, so frontend bridge types are currently used.
- The public tracking page exists, but backend tracking access should be reviewed because the route may still be protected for admin/seller flows.

## 7. Recommended Final Description For The Report

Short report-ready summary:

```text
Hệ thống SmashX đã được bổ sung nền tảng kỹ thuật phục vụ SEO/GEO trên frontend Next.js. Cụ thể, hệ thống có metadata toàn cục, metadata tĩnh cho các trang public chính, metadata động cho trang chi tiết sản phẩm và bài viết, canonical URL, sitemap.xml, robots.txt, Open Graph/Twitter metadata và JSON-LD cho Organization, WebSite, SearchAction, Product, Article, BreadcrumbList và FAQPage. Các thành phần này giúp công cụ tìm kiếm thu thập dữ liệu hiệu quả hơn và giúp các hệ thống AI có thêm ngữ cảnh có cấu trúc khi phân tích website, sản phẩm, bài viết, điều hướng và nhóm câu hỏi hỗ trợ khách hàng.

Tuy nhiên, SEO/GEO của hệ thống vẫn ở mức nền tảng, chưa phải tối ưu hoàn chỉnh. Các hướng cải tiến tiếp theo gồm bổ sung Review/AggregateRating khi dữ liệu đánh giá đủ tin cậy; cải thiện liên kết nội bộ; chuẩn hóa nội dung tư vấn theo câu hỏi tự nhiên; bổ sung tác giả, ngày cập nhật và nguồn tham khảo; đồng thời đo lường hiệu quả thực tế sau khi triển khai production.
```
