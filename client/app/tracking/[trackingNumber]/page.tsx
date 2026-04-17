'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft, CheckCircle2, CircleDashed, MapPin, PackageSearch, Truck } from 'lucide-react';
import { Footer } from '@/components/shop/Footer';
import { Header } from '@/components/shop/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useShipmentByTracking } from '@/hooks/useApi';

const shipmentLabel: Record<string, string> = {
  pending: 'Moi tao',
  picking: 'Dang lay hang',
  packing: 'Dang dong goi',
  ready_for_pickup: 'San sang pickup',
  picked_up: 'Da ban giao',
  in_transit: 'Dang trung chuyen',
  out_for_delivery: 'Dang giao den nguoi mua',
  delivered: 'Da giao thanh cong',
  failed_delivery: 'Giao that bai',
  returned: 'Da hoan tra',
};

function parseTrackingHistory(trackingHistory: any) {
  if (!trackingHistory) return [];
  if (Array.isArray(trackingHistory)) return trackingHistory;

  try {
    const parsed = JSON.parse(trackingHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function TrackingPage({ params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = use(params);
  const { data: shipment, loading, error } = useShipmentByTracking(trackingNumber);
  const timeline = parseTrackingHistory((shipment as any)?.tracking_history);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_38%,_#ffffff_100%)]">
        <div className="border-b bg-white/80 backdrop-blur">
          <div className="container mx-auto flex items-center gap-3 px-4 py-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Trang chu</Link>
            <span>/</span>
            <span className="text-foreground">Tracking</span>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700">
                SmashX Tracking
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Theo doi van don {trackingNumber}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Buyer co the xem trang thai giao nhan, moc thoi gian tracking va thong tin carrier tai day.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/account/orders">
                <ArrowLeft className="h-4 w-4" />
                Về danh sách đơn hàng
              </Link>
            </Button>
          </div>

          {loading && (
            <Card>
              <CardContent className="flex min-h-[240px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CircleDashed className="h-4 w-4 animate-spin" /> Đang tải tracking...
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && (error || !shipment) && (
            <Card>
              <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
                <PackageSearch className="h-12 w-12 text-slate-300" />
                <div>
                  <div className="text-lg font-semibold text-slate-900">Khong tim thay tracking</div>
                  <p className="mt-2 text-sm text-slate-600">Ma van don nay chua ton tai hoac chua duoc dong bo tu fulfillment service.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && shipment && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Truck className="h-5 w-5 text-sky-600" /> Hanh trinh giao hang
                  </CardTitle>
                  <CardDescription>
                    Carrier: {(shipment as any).carrier || 'Dang cap nhat'} - Shipment: {shipmentLabel[(shipment as any).status] || (shipment as any).status}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeline.length > 0 ? timeline.map((event: any, index: number) => (
                    <div key={`${event.timestamp || index}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        {index < timeline.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="font-medium text-slate-900">{shipmentLabel[event.status] || event.status || 'Tracking event'}</div>
                          <div className="text-xs text-slate-500">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString('vi-VN') : '--'}
                          </div>
                        </div>
                        {(event.note || event.location) && (
                          <div className="mt-2 text-sm text-slate-600">{event.note || 'Dang cap nhat'}{event.location ? ` - ${event.location}` : ''}</div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                      Chua co event tracking nao duoc dong bo.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Thong tin van don</CardTitle>
                    <CardDescription className="text-slate-300">Cap nhat theo shipment hien tai</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="text-slate-400">Tracking</div>
                        <div className="mt-2 break-all font-medium text-white">{(shipment as any).tracking_number}</div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="text-slate-400">Trang thai</div>
                        <div className="mt-2 font-medium text-white">{shipmentLabel[(shipment as any).status] || (shipment as any).status}</div>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="text-slate-400">Carrier</div>
                        <div className="mt-2 font-medium text-white">{(shipment as any).carrier || '--'}</div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="text-slate-400">Service</div>
                        <div className="mt-2 font-medium text-white">{(shipment as any).carrier_service || '--'}</div>
                      </div>
                    </div>
                    {(shipment as any).estimated_delivery && (
                      <div className="rounded-2xl bg-gradient-to-r from-sky-500/20 to-cyan-400/10 p-4 text-slate-100">
                        Du kien giao: {new Date((shipment as any).estimated_delivery).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" /> Diem giao nhan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-600">
                    <div>
                      <div className="font-medium text-slate-900">Nguoi nhan</div>
                      <div className="mt-1">{(shipment as any).delivery_name || 'Dang cap nhat'}</div>
                      <div>{(shipment as any).delivery_phone || ''}</div>
                      <div>{(shipment as any).delivery_address || 'Dia chi se duoc cap nhat sau khi tao shipment.'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Diem lay hang</div>
                      <div className="mt-1">{(shipment as any).pickup_name || 'SmashX'}</div>
                      <div>{(shipment as any).pickup_phone || ''}</div>
                      <div>{(shipment as any).pickup_address || 'Kho dang cap nhat.'}</div>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  Neu shipment chuyen sang giao that bai hoac hoan tra, day la diem de noi tiep qua quy trinh return/refund sau nay.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
