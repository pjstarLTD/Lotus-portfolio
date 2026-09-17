"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MediaPreview, { isImageUrl } from "./components/MediaPreview";

const WHATSAPP_LINK = "https://wa.me/YOUR_NUMBER";
const HERO_IMAGES = [
  {
    src: "https://res.cloudinary.com/djvuchlcr/image/upload/v1788673423/arlet-padron-benitez-bemB6TTFYkU-unsplash-removebg-preview_s7p0zh.png",
    alt: "A couple sharing a cinematic moment",
  },
  {
    src: "https://res.cloudinary.com/djvuchlcr/image/upload/v1788675183/rakabtw_-M3YuHIpgmSY-unsplash-removebg-preview_pxr3vv.png",
    alt: "A cinematic resort scene",
  },
  {
    src: "https://res.cloudinary.com/djvuchlcr/image/upload/v1788796236/The_best_hotels_in_Lagos-removebg-preview_j2xyik.png",
    alt: "A cinematic hotel scene",
  },
];

function compactViews(value = 0) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function isImageWork(work) {
  return isImageUrl(work);
}

function getCreatedTime(work) {
  return new Date(work.createdAt || 0).getTime();
}

function isPinnedWork(work) {
  return work.isPinned !== false;
}

function WorkThumbnail({ work, modal = false, onPlay }) {
  return <MediaPreview item={work} modal={modal} onPlay={onPlay} />;
}

function WorkCard({ work, onOpen }) {
  return <article className="group min-w-0"><button type="button" onClick={() => onOpen(work)} className="block w-full text-left"><div className="relative aspect-video overflow-hidden rounded-md bg-stone-900"><WorkThumbnail work={work} /><span className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-white">{work.duration || "00:00"}</span><span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" /></div><div className="flex items-start gap-4 pt-4"><div className="min-w-0 flex-1"><h3 className="truncate text-base text-stone-100">{work.title}</h3><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-stone-500">{work.category || "General"}</p></div><span aria-hidden="true" className="pt-0.5 text-lg leading-none tracking-[0.1em] text-stone-500">...</span></div></button></article>;
}

