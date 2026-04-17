'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Eye, FileText, Loader2, User } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { Button } from '@/components/ui/button';
import { usePostBySlug } from '@/hooks/useApi';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: post, loading, error } = usePostBySlug(slug);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {loading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !post ? (
          <div className="container mx-auto px-4 py-24">
            <div className="mx-auto max-w-2xl rounded-[28px] border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <FileText className="mx-auto mb-5 h-16 w-16 text-gray-300" />
              <h2 className="text-2xl font-bold text-black">Không tìm thấy bài viết</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ khỏi hệ thống.
              </p>
              <Button asChild className="mt-8 rounded-full bg-black px-6 text-white hover:bg-gray-800">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại blog
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <article>
            <div className="border-b border-gray-100 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)]">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Link href="/" className="transition-colors hover:text-foreground">Trang chủ</Link>
                  <span>/</span>
                  <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
                  <span>/</span>
                  <span className="truncate text-foreground">{post.title}</span>
                </nav>
              </div>

              <div className="container mx-auto px-4 pb-12 pt-6 md:pb-16">
                <div className="mx-auto max-w-4xl">
                  <Link
                    href="/blog"
                    className="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-black"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại blog
                  </Link>

                  <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-gray-700">
                    Editorial Note
                  </div>

                  <h1 className="max-w-4xl text-4xl font-bold uppercase leading-tight tracking-[0.08em] text-black md:text-5xl">
                    {post.title}
                  </h1>

                  <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author?.name || 'Admin'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {post.view_count || 0} lượt xem
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 py-10 md:py-14">
              <div className="mx-auto max-w-5xl">
                {post.featured_image && (
                  <div className="mb-10 overflow-hidden rounded-[32px] border border-gray-100 bg-gray-50 shadow-[0_32px_80px_-45px_rgba(0,0,0,0.35)]">
                    <img src={post.featured_image} alt={post.title} className="h-auto w-full object-cover" />
                  </div>
                )}

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    <div
                      className="prose prose-lg max-w-none text-black prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-[0.04em] prose-headings:text-black prose-p:leading-8 prose-p:text-gray-700 prose-strong:text-black prose-a:text-black prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-gray-600 prose-img:rounded-[24px] prose-blockquote:border-l-2 prose-blockquote:border-black prose-blockquote:pl-5 prose-blockquote:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:text-sm prose-pre:rounded-[24px] prose-pre:bg-black prose-pre:text-white"
                      dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />
                  </div>

                  <aside className="space-y-6">
                    <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-6">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-black">Thông tin bài viết</h3>
                      <div className="mt-5 space-y-4 text-sm text-gray-600">
                        <div>
                          <div className="text-xs uppercase tracking-[0.16em] text-gray-500">Tác giả</div>
                          <div className="mt-1 text-black">{post.author?.name || 'Admin'}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.16em] text-gray-500">Ngày đăng</div>
                          <div className="mt-1 text-black">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.16em] text-gray-500">Lượt xem</div>
                          <div className="mt-1 text-black">{post.view_count || 0}</div>
                        </div>
                      </div>
                    </div>

                    {post.excerpt && (
                      <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-black">Tóm tắt</h3>
                        <p className="mt-4 text-sm leading-7 text-gray-600">{post.excerpt}</p>
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}
