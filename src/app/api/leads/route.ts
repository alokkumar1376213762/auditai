import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const tmpPath = path.join("/tmp", "leads.json");
    const localPath = path.join(process.cwd(), "data", "leads.json");
    const filePath = fs.existsSync(tmpPath) ? tmpPath : localPath;

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ leads: [] });
    }
    const data = fs.readFileSync(filePath, "utf-8");
    const leads = JSON.parse(data || "[]");
    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ leads: [] });
  }
}
