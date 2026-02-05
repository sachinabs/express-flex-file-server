export function validateExtension(filename, requiredDirs) {
  const ext = filename.split(".").pop().toLowerCase();

  for (const [dir, exts] of Object.entries(requiredDirs)) {
    if (exts.includes(ext)) {
      return { dir, ext };
    }
  }

  throw new Error(`File type .${ext} is not allowed`);
}
