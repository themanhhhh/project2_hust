import type { WorkSheet } from 'xlsx';
import { formatPrice } from './productMapper';

type OrderLike = Record<string, any>;

function normalizeOrderNumber(order: OrderLike): string {
  return order.order_number || order.orderNumber || order.id || '';
}

function normalizeCustomerName(order: OrderLike): string {
  return order.customer || order.user?.name || 'Khach hang';
}

function normalizeCustomerEmail(order: OrderLike): string {
  return order.email || order.user?.email || '';
}

function normalizeItems(order: OrderLike): OrderLike[] {
  return order.order_items || order.items || [];
}

function normalizeItemCount(order: OrderLike): number {
  return normalizeItems(order).reduce((acc: number, item: OrderLike) => acc + (item.quantity || 1), 0);
}

function normalizeItemNames(order: OrderLike): string {
  return normalizeItems(order).map((item: OrderLike) => item.product?.name || 'San pham').join(', ');
}

function normalizeDate(order: OrderLike): string {
  const rawDate = order.created_at || order.createdAt;
  if (!rawDate) return '';
  return new Date(rawDate).toLocaleString('vi-VN');
}

function normalizePaymentStatus(order: OrderLike): string {
  return order.payment_status || order.paymentStatus || '';
}

function normalizeProductName(item: OrderLike): string {
  return item.product?.name || item.name || 'San pham';
}

function normalizeProductSku(item: OrderLike): string {
  return item.product?.sku || item.sku || '';
}

const statusLabels: Record<string, string> = {
  pending: 'Cho xu ly',
  processing: 'Dang xu ly',
  shipped: 'Dang giao',
  delivered: 'Hoan thanh',
  cancelled: 'Da huy',
  confirmed: 'Da xac nhan',
  shipping: 'Dang van chuyen',
  pending_payment: 'Cho thanh toan',
  paid: 'Da thanh toan',
  awaiting_shipment: 'Cho tao shipment',
  awaiting_collection: 'Cho carrier lay hang',
  in_transit: 'Dang trung chuyen',
  completed: 'Completed',
};

function styleWorksheet(worksheet: WorkSheet, columnWidths: Array<{ wch: number }>) {
  const range = worksheet['!ref'];
  worksheet['!cols'] = columnWidths;
  worksheet['!autofilter'] = range ? { ref: range } : undefined;
  (worksheet as WorkSheet & { '!freeze'?: { xSplit?: number; ySplit?: number; topLeftCell?: string; activePane?: string; state?: string } })['!freeze'] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',
    activePane: 'bottomLeft',
    state: 'frozen',
  };

  if (!range) return;

  const start = range.split(':')[0];
  const end = range.split(':')[1] || start;
  const endColumn = end.replace(/[0-9]/g, '');

  for (let code = start.charCodeAt(0); code <= endColumn.charCodeAt(0); code += 1) {
    const cellRef = `${String.fromCharCode(code)}1`;
    const cell = worksheet[cellRef] as (typeof worksheet)[string] & { s?: Record<string, unknown> };
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1F4E78' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }
}

export async function exportOrdersToExcel(orders: OrderLike[], fileName: string) {
  const XLSX = await import('xlsx');

  const orderRows = orders.map((order, index) => ({
    STT: index + 1,
    'Ma don': normalizeOrderNumber(order),
    'Khach hang': normalizeCustomerName(order),
    Email: normalizeCustomerEmail(order),
    'So san pham': normalizeItemCount(order),
    'Danh sach san pham': normalizeItemNames(order),
    'Tong tien': Number(order.total || 0),
    'Tong tien hien thi': formatPrice(order.total || 0),
    'Trang thai': statusLabels[order.status] || order.status || '',
    'Thanh toan': normalizePaymentStatus(order),
    'Ngay dat': normalizeDate(order),
  }));

  const orderItemRows = orders.flatMap((order, orderIndex) => {
    const orderNumber = normalizeOrderNumber(order);
    const customerName = normalizeCustomerName(order);
    return normalizeItems(order).map((item: OrderLike, itemIndex: number) => ({
      STT: `${orderIndex + 1}.${itemIndex + 1}`,
      'Ma don': orderNumber,
      'Khach hang': customerName,
      SKU: normalizeProductSku(item),
      'San pham': normalizeProductName(item),
      'So luong': Number(item.quantity || 0),
      'Don gia': Number(item.price || 0),
      'Thanh tien': Number((item.price || 0) * (item.quantity || 0)),
      'Ngay dat': normalizeDate(order),
    }));
  });

  const ordersSheet = XLSX.utils.json_to_sheet(orderRows);
  const orderItemsSheet = XLSX.utils.json_to_sheet(orderItemRows.length ? orderItemRows : [{ STT: '', 'Ma don': '', 'Khach hang': '', SKU: '', 'San pham': '', 'So luong': '', 'Don gia': '', 'Thanh tien': '', 'Ngay dat': '' }]);

  styleWorksheet(ordersSheet, [
    { wch: 8 },
    { wch: 28 },
    { wch: 24 },
    { wch: 30 },
    { wch: 12 },
    { wch: 50 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 22 },
  ]);

  styleWorksheet(orderItemsSheet, [
    { wch: 10 },
    { wch: 28 },
    { wch: 24 },
    { wch: 18 },
    { wch: 42 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');
  XLSX.utils.book_append_sheet(workbook, orderItemsSheet, 'Order Items');
  XLSX.writeFile(workbook, fileName);
}
