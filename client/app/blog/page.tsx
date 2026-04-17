'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Calendar, Eye, FileText, Loader2 } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { Button } from '@/components/ui/button';
import { usePublishedPosts } from '@/hooks/useApi';

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, loading } = usePublishedPosts(page, 9);

  const posts = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="border-b border-gray-100 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.05),_transparent_38%),linear-gradient(180deg,_#ffffff,_#f8fafc)]">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">Trang chủ</Link>
              <span>/</span>
              <span className="text-foreground">Blog</span>
            </nav>
          </div>

          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-gray-700">
                SmashX Journal
              </div>
              <h1 className="text-4xl font-bold uppercase tracking-[0.12em] text-black md:text-5xl">
                Blog cầu lông và phong cách chơi
              </h1>
              <p className="mt-5 text-sm leading-7 text-gray-600 md:text-base">
                Nơi tổng hợp bài viết về kỹ thuật, lựa chọn thiết bị, xu hướng sản phẩm và những câu chuyện xoay quanh thế giới cầu lông hiện đại.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16">
          {loading && !posts.length ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 px-6 py-20 text-center">
              <FileText className="mx-auto mb-5 h-14 w-14 text-gray-300" />
              <h2 className="text-xl font-semibold text-black">Chưa có bài viết nào</h2>
              <p className="mt-2 text-sm text-muted-foreground">Hãy quay lại sau để xem các bài viết mới nhất.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="text-sm text-muted-foreground">
                  {pagination.total} bài viết đang được hiển thị
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Editorial selection
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post: any, index: number) => (
                  <article
                    key={post.id}
                    className={`group overflow-hidden rounded-[28px] border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.22)] ${
                      index === 0 ? 'xl:col-span-2 xl:grid xl:grid-cols-[1.15fr_0.85fr]' : ''
                    }`}
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      {post.featured_image ? (
                        <div className={`relative overflow-hidden ${index === 0 ? 'min-h-[320px] xl:min-h-full' : 'h-64'}`}>
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center bg-[linear-gradient(135deg,_#f3f4f6,_#e5e7eb)] ${index === 0 ? 'min-h-[320px] xl:min-h-full' : 'h-64'}`}>
                          <FileText className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                    </Link>

                    <div className={`flex flex-col justify-between p-6 md:p-7 ${index === 0 ? 'xl:p-10' : ''}`}>
                      <div>
                        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5" />
                            {post.view_count || 0} lượt xem
                          </span>
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <h2 className={`font-bold uppercase tracking-[0.06em] text-black transition-colors group-hover:text-gray-600 ${index === 0 ? 'text-3xl leading-tight' : 'text-xl leading-snug'}`}>
                            {post.title}
                          </h2>
                        </Link>

                        {post.excerpt && (
                          <p className={`mt-4 text-sm leading-7 text-gray-600 ${index === 0 ? 'max-w-xl text-base' : ''}`}>
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="mt-8">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-black transition-all hover:gap-3"
                        >
                          Đọc tiếp
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="rounded-full border-black/10 px-5"
                  >
                    Trước
                  </Button>
                  <div className="min-w-[130px] text-center text-sm text-muted-foreground">
                    Trang {pagination.page} / {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-full border-black/10 px-5"
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