export default function Home() {
  const [mediaItems, setMediaItems] = useState([]);
  const [legacyVideos, setLegacyVideos] = useState([]);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [gallerySort, setGallerySort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ name: "", whatsapp: "", message: "", phone: "", details: "" });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [selectedWork, setSelectedWork] = useState(null);

  async function fetchGallery() {
    const [mediaResponse, videosResponse] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/videos"),
    ]);
    if (!mediaResponse.ok || !videosResponse.ok) throw new Error("Unable to load the gallery.");
    return {
      media: await mediaResponse.json(),
      videos: await videosResponse.json(),
    };
  }

  useEffect(() => {
    fetchGallery()
      .then((gallery) => {
        setMediaItems(gallery.media);
        setLegacyVideos(gallery.videos);
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleAllMedia() {
    const nextValue = !showAllMedia;
    setShowAllMedia(nextValue);
  }

  const galleryItems = [...mediaItems, ...legacyVideos];
  const visibleGallery = galleryItems
    .filter((item) => galleryFilter === "all" ? isPinnedWork(item) : galleryFilter === "images" ? isImageWork(item) : !isImageWork(item))
    .filter((item) => galleryFilter === "all" || gallerySort === "newest" || isPinnedWork(item))
    .sort((first, second) => getCreatedTime(second) - getCreatedTime(first));

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedWork(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function submitInquiry(event) {
    event.preventDefault();
    setSending(true);
    setNotice("");
    setFormError("");
    const { name, phone: enteredPhone, whatsapp, details: enteredDetails, message } = form;
    const phone = enteredPhone || whatsapp;
    const details = enteredDetails || message;
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, details }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send inquiry.");
      setForm({ name: "", whatsapp: "", message: "", phone: "", details: "" });
      setNotice("Thank you. We will be in touch shortly.");
    } catch (error) {
      console.error("Unable to submit inquiry:", error);
      setFormError(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0b0a] text-stone-100">
      <section className="relative flex min-h-[92vh] flex-col border-b border-white/10 bg-[#0a0a0a] px-6 py-7 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(193,160,99,0.22),transparent_24%),radial-gradient(circle_at_58%_50%,rgba(193,160,99,0.08),transparent_34%)]" />
        <nav className="relative z-10 flex items-center justify-between">
          <a href="#top" className="font-mono text-sm tracking-[0.35em]">LOTUS</a>
          <a href="#contact" className="text-xs uppercase tracking-[0.22em] text-stone-400 hover:text-white">Start a project <span aria-hidden="true">↗</span></a>
        </nav>
        <div className="relative z-10 my-auto grid max-w-7xl items-center gap-12 pb-16 pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pt-28">
          <div className="max-w-2xl">
            <p className="mb-7 font-mono text-xs uppercase tracking-[0.28em] text-[#C1A063]">INDEPENDENT FILM &amp; VISUAL STORIES</p>
            <h1 className="max-w-xl text-7xl font-medium leading-[0.87] tracking-[-0.065em] text-white sm:text-8xl lg:text-[8.5rem]">Make it<br /><span className="font-serif font-normal text-[#C1A063]">matter.</span></h1>
            <div className="mt-10 flex max-w-xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-sm text-base leading-7 text-stone-400">Cinematic videography for people, places, and ideas that deserve to be remembered.</p>
              <a href="#portfolio" className="group flex shrink-0 items-center gap-3 text-xs uppercase tracking-[0.2em] text-stone-100">VIEW THE WORK <span aria-hidden="true" className="text-base transition-transform group-hover:translate-y-1">↓</span></a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:pl-12 lg:pr-0 lg:justify-self-end">
            <div className="absolute left-1/2 top-1/2 h-4/5 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C1A063]/20 blur-[90px]" />
            <div className="relative grid bg-transparent lg:justify-items-end">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={HERO_IMAGES[heroImageIndex].src}
                  src={HERO_IMAGES[heroImageIndex].src}
                  alt={HERO_IMAGES[heroImageIndex].alt}
                  className="col-start-1 row-start-1 max-h-[80vh] w-auto bg-transparent object-contain drop-shadow-2xl"
                  style={{ gridArea: "1 / 1" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex justify-between border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.2em] text-stone-500"><span>Based everywhere</span><span>© {new Date().getFullYear()} Lotus Studio</span></div>
      </section>

      <section id="portfolio" className="px-6 py-24 sm:px-10 lg:px-16 lg:py-36">
        <div className="mb-12"><p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-amber-200/70">{showAllMedia ? "Gallery / all media" : "Gallery / pinned selection"}</p><h2 className="text-4xl tracking-[-0.04em] sm:text-6xl">The moving image.</h2></div>
        <div className="mb-3 flex gap-2 overflow-x-auto border-b border-white/10 pb-4" aria-label="Filter gallery"><span className="mr-3 shrink-0 self-center font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600">Filter</span>{[["all", "All"], ["images", "Images"], ["videos", "Videos"]].map(([value, label]) => <button type="button" key={value} onClick={() => { setGalleryFilter(value); if (value === "all") setGallerySort("pinned"); }} className={`shrink-0 border px-4 py-2 text-xs uppercase tracking-[0.12em] transition ${galleryFilter === value ? "border-[#C1A063] bg-[#C1A063] text-[#0A0A0A]" : "border-white/15 text-stone-400 hover:border-[#C1A063]/70 hover:text-[#C1A063]"}`}>{label}</button>)}</div>
        {galleryFilter !== "all" && <div className="mb-8 flex items-center gap-2" aria-label="Sort gallery"><span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600">Show</span>{[["newest", "Newest"], ["pinned", "Pinned"]].map(([value, label]) => <button type="button" key={value} onClick={() => setGallerySort(value)} className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition ${gallerySort === value ? "border-[#C1A063] text-[#C1A063]" : "border-white/15 text-stone-500 hover:border-[#C1A063]/70 hover:text-[#C1A063]"}`}>{label}</button>)}</div>}
        {loading && <p className="border-t border-white/10 py-10 text-sm text-stone-500">Loading the reel...</p>}
        {loadError && <p className="border-t border-red-200/20 py-10 text-sm text-red-200">{loadError}</p>}
        {!loading && !loadError && visibleGallery.length === 0 && <p className="border-t border-white/10 py-10 text-sm text-stone-500">No {galleryFilter === "all" ? "gallery media" : galleryFilter} found.</p>}
        {!loading && !loadError && visibleGallery.length > 0 && <>
          <div className="grid gap-x-6 gap-y-12 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-3">{visibleGallery.slice(0, showAllMedia ? visibleGallery.length : 3).map((item) => <WorkCard key={`${item.type || item.mediaType || "video"}-${item._id}`} work={item} onOpen={(work) => setSelectedWork(work)} />)}</div>
          <div className="flex justify-center pt-8">
            <button type="button" onClick={toggleAllMedia} className="group relative overflow-hidden rounded-full border border-[#f3dca3]/70 bg-gradient-to-r from-[#8b682f] via-[#d7b56d] to-[#fff0bd] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#17120a] shadow-[0_0_28px_rgba(211,171,91,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(211,171,91,0.38)]">
              <span className="relative z-10 flex items-center gap-3"><span>{showAllMedia ? "Show pinned" : "View all media"}</span><span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">-&gt;</span></span>
            </button>
          </div>
        </>}
      </section>

      {selectedWork && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 p-5 sm:p-10" role="dialog" aria-modal="true" aria-label={selectedWork.title} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedWork(null); }}><div className="relative w-full max-w-6xl"><button type="button" onClick={() => setSelectedWork(null)} className="absolute -top-12 right-0 text-xs uppercase tracking-[0.18em] text-stone-400 hover:text-white">Close <span aria-hidden="true">X</span></button><div className="overflow-hidden rounded-md bg-black"><WorkThumbnail work={selectedWork} modal /></div><div className="flex items-center justify-between gap-4 pt-4"><div><h2 className="text-xl">{selectedWork.title}</h2><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#C1A063]">{selectedWork.type || "media"}</p></div><span className="font-mono text-xs text-stone-500">{selectedWork.type || "media"}</span></div></div></div>}

      <section id="contact" className="border-t border-white/10 bg-[#151512] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-28"><div><p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-amber-200/70">Let&apos;s make something</p><h2 className="max-w-lg text-5xl leading-[0.95] tracking-[-0.05em] sm:text-7xl">Have a story in mind?</h2><p className="mt-8 max-w-sm text-sm leading-7 text-stone-400">Tell us a little about it. We&apos;ll get back to you with thoughtful next steps.</p></div><form onSubmit={submitInquiry} className="space-y-8">{[["name", "Your name", "Jane Smith"], ["whatsapp", "WhatsApp phone number", "+1 555 000 0000"]].map(([name, label, placeholder]) => <label key={name} className="block border-b border-white/20 pb-3"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{label}</span><input required name={name} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="w-full bg-transparent text-lg outline-none placeholder:text-stone-700" placeholder={placeholder} /></label>)}<label className="block border-b border-white/20 pb-3"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Project details</span><textarea name="message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows="3" className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-stone-700" placeholder="What are you bringing to life?" /></label><div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between"><button disabled={sending} className="border border-amber-100/50 px-6 py-3 text-xs uppercase tracking-[0.2em] text-amber-100 hover:bg-amber-100 hover:text-stone-950 disabled:opacity-50">{sending ? "Sending..." : "Send inquiry ↗"}</button><a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-[0.16em] text-stone-400 hover:text-white">Chat on WhatsApp Now ↗</a></div>{notice && <p role="status" className="text-sm text-amber-100">{notice} <a className="underline" href={WHATSAPP_LINK} target="_blank" rel="noreferrer">Chat on WhatsApp Now</a></p>}{formError && <p role="alert" className="text-sm text-red-200">{formError}</p>}</form></div></section>
    </main>
  );
}