import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import CrmCustomizeButton from "@/components/crm/CrmCustomizeButton";
import { CrmNavPrefs } from "@/components/crm/CrmNavPrefs";
import CrmTestDataToggle from "@/components/crm/CrmTestDataToggle";
import { CRM_TEST_DATA_COOKIE } from "@/lib/crm-test-data";

export function CrmShell({
  active,
  eyebrow,
  title,
  children,
}: {
  active: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const testDataEnabled = cookies().get(CRM_TEST_DATA_COOKIE)?.value !== "off";

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-nursery-midnight">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-nursery-sage/20 bg-nursery-midnight text-nursery-ivory lg:block">
        <div className="flex h-28 items-center gap-4 border-b border-white/10 px-5">
          <Link href="/" className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-sm transition-opacity hover:opacity-80">
            <Image src="/images/jimbo_logo.png" alt="Jimbo's Nursery" width={92} height={71} style={{ width: '100%', height: 'auto' }} className="object-contain" priority />
          </Link>
          <div>
            <p className="font-serif text-2xl leading-none">Jimbo's CRM</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-nursery-sage">Owner Command</p>
          </div>
        </div>
        <CrmNavPrefs active={active} variant="sidebar" />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 border-b border-nursery-sage/20 bg-[#f7f3ea]/90 backdrop-blur">
          <div className="flex min-h-20 flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-nursery-terracotta">{eyebrow}</p>
              <h1 className="mt-1 font-serif text-3xl font-semibold text-nursery-midnight md:text-4xl">{title}</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form method="get" className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-nursery-sage/25 bg-white px-3 shadow-sm sm:w-72">
                <Search className="h-4 w-4 shrink-0 text-nursery-midnight/45" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search customers, quotes, SKU..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-nursery-midnight outline-none placeholder:text-nursery-midnight/45"
                />
              </form>
              <CrmTestDataToggle initialEnabled={testDataEnabled} />
              <CrmCustomizeButton active={active} />
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-nursery-sage/15 px-5 py-3 lg:hidden">
            <CrmNavPrefs active={active} variant="mobile" />
          </nav>
        </header>

        <main className="px-5 py-6 lg:px-8">
          {!testDataEnabled ? (
            <section className="mb-6 rounded-lg border border-nursery-terracotta/25 bg-nursery-terracotta/10 px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-nursery-terracotta">Test Data Off</p>
              <p className="mt-2 text-sm leading-6 text-nursery-midnight/70">
                Sample CRM records are hidden. The CRM modules remain available with empty lists and zeroed metrics.
              </p>
            </section>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
