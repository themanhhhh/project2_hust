'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  EyeOff,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/useApi';
import { AdminLoading } from '@/components/admin/AdminLoading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminPostsPage() {
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = usePosts(page, 10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const posts = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-secondary text-secondary-foreground',
    published: 'bg-black text-white dark:bg-white dark:text-black',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Nháp',
    published: 'Đã đăng',
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeletingPost(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/posts/${id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        toast.success('Đã xóa bài viết');
        setDeletingPostId(null);
        refetch();
      } else {
        toast.error('Không thể xóa bài viết');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleToggleStatus = async (post: any) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/posts/${post.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        refetch();
      } else {
        toast.error('Không thể cập nhật trạng thái');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading && !data) {
    return <AdminLoading fullPage text="Đang tải bài viết..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
          <p className="text-muted-foreground">
            Quản lý các bài viết blog
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tạo bài viết
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng bài viết</p>
              <p className="text-2xl font-bold text-foreground">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Check className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã đăng</p>
              <p className="text-2xl font-bold text-foreground">
                {posts.filter((p: any) => p.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nháp</p>
              <p className="text-2xl font-bold text-foreground">
                {posts.filter((p: any) => p.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-4 border border-input rounded-lg bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Nháp</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Bài viết</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Slug</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Lượt xem</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Ngày tạo</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!loading && filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Chưa có bài viết nào
                  </td>
                </tr>
              )}
              {!loading && filteredPosts.map((post: any) => (
                <tr key={post.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{post.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{post.view_count || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[post.status] || 'bg-secondary text-secondary-foreground'}`}>
                      {statusLabels[post.status] || post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Sửa"
                      >
                          <Edit className="h-4 w-4 text-foreground" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={post.status === 'published' ? 'Chuyển sang nháp' : 'Đăng bài'}
                      >
                        {post.status === 'published' ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeletingPostId(post.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4 text-destructive group-hover:text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-input rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-input rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết đã chọn sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPost}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingPost}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={() => deletingPostId && handleDelete(deletingPostId)}
            >
              {isDeletingPost ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa bài viết'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
