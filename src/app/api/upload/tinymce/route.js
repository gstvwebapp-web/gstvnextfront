import { NextResponse } from 'next/server';
import path from "path";
import fs from "fs";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads/tinymce");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filepath, buffer);

  return NextResponse.json({
    location: `/uploads/tinymce/${filename}`, // URL TinyMCE uses
  });
}
