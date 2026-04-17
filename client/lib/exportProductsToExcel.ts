import { formatPrice } from './productMapper';
import { styleWorksheet } from './excelExportUtils';
import type { Product } from './types';

export async function exportProductsToExcel(products: Product[], fileName: string) {
  const XLSX = await import('xlsx');

  const rows = products.map((product, index) => {
    const stock = product.stock ?? product.stock_quantity ?? 0;
    const originalPrice = product.originalPrice ?? product.original_price;

    return {
      STT: index + 1,
      'Ma san pham': product.id,
      'Ten san pham': product.name,
      Slug: product.slug,
      SKU: product.sku || '',
      'Thuong hieu': product.brand?.name || '',
      'Danh muc': product.category?.name || '',
      'Gia ban': Number(product.price || 0),
      'Gia ban hien thi': formatPrice(Number(product.price || 0)),
      'Gia goc': originalPrice ? Number(originalPrice) : '',
      'Gia goc hien thi': originalPrice ? formatPrice(Number(originalPrice)) : '',
      'Ton kho': Number(stock),
      Badge: product.badge || 'none',
      Rating: product.rating || 0,
      'Trang thai': product.is_active ?? product.isActive ? 'Dang hien' : 'Da an',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  styleWorksheet(worksheet, [
    { wch: 8 },
    { wch: 40 },
    { wch: 32 },
    { wch: 26 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, fileName);
}
