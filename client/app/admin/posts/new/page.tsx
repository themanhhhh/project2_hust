'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { TiptapEditor } from '@/components/admin/TiptapEditor';
import { postApi, uploadApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSlugChange = (value: string) => {
    setSlug(value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    );
  };

  const handleSlugInputChange = (value: string) => {
    setIsSlugManuallyEdited(value.trim().length > 0);
    handleSlugChange(value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setFeaturedImage(result.url);
    } catch (error) {
      toast.error('Không thể tải lên hình ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    setLoading(true);
    try {
      await postApi.create({
        title,
        slug: slug || undefined,
        excerpt,
        content,
        featured_image: featuredImage || null,
        status,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
      } as any);

      toast.success('Tạo bài viết thành công');
      router.push('/admin/posts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPublish = async () => {
    setStatus('published');
    const form = document.getElementById('post-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Tạo bài viết mới</h1>
            <p className="text-muted-foreground">Tạo một bài viết blog mới</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            form="post-form"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={handleSaveAndPublish}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-slate-200"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Đăng bài
          </button>
        </div>
      </div>

      <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <label className="block text-sm font-medium mb-2">
              Tiêu đề <span className="text-foreground">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isSlugManuallyEdited) handleSlugChange(e.target.value);
              }}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full h-12 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Slug */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugInputChange(e.target.value)}
              placeholder="slug-duoc-tao-tu-dong"
              className="w-full h-10 px-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL: /blog/{slug || 'slug-cua-ban'}
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <label className="block text-sm font-medium mb-2">Mô tả ngắn</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Mô tả ngắn về bài viết..."
              rows={3}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <label className="block text-sm font-medium mb-2">
              Nội dung <span className="text-foreground">*</span>
            </label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <label className="block text-sm font-medium mb-2">Hình đại diện</label>
            {featuredImage ? (
              <div className="relative">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 rounded-full bg-black p-1 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="featured-image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="featured-image-upload"
                  className="cursor-pointer inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <ImageIcon className="h-8 w-8" />
                  )}
                  <span className="text-sm">Click để tải ảnh lên</span>
                </label>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <label className="block text-sm font-medium mb-2">Trạng thái</label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Đã đăng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <h3 className="font-medium mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || 'Tiêu đề SEO'}
                  className="w-full h-10 px-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={excerpt || 'Mô tả SEO'}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
