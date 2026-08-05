'use client';

import { useState, useEffect, useRef } from 'react';
import { GripVertical, Info } from 'lucide-react';
import { WIDGET_CATALOG, type DashData } from '@/components/crm/WidgetRegistry';

export const WIDGET_STORAGE_KEY = 'crm-active-widgets';
export const WIDGET_LAYOUT_KEY = 'crm-widget-layout';
export const WIDGET_VIEW_KEY = 'crm-widget-view';
const CUSTOM_WIDGET_PRESET_KEY = 'crm-custom-widget-preset';

export const DEFAULT_WIDGETS = [
  'zoho-revenue-month',
  'zoho-lead-conversion',
  'zoho-business-health',
  'zoho-revenue-target',
  'zoho-invoice-donut',
  'zoho-revenue-area',
  'zoho-sales-funnel',
  'zoho-tasks-week',
  'zoho-overdue-invoices',
  'zoho-stock-anomaly',
  'zoho-delivery-performance',
];

export const WIDGET_PRESETS = {
  owner: {
    label: 'Owner View',
    keys: DEFAULT_WIDGETS,
  },
  manager: {
    label: 'Sales View',
    keys: [
      'zoho-revenue-month',
      'zoho-lead-conversion',
      'zoho-month-comparator',
      'top-customers',
      'zoho-sales-rankings',
      'zoho-lead-stage',
      'zoho-customer-cohort',
      'zoho-deal-quadrant',
      'zoho-revenue-area',
    ],
  },
};

type WidgetLayout = 'compact' | 'standard' | 'focus';
type WidgetPresetKey = keyof typeof WIDGET_PRESETS | 'custom';
type WidgetNarrative = {
  decision: string;
  action: string;
};

