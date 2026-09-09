import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/models/Video";

export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const body = await request.json().catch(() => null);
    const update = body && (body.title || body.cloudinaryUrl || body.category || body.mediaType || body.thumbnailUrl || body.duration)
      ? {
          ...(body.title !== undefined && { title: body.title.trim() }),
          ...(body.category !== undefined && { category: body.category.trim() }),
          ...(body.cloudinaryUrl !== undefined && { cloudinaryUrl: body.cloudinaryUrl.trim() }),
          ...(body.mediaType !== undefined && { mediaType: body.mediaType === "image" ? "image" : "video" }),
          ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl.trim() }),
          ...(body.duration !== undefined && { duration: body.duration.trim() }),
        }
      : { $inc: { views: 1 } };
    const video = await Video.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Unable to update video" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const video = await Video.findByIdAndDelete(id).lean();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete video" }, { status: 500 });
  }
}