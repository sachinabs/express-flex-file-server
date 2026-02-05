import fs from "fs";
import path from "path";

function findFile(uploadRoot, filename, requiredDirs = {}) {
  for (const dir of Object.keys(requiredDirs)) {
    const filePath = path.join(uploadRoot, dir, filename);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

export function streamFile(req, res, config) {
  const { uploadRoot, requiredDirs, streaming } = config;

  const filename = decodeURIComponent(
    req.path.replace(/^\/+/, "")
  );

  if (!filename) {
    return res.status(400).json({ error: "Filename missing" });
  }

  const filePath = findFile(uploadRoot, filename, requiredDirs);

  if (!filePath) {
    return res.status(404).json({
      success: false,
      error: "File not found"
    });
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  const chunkSize =
    (streaming?.chunkSizeMB ?? 10) * 1024 * 1024;

  let start = 0;
  let end;

  if (range) {
    start = Number(range.replace(/\D/g, ""));
  }

  end = Math.min(start + chunkSize, stat.size - 1);

  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".mp4" ? "video/mp4" :
    ext === ".mp3" ? "audio/mpeg" :
    ext === ".wav" ? "audio/wav" :
    "application/octet-stream";

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": contentType
  });

  fs.createReadStream(filePath, { start, end }).pipe(res);
}