const WIDGET_NARRATIVES: Record<string, WidgetNarrative> = {
  'daily-snapshot': {
    decision: 'This is the owner’s morning operating readout: follow-ups, new leads, open quotes, deliveries, and low stock in one pass.',
    action: 'Use it to decide what needs attention before opening individual modules.',
  },
  'alert-center': {
    decision: 'This isolates unread operational alerts that can create missed revenue, customer friction, or inventory gaps.',
    action: 'Use it to clear urgent exceptions before normal daily work.',
  },
  'revenue-chart': {
    decision: 'This shows whether invoice revenue is building, flattening, or dropping across recent months.',
    action: 'Use it to spot demand changes and compare sales momentum against staffing and inventory decisions.',
  },
  'sales-by-category': {
    decision: 'This identifies which product or service categories are actually producing revenue.',
    action: 'Use it to prioritize buying, merchandising, promotions, and crew focus.',
  },
  'unpaid-invoices': {
    decision: 'This surfaces customer balances that are still open and closest to needing follow-up.',
    action: 'Use it to protect cash flow and decide who needs a payment conversation today.',
  },
  'balance-summary': {
    decision: 'This condenses invoice exposure into a cash-position readout.',
    action: 'Use it to understand how much money is waiting to be collected.',
  },
  'quote-pipeline': {
    decision: 'This shows where open quotes are sitting before they become orders or get lost.',
    action: 'Use it to push the right quote stage instead of treating all quotes the same.',
  },
  'follow-ups-today': {
    decision: 'This is the daily customer-contact queue.',
    action: 'Use it to make sure promised callbacks, quote checks, and open tasks do not slip.',
  },
  'new-leads': {
    decision: 'This shows fresh demand that has not yet been fully worked.',
    action: 'Use it to qualify new opportunities before they age out or get missed.',
  },
  'customer-requests': {
    decision: 'This separates active customer needs from general CRM activity.',
    action: 'Use it to identify requests that need a quote, order, service visit, or owner decision.',
  },
  'deliveries-today': {
    decision: 'This is the day’s delivery execution board.',
    action: 'Use it to confirm what must leave the nursery and where route risk exists.',
  },
  'service-jobs': {
    decision: 'This shows scheduled or active service work that needs crew attention.',
    action: 'Use it to coordinate installs, labor, materials, and customer expectations.',
  },
  'vendor-orders': {
    decision: 'This tracks open vendor commitments that affect availability and fulfillment.',
    action: 'Use it to follow up on incoming product before it blocks sales or service work.',
  },
  'recent-activity': {
    decision: 'This gives the latest CRM movement across customers and staff actions.',
    action: 'Use it to understand what changed recently without opening every record.',
  },
  'low-stock': {
    decision: 'This identifies items at or below reorder levels.',
    action: 'Use it to prevent missed sales caused by stockouts.',
  },
  'inventory-value': {
    decision: 'This estimates how much money is sitting in inventory.',
    action: 'Use it to balance stock investment against sales velocity and cash needs.',
  },
  'top-categories': {
    decision: 'This ranks inventory categories by value and quantity.',
    action: 'Use it to see where inventory dollars are concentrated.',
  },
  'top-customers': {
    decision: 'This shows which customers are driving the most revenue.',
    action: 'Use it to protect high-value accounts and prioritize relationship follow-up.',
  },
  'customer-stats': {
    decision: 'This summarizes the customer base by useful operating groups.',
    action: 'Use it to understand who the nursery is serving and where outreach should focus.',
  },
  'loyalty-overview': {
    decision: 'This shows loyalty-tier distribution across customers.',
    action: 'Use it to decide where retention, rewards, or upgrade conversations make sense.',
  },
  'service-revenue': {
    decision: 'This connects service work to revenue rather than treating jobs as only scheduling items.',
    action: 'Use it to judge whether service capacity is producing enough return.',
  },
  'zoho-revenue-month': {
    decision: 'This is the current-month revenue pulse from invoices.',
    action: 'Use it to know immediately whether the month is pacing ahead or behind the prior month.',
  },
  'zoho-lead-conversion': {
    decision: 'This shows how effectively leads are turning into accepted quote outcomes.',
    action: 'Use it to decide whether the issue is lead volume, quote quality, or follow-up execution.',
  },
  'zoho-business-health': {
    decision: 'This is the compact owner scorecard for quotes, service jobs, unpaid balance, and low stock.',
    action: 'Use it as the fastest answer to whether the business is stable or needs intervention.',
  },
  'zoho-sales-rankings': {
    decision: 'This ranks revenue by sales category.',
    action: 'Use it to decide which categories deserve more inventory, merchandising, or sales attention.',
  },
  'zoho-revenue-target': {
    decision: 'This compares current-month revenue against the monthly target.',
    action: 'Use it to see whether sales activity needs to increase before month end.',
  },
  'zoho-invoice-donut': {
    decision: 'This breaks invoice status into an at-a-glance collections picture.',
    action: 'Use it to see whether invoices are mostly paid, partial, unpaid, or overdue.',
  },
  'zoho-revenue-area': {
    decision: 'This shows recent revenue trend shape instead of a single static number.',
    action: 'Use it to detect momentum changes across months.',
  },
  'zoho-sales-funnel': {
    decision: 'This shows where quote opportunities are concentrated in the sales funnel.',
    action: 'Use it to focus follow-up on the stage most likely to unlock revenue.',
  },
  'zoho-customer-types': {
    decision: 'This shows the mix of homeowners, contractors, municipalities, and other account types.',
    action: 'Use it to align offers, pricing, and follow-up with the customer base.',
  },
  'zoho-tasks-week': {
    decision: 'This shows open tasks due this week.',
    action: 'Use it to keep time-sensitive follow-up and operational work from drifting.',
  },
  'zoho-leads-month': {
    decision: 'This shows leads created during the current month.',
    action: 'Use it to measure new demand and keep fresh opportunities moving.',
  },
  'zoho-overdue-invoices': {
    decision: 'This lists invoices that are already overdue.',
    action: 'Use it to trigger collections follow-up before cash flow gets weaker.',
  },
  'zoho-lead-stage': {
    decision: 'This shows lead volume by stage and exposes pipeline imbalance.',
    action: 'Use it to decide where leads need movement, qualification, or closure.',
  },
  'zoho-month-comparator': {
    decision: 'This compares this month against last month across revenue, leads, quotes, and paid invoices.',
    action: 'Use it to understand whether performance is improving or slipping by driver.',
  },
  'zoho-activity-expanded': {
    decision: 'This is the expanded activity ledger for recent CRM movement.',
    action: 'Use it to audit what has happened recently before making a customer or operations decision.',
  },
  'zoho-stock-anomaly': {
    decision: 'This highlights inventory levels furthest below expected stock.',
    action: 'Use it to act on unusual stock risk, not just standard reorder thresholds.',
  },
  'zoho-customer-cohort': {
    decision: 'This groups customer revenue by first invoice quarter.',
    action: 'Use it to understand whether newer customer groups are becoming valuable.',
  },
  'zoho-deal-quadrant': {
    decision: 'This compares deal size against lead age.',
    action: 'Use it to separate quick wins, urgent stale opportunities, and lower-priority deals.',
  },
  'zoho-service-target': {
    decision: 'This compares service jobs this month against a practical job target.',
    action: 'Use it to decide whether crew scheduling and service selling are on pace.',
  },
  'zoho-delivery-performance': {
    decision: 'This summarizes delivery execution for today and the current week.',
    action: 'Use it to keep fulfillment from becoming the bottleneck after sales are made.',
  },
};

function readActiveWidgetKeys() {
  try {
    const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
    return stored ? JSON.parse(stored) as string[] : DEFAULT_WIDGETS;
  } catch {
    return DEFAULT_WIDGETS;
  }
}

