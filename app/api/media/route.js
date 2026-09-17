import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Media from "@/models/Media";

export async function GET(request) {
  try {
    await connectToDatabase();
    const pinnedOnly = new URL(request.url).searchParams.get("pinned") === "true";
    const media = await Media.find(pinnedOnly ? { isPinned: true } : {}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: "Unable to load media" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = body.title?.trim();
    const url = body.url?.trim();
    const type = body.type;

    if (!title || !url || !["image", "video"].includes(type)) {
      return NextResponse.json({ error: "Title, URL, and a valid media type are required" }, { status: 400 });
    }

    await connectToDatabase();
    const media = await Media.create({ title, url, type, isPinned: Boolean(body.isPinned) });
    return NextResponse.json(media, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create media" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!mongoose.isValidObjectId(body.id)) {
      return NextResponse.json({ error: "A valid media id is required" }, { status: 400 });
    }

    await connectToDatabase();
    const media = await Media.findByIdAndUpdate(
      body.id,
      { isPinned: Boolean(body.isPinned) },
      { new: true, runValidators: true },
    ).lean();
    if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: "Unable to update media" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    if (!mongoose.isValidObjectId(body.id)) {
      return NextResponse.json({ error: "A valid media id is required" }, { status: 400 });
    }

    await connectToDatabase();
    const media = await Media.findByIdAndDelete(body.id).lean();
    if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete media" }, { status: 500 });
  }
}