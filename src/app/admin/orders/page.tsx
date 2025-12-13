import { getAdminOrders } from '@/lib/googleSheets';
import OrdersList from './OrdersList';

export const metadata = {
  title: 'Manage Orders | Khazaana Admin',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const status = params.status || 'all';
  const search = params.search || '';
  
  // Server-side fetch
  const data = await getAdminOrders(page, 20, status, search);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 font-medium mt-1">View and manage customer orders.</p>
        </div>
      </div>

      <OrdersList 
        orders={data.orders || []} 
        pagination={data.pagination || { total: 0, page: 1, pages: 0 }}
        searchParams={params}
      />
    </div>
  );
}
