"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EMPTY_FORM = {
  title: "",
  category: "",
  mediaType: "video",
  cloudinaryUrl: "",
  thumbnailUrl: "",
  duration: "",
};

const tabs = [
  { id: "portfolio", label: "Portfolio Content", detail: "Manage videos and images" },
  { id: "inquiries", label: "Client Inquiries", detail: "View contact leads" },
];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function isImage(item) {
  return item.mediaType === "image" || /\.(gif|jpe?g|png|webp|avif)(\?|$)/i.test(item.cloudinaryUrl || "");
}

function MediaPreview({ item, large = false }) {
  const className = large ? "h-full w-full object-cover" : "h-full w-full object-contain";
  if (isImage(item)) {
    return <img src={item.thumbnailUrl || item.cloudinaryUrl} alt="" className={className} />;
  }
  return <video className={className} muted preload="metadata" poster={item.thumbnailUrl || undefined}><source src={item.cloudinaryUrl} type="video/mp4" /></video>;
}

function Field({ label, children, required = false }) {
  return <label className="block"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{label}{required && <span className="ml-1 text-[#C1A063]">*</span>}</span>{children}</label>;
}

const inputClass = "w-full border border-white/10 bg-[#10100f] px-3.5 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-700 focus:border-[#C1A063]/70";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [videos, setVideos] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadVideos();
    loadLeads();
  }, []);

  useEffect(() => {
    if (activeTab === "inquiries") loadLeads();
  }, [activeTab]);

  async function loadVideos() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/videos");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load portfolio content.");
      setVideos(result);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeads() {
    setLeadsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/leads");
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Unable to load inquiries.");
      setLeads(Array.isArray(result) ? result : Array.isArray(result?.leads) ? result.leads : []);
    } catch (loadError) {
      console.error("Unable to load inquiries:", loadError);
      setError(loadError.message);
    } finally {
      setLeadsLoading(false);
    }
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEditing(item) {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      category: item.category || "",
      mediaType: item.mediaType || (isImage(item) ? "image" : "video"),
      cloudinaryUrl: item.cloudinaryUrl || "",
      thumbnailUrl: item.thumbnailUrl || "",
      duration: item.duration || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function saveWork(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(editingId ? `/api/videos/${editingId}` : "/api/videos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save work.");
      setVideos((current) => editingId ? current.map((item) => item._id === editingId ? result : item) : [result, ...current]);
      resetForm();
      setNotice(editingId ? "Work updated." : "Work added to the portfolio.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteWork(id) {
    if (!window.confirm("Delete this portfolio item?")) return;
    setError("");
    try {
      const response = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete work.");
      setVideos((current) => current.filter((item) => item._id !== id));
      setNotice("Portfolio item deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(193,160,99,0.13),transparent_32%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <header className="flex items-end justify-between border-b border-white/10 pb-7">
          <div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#C1A063]">LOTUS / CONTROL ROOM</p><h1 className="text-3xl tracking-[-0.04em] sm:text-5xl">Admin dashboard</h1></div>
          <Link href="/" className="hidden text-xs uppercase tracking-[0.18em] text-stone-500 transition hover:text-[#C1A063] sm:block">View site <span aria-hidden="true">↗</span></Link>
        </header>

        <nav className="mt-7 flex gap-7 overflow-x-auto border-b border-white/10" aria-label="Admin sections">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setError(""); setNotice(""); }} className={`relative shrink-0 pb-4 text-left transition ${activeTab === tab.id ? "text-stone-100" : "text-stone-500 hover:text-stone-300"}`}><span className="block text-sm">{tab.label}</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em]">{tab.detail}</span>{activeTab === tab.id && <span className="absolute bottom-0 left-0 h-px w-full bg-[#C1A063]" />}</button>)}
        </nav>

        {error && <div role="alert" className="mt-6 border border-red-200/20 bg-red-950/20 px-4 py-3 text-sm text-red-200">{error}</div>}
        {notice && <div role="status" className="mt-6 border border-[#C1A063]/30 bg-[#C1A063]/10 px-4 py-3 text-sm text-[#dbc18f]">{notice}</div>}

        {activeTab === "portfolio" ? <section className="mt-8 grid gap-10 xl:grid-cols-[360px_1fr]">
          <form onSubmit={saveWork} className="h-fit border border-white/10 bg-[#111110] p-5 sm:p-6">
            <div className="mb-7 flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#C1A063]">{editingId ? "Edit work" : "New work"}</p><h2 className="mt-2 text-xl">{editingId ? "Refine the piece" : "Add to the reel"}</h2></div>{editingId && <button type="button" onClick={resetForm} className="text-[10px] uppercase tracking-[0.15em] text-stone-500 hover:text-white">Cancel</button>}</div>
            <div className="space-y-5">
              <Field label="Title" required><input required name="title" value={form.title} onChange={updateForm} className={inputClass} placeholder="A name for the work" /></Field>
              <Field label="Category / tag"><input name="category" value={form.category} onChange={updateForm} className={inputClass} placeholder="Wedding, Commercial, Narrative" /></Field>
              <Field label="Media type"><select name="mediaType" value={form.mediaType} onChange={updateForm} className={inputClass}><option value="video">Video</option><option value="image">Image</option></select></Field>
              <Field label="Cloudinary media URL" required><input required type="url" name="cloudinaryUrl" value={form.cloudinaryUrl} onChange={updateForm} className={inputClass} placeholder="https://res.cloudinary.com/..." /></Field>
              <Field label="Thumbnail URL"><input type="url" name="thumbnailUrl" value={form.thumbnailUrl} onChange={updateForm} className={inputClass} placeholder="Optional poster image" /></Field>
              <Field label="Duration"><input name="duration" value={form.duration} onChange={updateForm} className={inputClass} placeholder="02:15" /></Field>
            </div>
            <button disabled={saving} className="mt-7 w-full border border-[#C1A063]/60 bg-[#C1A063] px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] transition hover:bg-[#d2b475] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : editingId ? "Save changes" : "Add work"}</button>
          </form>

          <div><div className="mb-5 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">Library</p><h2 className="mt-2 text-2xl">Current work <span className="font-mono text-sm text-[#C1A063]">{videos.length.toString().padStart(2, "0")}</span></h2></div><button type="button" onClick={loadVideos} className="text-[10px] uppercase tracking-[0.15em] text-stone-500 hover:text-[#C1A063]">Refresh</button></div>
            {loading ? <p className="border-t border-white/10 py-12 text-sm text-stone-500">Loading portfolio content...</p> : videos.length === 0 ? <div className="border-t border-white/10 py-12 text-sm text-stone-500">No work has been added yet.</div> : <div className="grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2 2xl:grid-cols-3">{videos.map((item) => <article key={item._id} className="overflow-hidden border border-white/10 bg-[#111110]"><div className="relative aspect-[16/10] bg-[#080808]"><MediaPreview item={item} large /><span className="absolute left-3 top-3 bg-[#0A0A0A]/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#C1A063]">{item.mediaType || (isImage(item) ? "image" : "video")}</span></div><div className="p-4"><div className="flex items-start justify-between gap-4"><div><h3 className="text-base">{item.title}</h3><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-stone-500">{item.category || "General"}{item.duration && ` / ${item.duration}`}</p></div><span className="font-mono text-[10px] text-stone-600">{item.views || 0} views</span></div><div className="mt-5 flex gap-4 border-t border-white/10 pt-3"><button type="button" onClick={() => startEditing(item)} className="text-[10px] uppercase tracking-[0.16em] text-stone-400 hover:text-[#C1A063]">Edit</button><button type="button" onClick={() => deleteWork(item._id)} className="text-[10px] uppercase tracking-[0.16em] text-stone-500 hover:text-red-300">Delete</button></div></div></article>)}</div>}
          </div>
        </section> : <section className="mt-8"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">Inbox</p><h2 className="mt-2 text-2xl">Client inquiries <span className="font-mono text-sm text-[#C1A063]">{leads.length.toString().padStart(2, "0")}</span></h2></div><button type="button" onClick={loadLeads} className="text-[10px] uppercase tracking-[0.15em] text-stone-500 hover:text-[#C1A063]">Refresh</button></div><div className="overflow-x-auto border border-white/10 bg-[#111110]">{leadsLoading ? <p className="px-5 py-12 text-sm text-stone-500">Loading inquiries...</p> : leads.length === 0 ? <p className="px-5 py-12 text-sm text-stone-500">No client inquiries yet.</p> : <table className="w-full min-w-[800px] border-collapse text-left"><thead><tr className="border-b border-[#C1A063]/30 bg-[#161512] font-mono text-[9px] uppercase tracking-[0.18em] text-[#C1A063]"><th className="px-5 py-4 font-normal">Client name</th><th className="px-5 py-4 font-normal">Email</th><th className="px-5 py-4 font-normal">Phone / WhatsApp</th><th className="px-5 py-4 font-normal">Project idea / details</th><th className="px-5 py-4 font-normal">Submitted</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id} className="border-b border-white/10 align-top last:border-0"><td className="px-5 py-5 text-sm text-stone-100">{lead.name}</td><td className="px-5 py-5 text-sm text-stone-500">{lead.email || "Not provided"}</td><td className="px-5 py-5 text-sm text-stone-300">{lead.whatsapp}</td><td className="max-w-sm px-5 py-5 text-sm leading-6 text-stone-400">{lead.message || "No details provided"}</td><td className="whitespace-nowrap px-5 py-5 font-mono text-[10px] uppercase tracking-[0.08em] text-stone-500">{formatDate(lead.createdAt)}</td></tr>)}</tbody></table>}</div></section>}
      </div>
    </main>
  );
}