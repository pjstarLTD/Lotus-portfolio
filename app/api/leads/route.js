import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function GET() {
  try {
    await dbConnect();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Lead fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const leadData = {
      name: body.name || "Anonymous",
      whatsapp: body.whatsapp || body.phone || "",
      phone: body.phone,
      message: body.message || body.details || "",
      details: body.details,
    };
    const newLead = await Lead.create(leadData);
    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit inquiry" }, { status: 500 });
  }
}