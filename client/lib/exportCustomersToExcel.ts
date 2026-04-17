import { formatPrice } from './productMapper';
import { styleWorksheet } from './excelExportUtils';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
  joinedDate: string;
  lastOrderDate: string;
};

export async function exportCustomersToExcel(customers: CustomerRow[], fileName: string) {
  const XLSX = await import('xlsx');

  const rows = customers.map((customer, index) => ({
    STT: index + 1,
    'Ma khach hang': customer.id,
    'Ten khach hang': customer.name,
    Email: customer.email,
    'So dien thoai': customer.phone,
    'Tong don hang': customer.totalOrders,
    'Tong chi tieu': Number(customer.totalSpent || 0),
    'Tong chi tieu hien thi': formatPrice(customer.totalSpent || 0),
    'Trang thai': customer.status === 'active' ? 'Hoat dong' : 'Khong hoat dong',
    'Ngay tham gia': customer.joinedDate,
    'Don hang gan nhat': customer.lastOrderDate || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  styleWorksheet(worksheet, [
    { wch: 8 },
    { wch: 40 },
    { wch: 24 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  XLSX.writeFile(workbook, fileName);
}
