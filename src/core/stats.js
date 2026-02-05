import fs from "fs";
import path from "path";

export function getFolderStats(root) {
  const result = { totalSizeMB: 0, folders: {} };

  for (const folder of fs.readdirSync(root)) {
    const folderPath = path.join(root, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    let size = 0;
    let files = 0;

    for (const file of fs.readdirSync(folderPath)) {
      const stat = fs.statSync(path.join(folderPath, file));
      size += stat.size;
      files++;
    }

    result.folders[folder] = {
      files,
      sizeMB: +(size / 1024 / 1024).toFixed(2)
    };

    result.totalSizeMB += size;
  }

  result.totalSizeMB = +(result.totalSizeMB / 1024 / 1024).toFixed(2);
  return result;
}
