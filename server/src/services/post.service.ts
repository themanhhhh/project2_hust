import prisma from '../lib/prisma';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now().toString(36);
}

export class PostService {
  async findAll(page = 1, limit = 10) {
    return this.findAllPaginated(page, limit);
  }

  async findAllPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.post.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
      prisma.post.count(),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findPublished(page = 1, limit = 10) {
    return this.findPublishedPaginated(page, limit);
  }

  async findPublishedPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.post.findMany({ where: { is_published: true }, skip, take: limit, orderBy: { created_at: 'desc' } }),
      prisma.post.count({ where: { is_published: true } }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    return prisma.post.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return prisma.post.findUnique({ where: { slug } });
  }

  async incrementViewCount(_id: string): Promise<void> {
    // Post schema doesn't have view_count, no-op for now
  }

  async createPost(data: any) {
    return this.create(data);
  }

  async create(data: any) {
    const slug = data.slug || generateSlug(data.title || '');
    return prisma.post.create({ data: { ...data, slug } });
  }

  async updatePost(id: string, data: any) {
    return this.update(id, data);
  }

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    if (!existing) return null;
    let slug = existing.slug;
    if (data.title && data.title !== existing.title) slug = generateSlug(data.title);
    return prisma.post.update({ where: { id }, data: { ...data, slug } });
  }

  async delete(id: string) {
    await prisma.post.delete({ where: { id } });
    return true;
  }
}