function getWidgetNarrative(widget: (typeof WIDGET_CATALOG)[number]): WidgetNarrative {
  return WIDGET_NARRATIVES[widget.key] ?? {
    decision: widget.tooltip,
    action: `Use ${widget.name} when ${widget.category.toLowerCase()} needs a quick operating decision.`,
  };
}

export function WidgetViewControls() {
  const [view, setView] = useState<WidgetPresetKey>('owner');
  const [hasCustom, setHasCustom] = useState(false);

  useEffect(() => {
    try {
      const storedView = localStorage.getItem(WIDGET_VIEW_KEY);
      if (storedView === 'owner' || storedView === 'manager' || storedView === 'custom') {
        setView(storedView);
      }
      setHasCustom(Boolean(localStorage.getItem(CUSTOM_WIDGET_PRESET_KEY)));
    } catch {}
  }, []);

  function applyView(nextView: WidgetPresetKey) {
    setView(nextView);
    try {
      const preset =
        nextView === 'custom'
          ? JSON.parse(localStorage.getItem(CUSTOM_WIDGET_PRESET_KEY) ?? 'null') as string[] | null
          : WIDGET_PRESETS[nextView].keys;

      localStorage.setItem(WIDGET_VIEW_KEY, nextView);
      if (preset?.length) {
        localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(preset));
        window.dispatchEvent(new Event('crm-widgets-changed'));
      }
    } catch {}
  }

  function saveCustomView() {
    const currentKeys = readActiveWidgetKeys();
    try {
      localStorage.setItem(CUSTOM_WIDGET_PRESET_KEY, JSON.stringify(currentKeys));
      localStorage.setItem(WIDGET_VIEW_KEY, 'custom');
      setHasCustom(true);
      setView('custom');
    } catch {}
  }

  function openWidgetList() {
    window.dispatchEvent(new Event('crm-open-customize'));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={openWidgetList}
        className="h-9 rounded-lg bg-nursery-terracotta px-4 text-xs font-bold text-nursery-ivory transition hover:bg-nursery-terracotta/85"
      >
        Widget List
      </button>
      <select
        value={view}
        onChange={(event) => applyView(event.target.value as WidgetPresetKey)}
        className="h-9 rounded-lg border border-nursery-sage/25 bg-white px-3 text-xs font-bold text-nursery-midnight outline-none transition hover:border-nursery-sage/50 focus:border-nursery-terracotta"
        title="Dashboard role view"
      >
        <option value="owner">Owner View</option>
        <option value="manager">Sales View</option>
        {hasCustom && <option value="custom">Custom View</option>}
      </select>
      <button
        type="button"
        onClick={saveCustomView}
        className="h-9 rounded-lg border border-nursery-sage/25 bg-white px-3 text-xs font-bold text-nursery-midnight/65 transition hover:border-nursery-terracotta hover:text-nursery-midnight"
      >
        Save Custom
      </button>
    </div>
  );
}

