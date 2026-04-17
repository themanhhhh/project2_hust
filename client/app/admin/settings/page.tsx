'use client';

import { useMemo, useState } from 'react';
import {
  Bell,
  CreditCard,
  Globe,
  Save,
  Shield,
  Store,
  Truck,
  Upload,
} from 'lucide-react';

const tabs = [
  { id: 'store', label: 'Cua hang', icon: Store, eyebrow: 'Brand core' },
  { id: 'payment', label: 'Thanh toan', icon: CreditCard, eyebrow: 'Checkout' },
  { id: 'shipping', label: 'Van chuyen', icon: Truck, eyebrow: 'Fulfillment' },
  { id: 'notifications', label: 'Thong bao', icon: Bell, eyebrow: 'Operations' },
  { id: 'security', label: 'Bao mat', icon: Shield, eyebrow: 'Access' },
] as const;

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200/70"
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition resize-none focus:border-slate-950 focus:ring-4 focus:ring-slate-200/70"
    />
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <div className="h-7 w-12 rounded-full bg-slate-200 transition peer-checked:bg-slate-900 peer-focus:ring-4 peer-focus:ring-slate-200 after:absolute after:start-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
    </label>
  );
}

function ActionBar({ label = 'Luu thay doi' }: { label?: string }) {
  return (
    <div className="flex justify-end border-t border-slate-200 pt-5">
      <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
        <Save className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('store');

  const activeMeta = useMemo(() => tabs.find((tab) => tab.id === activeTab) || tabs[0], [activeTab]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_34%),linear-gradient(135deg,_#ffffff,_#f8fafc_48%,_#eef2f7)] shadow-sm">
        <div className="flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600 backdrop-blur">
              SmashX Settings Console
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Cai dat van hanh theo giao dien storefront</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Dong bo nhan dien admin voi website ban hang: nen sang, chu den dam, vien xam mem va diem nhan toi gian de giu dung cam giac SmashX tren toan he thong.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Storefront tone', value: 'Black / White' },
              { label: 'Current module', value: activeMeta.label },
              { label: 'Control mode', value: 'Manual save' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 px-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Settings map</div>
          </div>
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition ${
                    active
                      ? 'bg-slate-950 text-white shadow-[0_18px_38px_-18px_rgba(15,23,42,0.6)]'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${active ? 'border-white/15 bg-white/10' : 'border-slate-200 bg-slate-50'}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[11px] uppercase tracking-[0.2em] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{tab.eyebrow}</div>
                    <div className="mt-1 font-medium">{tab.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          {activeTab === 'store' && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <SectionTitle title="Thong tin cua hang" description="Cap nhat bo nhan dien storefront, noi dung lien he va thong diep thuong hieu hien tren trang ban hang." />

                  <div className="grid gap-4">
                    <Field label="Ten cua hang">
                      <TextInput type="text" defaultValue="BadmintonPro" />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Email lien he">
                        <TextInput type="email" defaultValue="contact@badmintonpro.vn" />
                      </Field>
                      <Field label="So dien thoai">
                        <TextInput type="tel" defaultValue="1900 1234" />
                      </Field>
                    </div>

                    <Field label="Dia chi">
                      <TextInput type="text" defaultValue="123 Duong Nguyen Hue, Quan 1, TP.HCM" />
                    </Field>

                    <Field label="Mo ta storefront">
                      <TextArea defaultValue="Cua hang chuyen cung cap vot cau long chinh hang tu cac thuong hieu hang dau the gioi." />
                    </Field>
                  </div>
                </div>

                <div className="space-y-6 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Visual identity</div>
                  <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_50px_-24px_rgba(15,23,42,0.7)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Store mark</div>
                        <div className="mt-2 text-2xl font-semibold tracking-[0.18em] uppercase">BP</div>
                      </div>
                      <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Tai logo
                      </button>
                    </div>
                    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Theme cue</div>
                      <div className="mt-3 flex gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-white" />
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 ring-1 ring-white/10" />
                        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3 text-slate-900">
                      <Globe className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <div className="font-medium">Storefront appearance</div>
                        <div className="text-sm text-slate-500">Giu nguyen phong cach sang, toi gian, sac den lam diem nhan chinh.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <ActionBar />
              </div>
            </section>
          )}

          {activeTab === 'payment' && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <SectionTitle title="Phuong thuc thanh toan" description="Kiem soat cac cong thanh toan dang bat tren website va giu tra nghiem checkout gon, ro rang, de quet." />
              <div className="mt-6 space-y-4">
                {[
                  { name: 'Thanh toan khi nhan hang (COD)', enabled: true },
                  { name: 'Chuyen khoan ngan hang', enabled: true },
                  { name: 'Vi MoMo', enabled: false },
                  { name: 'Vi ZaloPay', enabled: false },
                  { name: 'VNPAY', enabled: true },
                ].map((method) => (
                  <div key={method.name} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] px-5 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{method.name}</div>
                      <div className="mt-1 text-sm text-slate-500">Hien thi trong buoc checkout va duoc canh chinh theo phong cach storefront.</div>
                    </div>
                    <Toggle defaultChecked={method.enabled} />
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <ActionBar />
              </div>
            </section>
          )}

          {activeTab === 'shipping' && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <SectionTitle title="Cai dat van chuyen" description="Dong bo phi ship, nguong free ship va doi tac giao nhan voi luong fulfillment hien tai." />
              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <Field label="Phi van chuyen mac dinh">
                    <TextInput type="text" defaultValue="30,000" />
                  </Field>
                  <Field label="Mien phi ship tu don">
                    <TextInput type="text" defaultValue="500,000" />
                  </Field>
                </div>
                <div className="space-y-3">
                  {['Giao hang nhanh (GHN)', 'Giao hang tiet kiem (GHTK)', 'Viettel Post', 'J&T Express'].map((carrier) => (
                    <label key={carrier} className="flex cursor-pointer items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:bg-slate-50">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />
                      <span className="font-medium text-slate-800">{carrier}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <ActionBar />
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <SectionTitle title="Cai dat thong bao" description="Quản lý cac canh bao van hanh quan trong de doi van hanh không bo lo đơn hàng mới, hủy đơn hay canh bao ton kho." />
              <div className="mt-6 space-y-4">
                {[
                  { name: 'Thông báo đơn hàng mới', desc: 'Nhận thông báo khi có đơn hàng mới', enabled: true },
                  { name: 'Thông báo hủy đơn', desc: 'Nhận thông báo khi khách hủy đơn hàng', enabled: true },
                  { name: 'Thông báo hết hàng', desc: 'Nhận thông báo khi sản phẩm hết hàng', enabled: true },
                  { name: 'Thông báo đánh giá', desc: 'Nhận thông báo khi có đánh giá mới', enabled: false },
                  { name: 'Báo cáo hàng tuần', desc: 'Nhận báo cáo doanh thu hàng tuần qua email', enabled: true },
                ].map((notif) => (
                  <div key={notif.name} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{notif.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{notif.desc}</div>
                    </div>
                    <Toggle defaultChecked={notif.enabled} />
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <ActionBar />
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <SectionTitle title="Bao mat tai khoan" description="Cap nhat mat khau quan tri va cac lop bao ve bo sung de giu backend admin tach biet voi trai nghiem mua sam thong thuong." />
              <div className="mt-6 grid gap-4">
                <Field label="Mat khau hien tai">
                  <TextInput type="password" placeholder="........" />
                </Field>
                <Field label="Mat khau moi">
                  <TextInput type="password" placeholder="........" />
                </Field>
                <Field label="Xac nhan mat khau moi">
                  <TextInput type="password" placeholder="........" />
                </Field>

                <label className="mt-2 flex cursor-pointer items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Xac thuc 2 buoc (2FA)</div>
                    <div className="mt-1 text-sm text-slate-500">Them mot lop bao mat cho tai khoan admin truoc khi thao tac voi don hang, fulfillment va bao cao.</div>
                  </div>
                </label>
              </div>
              <div className="mt-8">
                <ActionBar label="Cap nhat bao mat" />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
