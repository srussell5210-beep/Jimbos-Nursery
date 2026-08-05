'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { WIDGET_CATALOG, type WidgetCategory } from '@/components/crm/WidgetRegistry';
import { WIDGET_LAYOUT_KEY, WIDGET_STORAGE_KEY, DEFAULT_WIDGETS } from '@/components/crm/CommandCenterWidgets';

const ALL_MODULES = [
  'Command Center',
  'Customers',
  'Leads',
  'Quotes',
  'Orders',
  'Invoices',
  'Inventory',
  'Deliveries',
  'Services',
  'Vendors',
];

export const STORAGE_KEY = 'crm-hidden-modules';

const WIDGET_CATEGORIES: WidgetCategory[] = [
  'Quick Stats',
  'Financial',
  'Sales Pipeline',
  'Operations',
  'Inventory',
  'Customers',
];

const WIDGET_CATEGORY_META: Record<WidgetCategory, { label: string; description: string }> = {
  'Quick Stats': {
    label: 'Quick Stats',
    description: 'Owner snapshot widgets for the fastest read on the business.',
  },
  Financial: {
    label: 'Financial',
    description: 'Revenue, invoices, goals, comparisons, and sales category views.',
  },
  'Sales Pipeline': {
    label: 'Sales Pipeline',
    description: 'Lead, quote, conversion, stage, and deal movement widgets.',
  },
  Operations: {
    label: 'Operations',
    description: 'Tasks, service work, deliveries, alerts, and activity feeds.',
  },
  Inventory: {
    label: 'Inventory',
    description: 'Stock health, reorder risk, value, and inventory exception widgets.',
  },
  Customers: {
    label: 'Customers',
    description: 'Customer type, loyalty, revenue cohort, and account ranking widgets.',
  },
};

