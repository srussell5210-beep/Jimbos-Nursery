'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ExternalLink, Link2, Pencil, Plus, RefreshCw, Trash2, Unplug, Upload, Users, X } from 'lucide-react';
import { parseEventPrice } from '@/lib/event-price';
import { formatEventDuration, formatEventTimeRange } from '@/lib/event-time';

const EVENT_CATEGORIES = ['Community Event', 'Kids', 'Wellness', 'Workshop'];

interface FormTimeSlot { id: string; label: string; capacity: string }
interface FormAddOn { id: string; name: string; capacity: string; price: string }

const EMPTY_EVENT = {
  title: "", date: "", startTime: "", endTime: "", location: "", description: "", price: "", type: "",
  image: "/images/hero_placeholder.jpg", images: [] as string[], capacity: "",
  timeSlots: [] as FormTimeSlot[], addOns: [] as FormAddOn[],
};

function formatEventDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseEventDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface CloverStatus {
  appConfigured: boolean;
  missing: string[];
  redirectUri: string;
  merchantConfigured: boolean;
  connected: boolean;
  checkoutReady: boolean;
  environment: string;
  merchantId: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

interface EcwidStatus {
  configured: boolean;
  missing: string[];
  storeId: string;
  webhookUrl: string;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloverStatus, setCloverStatus] = useState<CloverStatus | null>(null);
  const [cloverLoading, setCloverLoading] = useState(true);
  const [cloverBusy, setCloverBusy] = useState(false);
  const [ecwidStatus, setEcwidStatus] = useState<EcwidStatus | null>(null);
  const [ecwidLoading, setEcwidLoading] = useState(true);
  const [ecwidModalOpen, setEcwidModalOpen] = useState(false);
  const [ecwidSyncingId, setEcwidSyncingId] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({ ...EMPTY_EVENT });
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [eventDateInput, setEventDateInput] = useState("");
  const [reservationCounts, setReservationCounts] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [cloverModalOpen, setCloverModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCloverStatus();
    fetchEcwidStatus();
    fetchReservationCounts();
  }, []);

  const fetchData = async () => {
    try {
      const evRes = await fetch('/api/events');
      setEvents(await evRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationCounts = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservationCounts(data.counts ?? {});
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCloverStatus = async () => {
    setCloverLoading(true);
    try {
      const res = await fetch('/api/admin/clover/status', { cache: 'no-store' });
      if (res.ok) setCloverStatus(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setCloverLoading(false);
    }
  };

  const disconnectClover = async () => {
    if (!confirm('Disconnect Clover from this site? Gift card checkout will stop accepting payments.')) return;
    setCloverBusy(true);
    try {
      await fetch('/api/admin/clover/status', { method: 'DELETE' });
      await fetchCloverStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setCloverBusy(false);
    }
  };

  const fetchEcwidStatus = async () => {
    setEcwidLoading(true);
    try {
      const res = await fetch('/api/admin/ecwid/status', { cache: 'no-store' });
      if (res.ok) setEcwidStatus(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setEcwidLoading(false);
    }
  };

  const syncEventToEcwid = async (id: string) => {
    setEcwidSyncingId(id);
    try {
      const res = await fetch('/api/admin/ecwid/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) await fetchData();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Could not sync this event to Ecwid.');
      }
    } catch (e) {
      console.error(e);
      alert('Could not sync this event to Ecwid.');
    } finally {
      setEcwidSyncingId(null);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return 'Not provided';
    return new Date(value).toLocaleString();
  };

  const resetForm = () => {
    setNewEvent({ ...EMPTY_EVENT });
    setEventDateInput("");
    setImageError("");
    setEditingId(null);
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newEvent,
      capacity: newEvent.capacity.trim() ? parseInt(newEvent.capacity, 10) : null,
      timeSlots: newEvent.timeSlots
        .filter(s => s.label.trim())
        .map(s => ({ id: s.id, label: s.label.trim(), capacity: s.capacity.trim() ? parseInt(s.capacity, 10) : null })),
      addOns: newEvent.addOns
        .filter(a => a.name.trim())
        .map(a => ({
          id: a.id,
          name: a.name.trim(),
          capacity: a.capacity.trim() ? parseInt(a.capacity, 10) : null,
          price: a.price.trim() ? parseFloat(a.price) : null,
        })),
    };
    try {
      const res = await fetch('/api/events', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload)
      });
      if (res.ok) {
        resetForm();
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditEvent = (ev: any) => {
    setEditingId(ev.id);
    setNewEvent({
      title: ev.title ?? "",
      date: ev.date ?? "",
      location: ev.location ?? "",
      description: ev.description ?? "",
      price: ev.price ?? "",
      type: ev.type ?? "",
      startTime: ev.startTime ?? "",
      endTime: ev.endTime ?? "",
      image: ev.image ?? "/images/hero_placeholder.jpg",
      images: ev.images ?? [],
      capacity: ev.capacity ? String(ev.capacity) : "",
      timeSlots: (ev.timeSlots ?? []).map((s: any) => ({ id: s.id, label: s.label ?? "", capacity: s.capacity ? String(s.capacity) : "" })),
      addOns: (ev.addOns ?? []).map((a: any) => ({ id: a.id, name: a.name ?? "", capacity: a.capacity ? String(a.capacity) : "", price: a.price ? String(a.price) : "" })),
    });
    setEventDateInput(parseEventDateToISO(ev.date ?? ""));
    setImageError("");
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addTimeSlot = () => {
    setNewEvent(prev => ({ ...prev, timeSlots: [...prev.timeSlots, { id: crypto.randomUUID(), label: "", capacity: "" }] }));
  };

  const updateTimeSlot = (id: string, field: 'label' | 'capacity', value: string) => {
    setNewEvent(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const removeTimeSlot = (id: string) => {
    setNewEvent(prev => ({ ...prev, timeSlots: prev.timeSlots.filter(s => s.id !== id) }));
  };

  const addAddOn = () => {
    setNewEvent(prev => ({ ...prev, addOns: [...prev.addOns, { id: crypto.randomUUID(), name: "", capacity: "", price: "" }] }));
  };

  const updateAddOn = (id: string, field: 'name' | 'capacity' | 'price', value: string) => {
    setNewEvent(prev => ({
      ...prev,
      addOns: prev.addOns.map(a => a.id === id ? { ...a, [field]: value } : a),
    }));
  };

  const removeAddOn = (id: string) => {
    setNewEvent(prev => ({ ...prev, addOns: prev.addOns.filter(a => a.id !== id) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setImageUploading(true);
    setImageError("");
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          setImageError(data.error || `Failed to upload ${file.name}.`);
          continue;
        }
        uploadedUrls.push(data.url);
      }
      if (uploadedUrls.length > 0) {
        setNewEvent(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          image: prev.images.length === 0 ? uploadedUrls[0] : prev.image,
        }));
      }
    } catch (err) {
      console.error(err);
      setImageError('Upload failed.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleSelectDefaultImage = (url: string) => {
    setNewEvent(prev => ({ ...prev, image: url }));
  };

  const handleRemoveImage = (url: string) => {
    setNewEvent(prev => {
      const images = prev.images.filter(img => img !== url);
      const image = prev.image === url ? (images[0] ?? "/images/hero_placeholder.jpg") : prev.image;
      return { ...prev, images, image };
    });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-nursery-ivory">
      {/* Minimal Navigation */}
      <nav className="h-24 border-b border-nursery-sage/20 bg-nursery-ivory/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
         <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-6">
            <Image src="/images/jimbo_logo.png" alt="Jimbo's Nursery" width={80} height={80} className="object-contain" />
            <span className="text-nursery-terracotta text-sm font-bold tracking-widest uppercase">Admin Portal</span>
         </Link>
         <div className="flex items-center gap-4 text-sm font-medium">
            <span className="bg-nursery-sage/20 text-nursery-midnight px-4 py-2 rounded-full">Connected to Local Database</span>
            <button
               type="button"
               onClick={() => setCloverModalOpen(true)}
               className="inline-flex items-center gap-2 rounded-full border border-nursery-sage/25 px-4 py-2 text-nursery-midnight hover:border-nursery-terracotta transition-colors"
            >
               <Link2 className="h-4 w-4 text-nursery-terracotta" />
               Clover
               {cloverStatus && (
                  <span
                     className={`h-2 w-2 rounded-full ${cloverStatus.connected ? 'bg-nursery-sage' : 'bg-nursery-terracotta'}`}
                     aria-label={cloverStatus.connected ? 'Connected' : 'Not connected'}
                  />
               )}
            </button>
            <button
               type="button"
               onClick={() => setEcwidModalOpen(true)}
               className="inline-flex items-center gap-2 rounded-full border border-nursery-sage/25 px-4 py-2 text-nursery-midnight hover:border-nursery-terracotta transition-colors"
            >
               <Link2 className="h-4 w-4 text-nursery-terracotta" />
               Ecwid
               {ecwidStatus && (
                  <span
                     className={`h-2 w-2 rounded-full ${ecwidStatus.configured ? 'bg-nursery-sage' : 'bg-nursery-terracotta'}`}
                     aria-label={ecwidStatus.configured ? 'Configured' : 'Not configured'}
                  />
               )}
            </button>
         </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 flex gap-12 flex-col lg:flex-row">
        {/* Left Col: Event List */}
        <div className="flex-1">
           <h2 className="text-2xl font-serif pb-2 border-b-2 border-nursery-terracotta text-nursery-midnight mb-8">
             Manage Events
           </h2>

           {loading ? (
             <p>Loading records...</p>
           ) : (
             <div className="space-y-4">
               {events.map((ev: any) => (
                 <div key={ev.id} className={`bg-white p-6 rounded-xl border shadow-sm flex justify-between items-center group transition-colors ${
                    ev.id === editingId ? 'border-nursery-terracotta' : 'border-nursery-sage/20 hover:border-nursery-terracotta'
                 }`}>
                    <div>
                       <span className="text-xs uppercase tracking-widest text-nursery-terracotta font-bold block mb-1">{ev.date} • {ev.type}</span>
                       <h4 className="text-xl font-serif text-nursery-midnight mb-1">{ev.title}</h4>
                       <span className="text-sm text-nursery-midnight/50">{ev.location}</span>
                       <span className="text-sm text-nursery-midnight/50 block">
                          {formatEventTimeRange(ev.startTime, ev.endTime)}
                          {ev.startTime && ev.endTime ? ` (${formatEventDuration(ev.startTime, ev.endTime)})` : ''}
                       </span>
                       <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-nursery-sage/10 px-3 py-1 text-xs font-semibold text-nursery-midnight/70">
                             <Users className="w-3.5 h-3.5" />
                             {reservationCounts[ev.id] ?? 0}{ev.capacity ? ` / ${ev.capacity}` : ''} reserved
                          </div>
                          {parseEventPrice(ev.price) !== null && (
                             ev.ecwidProductId ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-nursery-sage/10 px-3 py-1 text-xs font-semibold text-nursery-midnight/70">
                                   <CheckCircle2 className="w-3.5 h-3.5 text-nursery-sage" />
                                   Synced to Ecwid
                                </span>
                             ) : (
                                <button
                                   type="button"
                                   onClick={() => syncEventToEcwid(ev.id)}
                                   disabled={ecwidSyncingId === ev.id}
                                   className="inline-flex items-center gap-1.5 rounded-full bg-nursery-terracotta/10 px-3 py-1 text-xs font-semibold text-nursery-terracotta hover:bg-nursery-terracotta/20 transition-colors disabled:opacity-50"
                                >
                                   <RefreshCw className={`w-3.5 h-3.5 ${ecwidSyncingId === ev.id ? 'animate-spin' : ''}`} />
                                   {ecwidSyncingId === ev.id ? 'Syncing…' : 'Not synced — Sync to Ecwid'}
                                </button>
                             )
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => handleEditEvent(ev)} aria-label="Edit event" className="w-10 h-10 rounded-full hover:bg-nursery-sage/10 flex items-center justify-center text-nursery-midnight/60">
                          <Pencil className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeleteEvent(ev.id)} aria-label="Delete event" className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Right Col: Add Event Form */}
        <div className="w-full lg:w-96">
           <div ref={formRef} className="bg-white p-8 rounded-2xl border border-nursery-sage/20 shadow-xl sticky top-28">
              <h3 className="text-xl font-serif text-nursery-midnight mb-6 flex items-center gap-2">
                 {editingId ? <Pencil className="w-5 h-5 text-nursery-terracotta" /> : <Plus className="w-5 h-5 text-nursery-terracotta" />}
                 {editingId ? 'Edit Event' : 'Add New Event'}
              </h3>
              <form onSubmit={handleSubmitEvent} className="space-y-4 text-sm">
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Event Title</label>
                    <input required type="text" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                           value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Date</label>
                    <input required type="date" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                           value={eventDateInput} onChange={e => {
                              setEventDateInput(e.target.value);
                              setNewEvent({...newEvent, date: formatEventDate(e.target.value)});
                           }} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Start Time</label>
                       <input required type="time" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                              value={newEvent.startTime} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">End Time</label>
                       <input required type="time" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                              value={newEvent.endTime} onChange={e => setNewEvent({...newEvent, endTime: e.target.value})} />
                    </div>
                 </div>
                 {newEvent.startTime && newEvent.endTime && (
                    <p className="text-[11px] text-nursery-midnight/45 -mt-2">
                       Total time: {formatEventDuration(newEvent.startTime, newEvent.endTime)}
                    </p>
                 )}
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Location</label>
                    <input required type="text" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                           value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Description</label>
                    <textarea required className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta h-24"
                              value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Event Images</label>
                    <label className={`flex items-center justify-center gap-2 border border-dashed rounded-lg py-3 text-xs font-semibold cursor-pointer transition-colors ${
                       imageUploading
                         ? 'border-nursery-sage/30 text-nursery-midnight/40 cursor-not-allowed'
                         : 'border-nursery-sage/40 text-nursery-midnight/60 hover:border-nursery-terracotta hover:text-nursery-terracotta'
                    }`}>
                       <Upload className="w-4 h-4" />
                       {imageUploading ? 'Uploading…' : 'Upload Images'}
                       <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={imageUploading}
                          onChange={handleImageUpload}
                       />
                    </label>
                    {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}

                    {newEvent.images.length > 0 ? (
                       <>
                          <p className="mt-3 text-[11px] text-nursery-midnight/45">Click an image to set it as the default.</p>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                             {newEvent.images.map((url) => {
                                const isDefault = url === newEvent.image;
                                return (
                                   <div key={url} className="group/thumb relative">
                                      <button
                                         type="button"
                                         onClick={() => handleSelectDefaultImage(url)}
                                         className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 transition-colors ${
                                            isDefault ? 'border-nursery-terracotta' : 'border-nursery-sage/30 hover:border-nursery-terracotta/50'
                                         }`}
                                      >
                                         <Image src={url} alt="Event image option" fill className="object-cover" unoptimized />
                                      </button>
                                      {isDefault && (
                                         <span className="pointer-events-none absolute left-1 top-1 rounded bg-nursery-terracotta px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-nursery-ivory">
                                            Default
                                         </span>
                                      )}
                                      <button
                                         type="button"
                                         onClick={() => handleRemoveImage(url)}
                                         aria-label="Remove image"
                                         className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-nursery-midnight/70 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100"
                                      >
                                         <X className="h-3 w-3" />
                                      </button>
                                   </div>
                                );
                             })}
                          </div>
                       </>
                    ) : (
                       <div className="relative mt-3 h-16 w-16 overflow-hidden rounded-lg border border-nursery-sage/30 bg-nursery-ivory/30">
                          <Image src={newEvent.image} alt="Default placeholder preview" fill className="object-cover" unoptimized />
                       </div>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Price</label>
                       <input required type="text" placeholder="e.g. Free or $45" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                              value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">Category Type</label>
                       <select required className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                               value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                          <option value="" disabled>Select a category</option>
                          {EVENT_CATEGORIES.map(cat => (
                             <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">
                       Maximum Reservations <span className="normal-case text-nursery-midnight/30">(optional)</span>
                    </label>
                    <input type="number" min={1} placeholder="Unlimited" className="w-full border border-nursery-sage/30 rounded-lg p-3 bg-nursery-ivory/30 focus:outline-none focus:border-nursery-terracotta"
                           value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: e.target.value})} />
                 </div>

                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">
                       Time Slots <span className="normal-case text-nursery-midnight/30">(optional)</span>
                    </label>
                    <p className="text-[11px] text-nursery-midnight/40 mb-2">Let guests pick a specific time. Each slot can have its own ticket limit.</p>
                    <div className="space-y-2">
                       {newEvent.timeSlots.map(slot => (
                          <div key={slot.id} className="flex gap-2 items-center">
                             <input type="text" placeholder="e.g. 10:00 AM - 12:00 PM"
                                    className="flex-1 min-w-0 border border-nursery-sage/30 rounded-lg p-2.5 bg-nursery-ivory/30 text-sm focus:outline-none focus:border-nursery-terracotta"
                                    value={slot.label} onChange={e => updateTimeSlot(slot.id, 'label', e.target.value)} />
                             <input type="number" min={1} placeholder="Qty"
                                    className="w-20 border border-nursery-sage/30 rounded-lg p-2.5 bg-nursery-ivory/30 text-sm focus:outline-none focus:border-nursery-terracotta"
                                    value={slot.capacity} onChange={e => updateTimeSlot(slot.id, 'capacity', e.target.value)} />
                             <button type="button" onClick={() => removeTimeSlot(slot.id)} aria-label="Remove time slot"
                                     className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-nursery-midnight/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                    <button type="button" onClick={addTimeSlot}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-nursery-terracotta hover:text-nursery-midnight transition-colors">
                       <Plus className="w-3.5 h-3.5" /> Add Time Slot
                    </button>
                 </div>

                 <div>
                    <label className="block text-xs uppercase tracking-widest text-nursery-midnight/60 mb-1">
                       Add-Ons <span className="normal-case text-nursery-midnight/30">(optional)</span>
                    </label>
                    <p className="text-[11px] text-nursery-midnight/40 mb-2">Extras guests can add, like additional bingo cards. Each can have its own quantity limit and price — priced add-ons are charged through Ecwid checkout alongside the ticket.</p>
                    <div className="space-y-2">
                       {newEvent.addOns.map(addOn => (
                          <div key={addOn.id} className="flex gap-2 items-center">
                             <input type="text" placeholder="e.g. Extra Bingo Card"
                                    className="flex-1 min-w-0 border border-nursery-sage/30 rounded-lg p-2.5 bg-nursery-ivory/30 text-sm focus:outline-none focus:border-nursery-terracotta"
                                    value={addOn.name} onChange={e => updateAddOn(addOn.id, 'name', e.target.value)} />
                             <input type="number" min={1} placeholder="Qty"
                                    className="w-16 border border-nursery-sage/30 rounded-lg p-2.5 bg-nursery-ivory/30 text-sm focus:outline-none focus:border-nursery-terracotta"
                                    value={addOn.capacity} onChange={e => updateAddOn(addOn.id, 'capacity', e.target.value)} />
                             <input type="number" min={0} step="0.01" placeholder="Price"
                                    className="w-20 border border-nursery-sage/30 rounded-lg p-2.5 bg-nursery-ivory/30 text-sm focus:outline-none focus:border-nursery-terracotta"
                                    value={addOn.price} onChange={e => updateAddOn(addOn.id, 'price', e.target.value)} />
                             <button type="button" onClick={() => removeAddOn(addOn.id)} aria-label="Remove add-on"
                                     className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-nursery-midnight/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                    <button type="button" onClick={addAddOn}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-nursery-terracotta hover:text-nursery-midnight transition-colors">
                       <Plus className="w-3.5 h-3.5" /> Add Add-On
                    </button>
                 </div>

                 <div className="flex gap-3 mt-4">
                    {editingId && (
                       <button type="button" onClick={resetForm} className="flex-1 bg-nursery-ivory border border-nursery-sage/30 text-nursery-midnight font-bold py-4 rounded-xl hover:bg-nursery-sage/10 transition-colors">
                          Cancel
                       </button>
                    )}
                    <button type="submit" className="flex-1 bg-nursery-midnight text-nursery-ivory font-bold py-4 rounded-xl hover:bg-nursery-terracotta transition-colors">
                       {editingId ? 'Save Changes' : 'Publish Event'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </main>

      {cloverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <button type="button" aria-label="Close" onClick={() => setCloverModalOpen(false)} className="absolute inset-0 bg-nursery-midnight/60 backdrop-blur-sm" />
           <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: 'min(90vh, 700px)' }}>
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-nursery-sage/20 px-8 py-5">
                <div>
                  <h3 className="text-xl font-serif text-nursery-midnight flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-nursery-terracotta" /> Clover
                  </h3>
                  <p className="mt-1 text-sm text-nursery-midnight/55">Owner payment connection</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchCloverStatus}
                    className="rounded-full border border-nursery-sage/25 p-2 text-nursery-midnight/55 hover:text-nursery-midnight"
                    aria-label="Refresh Clover status"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCloverModalOpen(false)}
                    className="rounded-lg p-1.5 text-nursery-midnight/40 transition hover:bg-nursery-sage/10 hover:text-nursery-midnight"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {cloverLoading ? (
                  <p className="text-sm text-nursery-midnight/55">Checking Clover connection...</p>
                ) : cloverStatus ? (
                  <div className="space-y-5">
                    <div className={`rounded-xl border px-4 py-3 text-sm ${
                      cloverStatus.connected
                        ? 'border-nursery-sage/30 bg-nursery-sage/10 text-nursery-midnight'
                        : 'border-nursery-terracotta/25 bg-nursery-terracotta/10 text-nursery-midnight'
                    }`}>
                      <p className="font-bold">
                        {cloverStatus.connected ? 'Clover connected' : 'Clover not connected'}
                      </p>
                      <p className="mt-1 text-nursery-midnight/60">
                        {cloverStatus.checkoutReady
                          ? 'Gift card checkout can load Clover payment fields.'
                          : 'Gift card checkout is unavailable until Clover is connected.'}
                      </p>
                    </div>

                    {!cloverStatus.appConfigured && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <p className="font-bold">Netlify app credentials needed</p>
                        <p className="mt-1">
                          Add {cloverStatus.missing.join(' and ')} to Netlify production environment variables.
                        </p>
                      </div>
                    )}

                    {cloverStatus.appConfigured && !cloverStatus.merchantConfigured && !cloverStatus.connected && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <p className="font-bold">Clover merchant ID needed</p>
                        <p className="mt-1">
                          Add CLOVER_MERCHANT_ID in Netlify so Clover opens directly for Jimbo&apos;s Nursery instead of stopping at merchant selection.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-nursery-midnight/50 mb-2">
                        Clover Redirect URI
                      </label>
                      <input
                        readOnly
                        value={cloverStatus.redirectUri}
                        className="w-full rounded-lg border border-nursery-sage/25 bg-nursery-ivory/50 px-3 py-2 text-xs text-nursery-midnight/65"
                      />
                    </div>

                    {cloverStatus.connected && (
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-nursery-midnight/50">Environment</dt>
                          <dd className="font-semibold capitalize">{cloverStatus.environment}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-nursery-midnight/50">Merchant ID</dt>
                          <dd className="font-mono text-xs">{cloverStatus.merchantId}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-nursery-midnight/50">Connected</dt>
                          <dd className="text-right">{formatDate(cloverStatus.connectedAt)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-nursery-midnight/50">Token expires</dt>
                          <dd className="text-right">{formatDate(cloverStatus.accessTokenExpiresAt)}</dd>
                        </div>
                      </dl>
                    )}

                    <div className="flex flex-col gap-3">
                      {cloverStatus.appConfigured ? (
                        <a
                          href="/api/admin/clover/connect"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-nursery-midnight px-4 text-sm font-bold text-nursery-ivory hover:bg-nursery-terracotta"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {cloverStatus.connected ? 'Reconnect Clover' : 'Connect Clover'}
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-nursery-midnight/35 px-4 text-sm font-bold text-nursery-ivory cursor-not-allowed"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Connect Clover
                        </button>
                      )}
                      {cloverStatus.connected && (
                        <button
                          type="button"
                          disabled={cloverBusy}
                          onClick={disconnectClover}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Unplug className="h-4 w-4" />
                          Disconnect Clover
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">Could not load Clover status.</p>
                )}
              </div>
           </div>
        </div>
      )}

      {ecwidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <button type="button" aria-label="Close" onClick={() => setEcwidModalOpen(false)} className="absolute inset-0 bg-nursery-midnight/60 backdrop-blur-sm" />
           <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: 'min(90vh, 700px)' }}>
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-nursery-sage/20 px-8 py-5">
                <div>
                  <h3 className="text-xl font-serif text-nursery-midnight flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-nursery-terracotta" /> Ecwid
                  </h3>
                  <p className="mt-1 text-sm text-nursery-midnight/55">Event checkout &amp; payment connection</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchEcwidStatus}
                    className="rounded-full border border-nursery-sage/25 p-2 text-nursery-midnight/55 hover:text-nursery-midnight"
                    aria-label="Refresh Ecwid status"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEcwidModalOpen(false)}
                    className="rounded-lg p-1.5 text-nursery-midnight/40 transition hover:bg-nursery-sage/10 hover:text-nursery-midnight"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {ecwidLoading ? (
                  <p className="text-sm text-nursery-midnight/55">Checking Ecwid connection...</p>
                ) : ecwidStatus ? (
                  <div className="space-y-5">
                    <div className={`rounded-xl border px-4 py-3 text-sm ${
                      ecwidStatus.configured
                        ? 'border-nursery-sage/30 bg-nursery-sage/10 text-nursery-midnight'
                        : 'border-nursery-terracotta/25 bg-nursery-terracotta/10 text-nursery-midnight'
                    }`}>
                      <p className="font-bold">
                        {ecwidStatus.configured ? 'Ecwid configured' : 'Ecwid not configured'}
                      </p>
                      <p className="mt-1 text-nursery-midnight/60">
                        {ecwidStatus.configured
                          ? 'Priced events sync to Ecwid products and can be paid for through Ecwid checkout (Stripe/PayPal).'
                          : 'Priced events will save, but won’t sync to Ecwid until this is configured. See ECWID_SETUP.md.'}
                      </p>
                    </div>

                    {ecwidStatus.missing.length > 0 && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <p className="font-bold">Environment variables needed</p>
                        <p className="mt-1">
                          Add {ecwidStatus.missing.join(' and ')} — see ECWID_SETUP.md for where to find them.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-nursery-midnight/50 mb-2">
                        Ecwid Store ID
                      </label>
                      <input
                        readOnly
                        value={ecwidStatus.storeId}
                        className="w-full rounded-lg border border-nursery-sage/25 bg-nursery-ivory/50 px-3 py-2 text-xs text-nursery-midnight/65"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-nursery-midnight/50 mb-2">
                        Webhook URL — register this in Ecwid with the order.created / order.updated events
                      </label>
                      <input
                        readOnly
                        value={ecwidStatus.webhookUrl}
                        className="w-full rounded-lg border border-nursery-sage/25 bg-nursery-ivory/50 px-3 py-2 text-xs text-nursery-midnight/65"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">Could not load Ecwid status.</p>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