export default function CommandCenterWidgets({ data }: { data: DashData }) {
  const [activeKeys, setActiveKeys] = useState<string[]>(DEFAULT_WIDGETS);
  const [layout, setLayout] = useState<WidgetLayout>('standard');
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const dropKeyRef = useRef<string | null>(null);
  const activeKeysRef = useRef<string[]>(activeKeys);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const ghostNameRef = useRef<HTMLSpanElement | null>(null);
  activeKeysRef.current = activeKeys;

  useEffect(() => {
    function load() {
      try {
        setActiveKeys(readActiveWidgetKeys());
        const storedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY);
        if (storedLayout === 'compact' || storedLayout === 'standard' || storedLayout === 'focus') {
          setLayout(storedLayout);
        }
      } catch {}
    }
    load();
    window.addEventListener('crm-widgets-changed', load);
    return () => window.removeEventListener('crm-widgets-changed', load);
  }, []);

  useEffect(() => {
    if (!dragKey) return;

    function handleMove(e: PointerEvent) {
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX + 16}px`;
        ghostRef.current.style.top = `${e.clientY + 16}px`;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const widgetEl = el?.closest('[data-widget-key]');
      const hoverKey = widgetEl?.getAttribute('data-widget-key') ?? null;
      if (hoverKey && hoverKey !== dragKey) {
        dropKeyRef.current = hoverKey;
        setDropKey(hoverKey);
      }
    }

    function stopMove() {
      if (ghostRef.current) ghostRef.current.style.opacity = '0';
      const source = dragKey;
      const target = dropKeyRef.current;
      if (source && target && source !== target) {
        const next = [...activeKeysRef.current];
        const from = next.indexOf(source);
        const to = next.indexOf(target);
        if (from >= 0 && to >= 0) {
          next.splice(from, 1);
          next.splice(to, 0, source);
          setActiveKeys(next);
          try {
            localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new Event('crm-widgets-changed'));
          } catch {}
        }
      }
      setDragKey(null);
      setDropKey(null);
      dropKeyRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopMove);
    window.addEventListener('pointercancel', stopMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopMove);
      window.removeEventListener('pointercancel', stopMove);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragKey]);

  const activeWidgets = activeKeys
    .map((key) => WIDGET_CATALOG.find((w) => w.key === key))
    .filter((w): w is (typeof WIDGET_CATALOG)[number] => w !== undefined);

  const gridClass =
    layout === 'compact'
      ? 'xl:grid-cols-4'
      : layout === 'focus'
        ? 'xl:grid-cols-2'
        : 'xl:grid-cols-3';

  return (
    <>
      {/* Drag ghost — follows cursor, positioned via direct DOM writes to avoid re-renders */}
      <div
        ref={ghostRef}
        style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9999, opacity: 0, left: 0, top: 0, transition: 'opacity 0.1s' }}
        className="flex items-center gap-2 rounded-xl border-2 border-nursery-terracotta bg-nursery-midnight px-4 py-3 shadow-2xl"
      >
        <GripVertical className="h-4 w-4 shrink-0 text-nursery-terracotta" />
        <span ref={ghostNameRef} className="text-xs font-bold uppercase tracking-widest text-nursery-ivory" />
      </div>

      {activeWidgets.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-nursery-sage/30 bg-white p-12 text-center">
          <p className="text-base font-semibold text-nursery-midnight/60">No widgets enabled.</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('crm-open-customize'))}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-nursery-midnight px-4 text-xs font-bold text-nursery-ivory transition hover:bg-nursery-terracotta"
          >
            Open Widget List
          </button>
        </div>
      ) : (
        <div className={`mt-4 grid grid-cols-1 gap-4 ${gridClass}`}>
          {activeWidgets.map((widget) => {
          const { Widget, key, colSpan } = widget;
          const narrative = getWidgetNarrative(widget);
          const spanClass =
            layout === 'focus'
              ? colSpan === 1 ? 'xl:col-span-1' : 'xl:col-span-2'
              : colSpan === 3 ? (layout === 'compact' ? 'xl:col-span-4' : 'xl:col-span-3') : colSpan === 2 ? 'xl:col-span-2' : 'xl:col-span-1';
          return (
            <div
              key={key}
              data-widget-key={key}
              className={`relative rounded-xl transition-all duration-150 ${spanClass} ${dragKey === key ? 'opacity-40 scale-[0.98]' : ''} ${dropKey === key && dragKey !== key ? 'ring-2 ring-nursery-terracotta ring-offset-2 ring-offset-[#efe8db]' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-dashed border-nursery-sage/25 bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-nursery-midnight/45">
                <span className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      if (ghostNameRef.current) ghostNameRef.current.textContent = widget.name;
                      if (ghostRef.current) {
                        ghostRef.current.style.left = `${event.clientX + 16}px`;
                        ghostRef.current.style.top = `${event.clientY + 16}px`;
                        ghostRef.current.style.opacity = '1';
                      }
                      dropKeyRef.current = null;
                      setDropKey(null);
                      setDragKey(key);
                    }}
                    aria-label={`Move ${widget.name}`}
                    title={`Grab to move ${widget.name}`}
                    className="inline-flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md border border-nursery-sage/20 bg-white text-nursery-midnight/55 transition hover:border-nursery-terracotta hover:text-nursery-terracotta active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <span className="truncate">{widget.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 normal-case tracking-normal">
                  <span className="group/info relative">
                    <button
                      type="button"
                      aria-label={`${widget.name} information`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-nursery-sage/20 bg-white text-nursery-midnight/65 transition hover:border-nursery-terracotta hover:text-nursery-terracotta focus:border-nursery-terracotta focus:text-nursery-terracotta focus:outline-none"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                    <span className="pointer-events-none absolute right-0 top-9 z-30 hidden w-80 rounded-lg border border-nursery-sage/20 bg-nursery-midnight p-4 text-left text-nursery-ivory shadow-xl group-hover/info:block group-focus-within/info:block">
                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-nursery-sage">{widget.category}</span>
                      <span className="mt-1 block text-sm font-bold text-white">{widget.name}</span>
                      <span className="mt-3 block text-xs font-bold uppercase tracking-[0.12em] text-nursery-ivory/50">What this tells you</span>
                      <span className="mt-1 block text-sm leading-6 text-nursery-ivory/85">{narrative.decision}</span>
                      <span className="mt-3 block text-xs font-bold uppercase tracking-[0.12em] text-nursery-ivory/50">How to use it</span>
                      <span className="mt-1 block text-sm leading-6 text-nursery-ivory/85">{narrative.action}</span>
                    </span>
                  </span>
                </span>
              </div>
              <Widget data={data} />
            </div>
          );
          })}
        </div>
      )}
    </>
  );
}
