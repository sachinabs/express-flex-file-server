# express-flex-file-server

A **config-driven file upload & streaming server for Express** with:

* strict file validation
* automatic folder routing
* safe file renaming
* audio / video streaming (chunked)
* configurable chunk size
* folder size & file stats
* Node 18+ / Node 25 compatible

---

## ✨ Features

* Upload files using `multipart/form-data`
* Route files into folders based on extension
* Reject unwanted file types safely
* Rename files with unique prefixes
* Stream large video/audio files using HTTP range
* Control **how much data is sent per chunk**
* View files without URL encoding issues
* Get folder-level usage statistics

---

## 📦 Installation

```bash
npm install express-flex-file-server
```

---

## 🚀 Quick Start

```js
import express from "express";
import { createFileServer } from "express-flex-file-server";

const app = express();

createFileServer(app, {
  uploadRoot: "uploads",

  requiredDirs: {
    png: ["png"],
    video: ["mp4"],
    docs: ["txt", "pdf"]
  },

  streaming: {
    enabled: true,
    chunkSizeMB: 1
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
```

---

## ⚙️ Configuration Options

### `uploadRoot`

Root directory where files are stored.

```js
uploadRoot: "uploads"
```

---

### `requiredDirs` (IMPORTANT)

Defines:

* allowed file extensions
* folder where each type is stored

```js
requiredDirs: {
  png: ["png"],
  video: ["mp4"],
  docs: ["txt", "pdf"]
}
```

❌ Uploading a file **not listed here will be rejected**.

---

### `rename`

Controls how uploaded files are renamed.

```js
rename: {
  prefix: "id" // id | uuid | timestamp
}
```

**Example result**

```
01c40f70bdfd-original-photo.png
```

---

### `streaming`

Controls audio/video streaming behavior.

```js
streaming: {
  enabled: true,
  chunkSizeMB: 0.5
}
```

| Option        | Description                |
| ------------- | -------------------------- |
| `enabled`     | Enable streaming           |
| `chunkSizeMB` | Max bytes sent per request |

> Chunk size applies to **every HTTP range request**
> This enables real streaming behavior.

---

## 📤 Upload API

### Endpoint

```
POST /file/upload
```

### Body

`multipart/form-data`

| Key    | Type |
| ------ | ---- |
| `file` | File |

---

### Response

```json
{
  "originalName": "photo.png",
  "storedName": "01c40f70bdfd-original-photo.png",
  "path": "uploads/png/01c40f70bdfd-original-photo.png",
  "size": 21759,
  "mimetype": "image/png",
  "viewUrl": "/file/view/01c40f70bdfd-original-photo.png"
}
```

✔ Ready to store in database
✔ Can be uploaded to S3
✔ `viewUrl` can be used directly in frontend

---

## 👁️ View / Stream API

### Endpoint

```
GET /file/view/<filename>
```

### Example

```
http://localhost:3000/file/view/01c40f70bdfd-original-photo.png
```

✔ No URL encoding required
✔ Works with spaces & special characters
✔ Streams large files using HTTP 206

---

### 🎥 Video Example

```html
<video controls width="720">
  <source src="http://localhost:3000/file/view/video-file.mp4" type="video/mp4">
</video>
```

---

## 📊 Folder Stats API

### Endpoint

```
GET /file/stats
```

### Response

```json
{
  "totalSizeMB": 12.8,
  "folders": {
    "png": { "files": 3, "sizeMB": 1.2 },
    "video": { "files": 1, "sizeMB": 11.4 }
  }
}
```

Useful for:

* dashboards
* storage limits
* cleanup jobs

---

## ❌ Error Handling

### Invalid file type

```json
{
  "success": false,
  "error": "File type .exe is not allowed"
}
```

### File not found

```json
{
  "success": false,
  "error": "File not found"
}
```

Errors are always returned as **clean JSON**.

---

## 🧪 Testing

Uses **Node.js built-in test runner**.

```bash
npm test
```

Includes tests for:

* uploads
* validation
* streaming
* stats API

---

## 🛡️ Security Notes

* Only extensions defined in `requiredDirs` are allowed
* No file system paths are exposed
* Files are streamed, not fully loaded into memory
* Safe for large files

---

## 🧠 Design Philosophy

* **Config is the source of truth**
* No magic folders
* No implicit behavior
* Frontend-friendly
* CDN-style streaming

---

## 📌 Node Compatibility

* Node.js **18+**
* Tested on **Node 25**
* Express 4+

---

## 🔮 Roadmap

* MIME + extension cross-validation
* Filename sanitization
* Download endpoint
* S3 auto-upload support
* Signed URLs
* TypeScript typings

---

## 📄 License

MIT

---

## 🙌 Author

Built with care for real-world backend use.
