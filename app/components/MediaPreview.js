"use client";

import { useEffect, useState } from "react";

const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;
const HEIC_EXTENSIONS = /\.(heic|heif)(?:$|[?#])/i;
const VIDEO_EXTENSIONS = /\.(m3u8|m4v|mov|mp4|og[gv]|webm)(?:$|[?#])/i;
const PDF_EXTENSIONS = /\.pdf(?:$|[?#])/i;

function getPathname(url = "") {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split(/[?#]/, 1)[0];
  }
}

function getCloudinaryImageUrl(url = "") {
  if (!/https?:\/\/res\.cloudinary\.com\//i.test(url) || !url.includes("/upload/")) return "";
  if (/\/upload\/[^/]*f_/i.test(url)) return url;
  return url.replace("/upload/", "/upload/f_jpg/");
}

export function getMediaKind(item) {
  const url = item?.url || item?.cloudinaryUrl || "";
  const pathname = getPathname(url);

  if (PDF_EXTENSIONS.test(pathname)) return "pdf";
  if (HEIC_EXTENSIONS.test(pathname)) return "heic";
  if (VIDEO_EXTENSIONS.test(pathname)) return "video";
  if (IMAGE_EXTENSIONS.test(pathname)) return "image";
  if (item?.type === "image" || item?.mediaType === "image") return "image";
  if (item?.type === "video" || item?.mediaType === "video") return "video";
  return "unknown";
}

export function isImageUrl(item) {
  const kind = getMediaKind(item);
  return kind === "image" || kind === "heic";
}

function UnsupportedPreview({ url, title, className }) {
  return (
    <div className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-3 bg-stone-950 p-6 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C1A063]">Preview unavailable</span>
      <p className="max-w-sm break-all text-xs text-stone-500">This format cannot be previewed in the browser.</p>
      <a href={url} target="_blank" rel="noreferrer" className="border border-white/20 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-stone-200 transition hover:border-[#C1A063] hover:text-[#C1A063]">Open file</a>
    </div>
  );
}

const protectedMediaProps = {
  draggable: false,
  onContextMenu: (event) => event.preventDefault(),
  onDragStart: (event) => event.preventDefault(),
};

export default function MediaPreview({ item, modal = false, large = false, onPlay }) {
  const url = item?.url || item?.thumbnailUrl || item?.cloudinaryUrl || "";
  const sourceUrl = item?.url || item?.cloudinaryUrl || "";
  const kind = getMediaKind(item);
  const cloudinaryImageUrl = getCloudinaryImageUrl(sourceUrl);
  const browserImageUrl = cloudinaryImageUrl && (kind === "image" || kind === "heic") ? cloudinaryImageUrl : sourceUrl;
  const className = modal
    ? "max-h-[78vh] w-full object-contain"
    : large
      ? "h-full w-full object-contain"
      : "h-full w-full object-cover transition duration-700 group-hover:scale-105";
  const [convertedPreview, setConvertedPreview] = useState({ source: "", url: "" });
  const [failedSource, setFailedSource] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    if (kind !== "heic" || !sourceUrl) return () => { cancelled = true; };

    fetch(sourceUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to fetch HEIC file");
        return response.blob();
      })
      .then(async (blob) => {
        const heicModule = await import("heic2any");
        const convert = heicModule.default || heicModule;
        const converted = await convert({ blob, toType: "image/jpeg", quality: 0.9 });
        const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
        objectUrl = URL.createObjectURL(convertedBlob);
        if (!cancelled) setConvertedPreview({ source: sourceUrl, url: objectUrl });
      })
      .catch(() => {
        if (!cancelled) setFailedSource(sourceUrl);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kind, sourceUrl, url]);

  if (!sourceUrl) return <UnsupportedPreview url="#" title={item?.title} className={className} />;
  if (kind === "pdf") return <iframe {...protectedMediaProps} src={sourceUrl} title={item?.title || "PDF document"} className="h-full min-h-64 w-full border-0 select-none" />;
  if (kind === "heic" && cloudinaryImageUrl) return <img {...protectedMediaProps} src={browserImageUrl} alt={item?.title || ""} className={`${className} select-none`} onError={() => setFailedSource(sourceUrl)} />;
  if (kind === "heic") {
    if (failedSource === sourceUrl) return <UnsupportedPreview url={sourceUrl} title={item?.title} className={className} />;
    return convertedPreview.source === sourceUrl ? <img {...protectedMediaProps} src={convertedPreview.url} alt={item?.title || ""} className={`${className} select-none`} onError={() => setFailedSource(sourceUrl)} /> : <div className="flex h-full items-center justify-center text-xs text-stone-500">Preparing preview...</div>;
  }
  if (kind === "image") return <img {...protectedMediaProps} src={browserImageUrl} alt={item?.title || ""} className={`${className} select-none`} onError={() => setFailedSource(sourceUrl)} />;
  if (kind === "video") return <video {...protectedMediaProps} autoPlay muted={!modal} controls={modal} controlsList="nodownload noplaybackrate" disablePictureInPicture playsInline preload="metadata" className={className} onPlay={onPlay} onTimeUpdate={(event) => { if (!modal && event.currentTarget.currentTime >= 5) event.currentTarget.pause(); }} onError={() => setFailedSource(sourceUrl)}><source src={sourceUrl} /></video>;
  if (failedSource === sourceUrl) return <UnsupportedPreview url={sourceUrl} title={item?.title} className={className} />;

  return <img {...protectedMediaProps} src={sourceUrl} alt={item?.title || ""} className={`${className} select-none`} onError={() => setFailedSource(sourceUrl)} />;
}
