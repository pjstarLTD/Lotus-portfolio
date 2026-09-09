import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/models/Video";

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(videos);
  } catch {
    return NextResponse.json({ error: "Unable to load videos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title?.trim() || !body.cloudinaryUrl?.trim()) {
      return NextResponse.json({ error: "Title and media URL are required" }, { status: 400 });
    }

    await connectToDatabase();
    const video = await Video.create({
      title: body.title.trim(),
      category: body.category?.trim() || "General",
      cloudinaryUrl: body.cloudinaryUrl.trim(),
      mediaType: body.mediaType === "image" ? "image" : "video",
      thumbnailUrl: body.thumbnailUrl?.trim() || undefined,
      duration: body.duration?.trim() || undefined,
    });
    return NextResponse.json(video, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create work" }, { status: 500 });
  }
}