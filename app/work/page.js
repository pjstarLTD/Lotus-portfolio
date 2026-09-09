"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FILTERS = ["All", "Weddings", "Commercials", "Short Films"];

function isImageWork(work) {
  return work.mediaType === "image" || /\.(gif|jpe?g|png|webp|avif)(\?|$)/i.test(work.cloudinaryUrl || "");
}

function matchesFilter(work, filter) {
  if (filter === "All") return true;
  const category = (work.category || "").toLowerCase();
  const aliases = { Weddings: ["wedding", "weddings"], Commercials: ["commercial", "commercials"], "Short Films": ["short film", "short films", "narrative"] };
  return aliases[filter].some((value) => category.includes(value));
}

function Media({ work, modal = false, onPlay }) {
  const mediaClass = modal ? "max-h-[78vh] w-full object-contain" : "h-full w-full object-cover transition duration-700 group-hover:scale-105";
  if (isImageWork(work)) return <img src={work.thumbnailUrl || work.cloudinaryUrl} alt={work.title} className={mediaClass} />;
  return <video autoPlay muted={!modal} loop={!modal} controls={modal} playsInline preload="metadata" className={mediaClass} onPlay={onPlay}><source src={work.cloudinaryUrl} type="video/mp4" /></video>;
}

function Card({ work, onOpen }) {
  return <article className="group min-w-0"><button type="button" onClick={() => onOpen(work)} className="block w-full text-left"><div className="relative aspect-video overflow-hidden rounded-md bg-stone-900"><Media work={work} /><span className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-white">{work.duration || "00:00"}</span><span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" /></div><div className="flex items-start gap-4 pt-4"><div className="min-w-0 flex-1"><h2 className="truncate text-base text-stone-100">{work.title}</h2><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-stone-500">{work.category || "General"}</p></div><span aria-hidden="true" className="pt-0.5 text-lg leading-none tracking-[0.1em] text-stone-500">...</span></div></button></article>;
}

export default function WorkPage() {
  const [works, setWorks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedWork, setSelectedWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/videos")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the portfolio.");
        return response.json();
      })
      .then(setWorks)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedWork(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const visibleWorks = works.filter((work) => matchesFilter(work, filter));

  function openWork(work) {
    setSelectedWork(work);
    if (!isImageWork(work)) fetch(`/api/videos/${work._id}`, { method: "PATCH" }).catch(() => {});
  }

  return <main className="min-h-screen bg-[#0b0b0a] text-stone-100"><header className="border-b border-white/10 bg-[#0A0A0A] px-6 py-7 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="font-mono text-sm tracking-[0.35em]">LOTUS</Link><Link href="/#contact" className="text-xs uppercase tracking-[0.22em] text-stone-400 hover:text-white">Start a project <span aria-hidden="true">↗</span></Link></div></header><section className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-10 lg:px-16 lg:pb-36 lg:pt-28"><div className="max-w-2xl"><p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-[#C1A063]">LOTUS / SELECTED WORK</p><h1 className="text-6xl leading-[0.9] tracking-[-0.06em] sm:text-8xl">The full<br /><span className="font-serif font-normal text-[#C1A063]">reel.</span></h1><p className="mt-8 max-w-md text-base leading-7 text-stone-400">Films and visual stories made with patience, instinct, and a little bit of light.</p></div><div className="mt-16 flex gap-2 overflow-x-auto border-b border-white/10 pb-4" aria-label="Filter portfolio"><span className="mr-4 shrink-0 self-center font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600">Filter</span>{FILTERS.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${filter === item ? "border-[#C1A063] bg-[#C1A063] text-[#0A0A0A]" : "border-white/15 text-stone-400 hover:border-[#C1A063]/70 hover:text-[#C1A063]"}`}>{item}</button>)}</div>{loading && <p className="py-16 text-sm text-stone-500">Loading the reel...</p>}{error && <p className="py-16 text-sm text-red-200">{error}</p>}{!loading && !error && visibleWorks.length === 0 && <p className="py-16 text-sm text-stone-500">No work in this collection yet.</p>}{!loading && !error && visibleWorks.length > 0 && <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{visibleWorks.map((work) => <Card key={work._id} work={work} onOpen={openWork} />)}</div>}</section><footer className="border-t border-white/10 px-6 py-6 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-stone-600"><span>Based everywhere</span><span>© {new Date().getFullYear()} Lotus Studio</span></div></footer>{selectedWork && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 p-5 sm:p-10" role="dialog" aria-modal="true" aria-label={selectedWork.title} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedWork(null); }}><div className="relative w-full max-w-6xl"><button type="button" onClick={() => setSelectedWork(null)} className="absolute -top-12 right-0 text-xs uppercase tracking-[0.18em] text-stone-400 hover:text-white">Close <span aria-hidden="true">X</span></button><div className="overflow-hidden rounded-md bg-black"><Media work={selectedWork} modal /></div><div className="flex items-center justify-between gap-4 pt-4"><div><h2 className="text-xl">{selectedWork.title}</h2><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#C1A063]">{selectedWork.category || "General"}</p></div><span className="font-mono text-xs text-stone-500">{selectedWork.duration || "00:00"}</span></div></div></div>}</main>;
}