export default function CrmCustomizeButton({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(DEFAULT_WIDGETS);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'widgets' | 'views'>('widgets');
  const [layout, setLayout] = useState<'compact' | 'standard' | 'focus'>('standard');
  const [mounted, setMounted] = useState(false);

  const isWidgetMode = active === 'Command Center';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function openCustomize() {
      if (isWidgetMode) {
        loadWidgets();
        setSearch('');
        setTab('widgets');
      } else {
        loadModules();
      }
      setOpen(true);
    }

    window.addEventListener('crm-open-customize', openCustomize);
    return () => window.removeEventListener('crm-open-customize', openCustomize);
  }, [isWidgetMode]);

  function loadModules() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setHidden(stored ? JSON.parse(stored) : []);
    } catch {}
  }

  function loadWidgets() {
    try {
      const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
      setActiveWidgets(stored ? JSON.parse(stored) : DEFAULT_WIDGETS);
      const storedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY);
      if (storedLayout === 'compact' || storedLayout === 'standard' || storedLayout === 'focus') {
        setLayout(storedLayout);
      }
    } catch {}
  }

  function toggleModule(label: string) {
    setHidden((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  function toggleWidget(key: string) {
    setActiveWidgets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function addWidgets(keys: string[]) {
    setActiveWidgets((prev) => Array.from(new Set([...prev, ...keys])));
  }

  function removeWidgets(keys: string[]) {
    setActiveWidgets((prev) => prev.filter((key) => !keys.includes(key)));
  }

  function apply() {
    try {
      if (isWidgetMode) {
        localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(activeWidgets));
        localStorage.setItem(WIDGET_LAYOUT_KEY, layout);
        window.dispatchEvent(new Event('crm-widgets-changed'));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden));
        window.dispatchEvent(new Event('crm-prefs-changed'));
      }
    } catch {}
    setOpen(false);
  }

  function cancel() {
    setOpen(false);
  }

  const filteredWidgets = WIDGET_CATALOG.filter((widget) =>
    `${widget.name} ${widget.category} ${widget.tooltip}`.toLowerCase().includes(search.toLowerCase()),
  );

  const customViews = [
    { label: 'Open Tasks Due This Week', module: 'Tasks', widgetKey: 'zoho-tasks-week', description: 'Title, customer, due date, and priority.' },
    { label: 'Leads Created This Month', module: 'Leads', widgetKey: 'zoho-leads-month', description: 'Title, customer, source, and stage.' },
    { label: 'Invoices Overdue', module: 'Invoices', widgetKey: 'zoho-overdue-invoices', description: 'Invoice, customer, age, and balance due.' },
    { label: 'Open Quotes Pipeline', module: 'Quotes', widgetKey: 'quote-pipeline', description: 'Stage, count, and active quote status.' },
  ];

  return (
    <>
      {open && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[200] bg-nursery-midnight/50 backdrop-blur-sm"
            onClick={cancel}
          />
          <div className="fixed inset-y-0 right-0 z-[210] flex w-[420px] max-w-[calc(100vw-20px)] flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-nursery-sage/20 px-6 py-5">
              <div>
                <h2 className="font-serif text-xl font-semibold text-nursery-midnight">
                  {isWidgetMode ? 'Dashboard Widgets' : 'Customize'}
                </h2>
                <p className="mt-0.5 text-sm text-nursery-midnight/55">
                  {isWidgetMode
                    ? 'Add or remove widgets from your command center'
                    : 'Show or hide navigation modules'}
                </p>
              </div>
              <button
                onClick={cancel}
                className="rounded-lg p-1.5 text-nursery-midnight/40 transition hover:bg-nursery-sage/10 hover:text-nursery-midnight"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isWidgetMode ? (
                <>
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f7f3ea] p-1">
                    {(['widgets', 'views'] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTab(item)}
                        className={`rounded-md px-3 py-2 text-sm font-bold capitalize transition ${tab === item ? 'bg-white text-nursery-midnight shadow-sm' : 'text-nursery-midnight/55 hover:text-nursery-midnight'}`}
                      >
                        {item === 'views' ? 'Custom Views' : 'Widgets'}
                      </button>
                    ))}
                  </div>

                  {tab === 'widgets' ? (
                    <>
                      <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-nursery-sage/20 bg-white px-3">
                        <Search className="h-4 w-4 text-nursery-midnight/40" />
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search widgets"
                          className="min-w-0 flex-1 bg-transparent text-sm text-nursery-midnight outline-none placeholder:text-nursery-midnight/40"
                        />
                      </label>

                      <div className="mt-4 rounded-lg border border-nursery-sage/15 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Layout</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {(['compact', 'standard', 'focus'] as const).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setLayout(item)}
                              className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${layout === item ? 'bg-nursery-midnight text-nursery-ivory' : 'bg-[#f7f3ea] text-nursery-midnight/65 hover:text-nursery-midnight'}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-nursery-sage/15 bg-[#f7f3ea] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">Categories</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {WIDGET_CATEGORIES.map((category) => {
                            const total = filteredWidgets.filter((widget) => widget.category === category).length;
                            const enabled = filteredWidgets.filter((widget) => widget.category === category && activeWidgets.includes(widget.key)).length;
                            return (
                              <a
                                key={category}
                                href={`#widget-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                className="rounded-lg border border-nursery-sage/15 bg-white px-3 py-2 text-left transition hover:border-nursery-terracotta/40"
                              >
                                <span className="block text-xs font-bold text-nursery-midnight">{WIDGET_CATEGORY_META[category].label}</span>
                                <span className="mt-0.5 block text-[11px] font-semibold text-nursery-midnight/45">{enabled}/{total} on</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {WIDGET_CATEGORIES.map((category) => {
                          const categoryWidgets = filteredWidgets.filter((widget) => widget.category === category);
                          if (categoryWidgets.length === 0) return null;
                          const enabledCount = categoryWidgets.filter((widget) => activeWidgets.includes(widget.key)).length;
                          const keys = categoryWidgets.map((widget) => widget.key);
                          return (
                            <section
                              key={category}
                              id={`widget-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              className="scroll-mt-4 rounded-xl border border-nursery-sage/15 bg-white"
                            >
                              <div className="flex items-start justify-between gap-3 rounded-t-xl border-b border-nursery-sage/15 bg-[#f7f3ea] px-4 py-3">
                                <div>
                                  <h3 className="text-sm font-bold text-nursery-midnight">{WIDGET_CATEGORY_META[category].label}</h3>
                                  <p className="mt-1 text-xs leading-5 text-nursery-midnight/50">{WIDGET_CATEGORY_META[category].description}</p>
                                  <p className="mt-1 text-xs font-semibold text-nursery-midnight/45">{enabledCount} of {categoryWidgets.length} enabled</p>
                                </div>
                                <div className="flex shrink-0 gap-2 pt-0.5">
                                  <button type="button" onClick={() => addWidgets(keys)} className="text-xs font-bold text-nursery-terracotta">Add All</button>
                                  <button type="button" onClick={() => removeWidgets(keys)} className="text-xs font-bold text-nursery-midnight/45">Remove</button>
                                </div>
                              </div>
                              <div className="space-y-2 p-3">
                                {categoryWidgets.map((w) => {
                                  const isActive = activeWidgets.includes(w.key);
                                  return (
                                    <div key={w.key} className="group flex items-start gap-4 rounded-lg border border-nursery-sage/15 p-3 transition hover:border-nursery-sage/30 hover:bg-nursery-sage/5">
                                      <button type="button" aria-pressed={isActive} onClick={() => toggleWidget(w.key)} className="mt-1 shrink-0">
                                        <span className={`relative flex h-5 w-9 rounded-full transition-colors ${isActive ? 'bg-nursery-sage' : 'bg-nursery-midnight/20'}`}>
                                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </span>
                                      </button>
                                      <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-nursery-midnight' : 'text-nursery-midnight/35 line-through'}`}>{w.name}</p>
                                        <p className="mt-1.5 hidden text-xs leading-[1.55] text-nursery-midnight/55 group-hover:block">{w.tooltip}</p>
                                      </div>
                                      <div className="pointer-events-none shrink-0"><w.MiniPreview /></div>
                                    </div>
                                  );
                                })}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {customViews.map((view) => {
                        const activeView = activeWidgets.includes(view.widgetKey);
                        return (
                          <button
                            key={view.widgetKey}
                            type="button"
                            onClick={() => activeView ? removeWidgets([view.widgetKey]) : addWidgets([view.widgetKey])}
                            className="w-full rounded-lg border border-nursery-sage/15 p-4 text-left transition hover:border-nursery-sage/30 hover:bg-nursery-sage/5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-terracotta">{view.module}</p>
                                <p className="mt-1 font-semibold text-nursery-midnight">{view.label}</p>
                                <p className="mt-1 text-xs leading-5 text-nursery-midnight/55">{view.description}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeView ? 'bg-nursery-sage/15 text-nursery-midnight' : 'bg-[#f7f3ea] text-nursery-midnight/45'}`}>
                                {activeView ? 'Added' : 'Add'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-nursery-midnight/50">
                    Navigation Modules
                  </p>
                  <p className="mt-1 text-xs text-nursery-midnight/40">
                    Hidden modules disappear from the sidebar and mobile nav.
                  </p>
                  <div className="mt-5 space-y-2">
                    {ALL_MODULES.map((label) => {
                      const isVisible = !hidden.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleModule(label)}
                          className="flex w-full items-center justify-between rounded-lg border border-nursery-sage/20 px-4 py-3 text-sm font-semibold text-nursery-midnight transition hover:bg-nursery-sage/5"
                        >
                          <span className={isVisible ? '' : 'text-nursery-midnight/40 line-through'}>
                            {label}
                          </span>
                          <span
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                              isVisible ? 'bg-nursery-sage' : 'bg-nursery-midnight/20'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                isVisible ? 'translate-x-4' : 'translate-x-0.5'
                              }`}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 gap-3 border-t border-nursery-sage/15 px-6 py-4">
              <button
                onClick={cancel}
                className="flex-1 rounded-lg border border-nursery-sage/25 py-2.5 text-sm font-semibold text-nursery-midnight/60 transition hover:border-nursery-sage/50 hover:text-nursery-midnight"
              >
                Cancel
              </button>
              <button
                onClick={apply}
                className="flex-1 rounded-lg bg-nursery-midnight py-2.5 text-sm font-bold text-nursery-ivory transition hover:bg-nursery-terracotta"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      , document.body)}
    </>
  );
}
