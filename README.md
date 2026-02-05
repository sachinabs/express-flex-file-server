# express-flex-file-server

`express-flex-file-server` is a **config-driven file upload and streaming middleware for Express**.

It provides deterministic file handling with strict validation, predictable storage layout, and controlled media streaming.
Designed for backend systems that need **clarity, control, and safety**, not magic.

---

## Core Capabilities

* Multipart file upload (`multipart/form-data`)
* Explicit allow-list for file extensions
* Automatic folder routing based on extension
* Deterministic file renaming
* Chunked audio/video streaming using HTTP Range
* Configurable streaming chunk size
* Folder-level storage statistics
* Compatible with Node.js 18+ (tested on Node 25)

---

## Installation

```bash
npm install express-flex-file-server
```

---

## Minimal Usage

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

app.listen(3000);
```

---

## Configuration

### `uploadRoot`

Filesystem root where all uploads are stored.

```js
uploadRoot: "uploads"
```

The directory is created automatically if it does not exist.

---

### `requiredDirs` (mandatory)

Defines:

* which file extensions are allowed
* which folder each extension maps to

```js
requiredDirs: {
  png: ["png"],
  video: ["mp4"],
  docs: ["txt", "pdf"]
}
```

**Behavior**

* Any file extension not listed here is rejected
* Folder existence does not override this rule
* This is the single source of truth for file validation

---

### `rename`

Controls how files are renamed at upload time.

```js
rename: {
  prefix: "id" // "id" | "uuid" | "timestamp"
}
```

Resulting filename format:

```
<generated-prefix>-original-<original-filename>
```

Example:

```
01c40f70bdfd-original-photo.png
```

---

### `streaming`

Controls media streaming behavior.

```js
streaming: {
  enabled: true,
  chunkSizeMB: 0.5
}
```

| Field         | Description                         |
| ------------- | ----------------------------------- |
| `enabled`     | Enables HTTP Range streaming        |
| `chunkSizeMB` | Maximum bytes returned per response |

**Notes**

* Streaming always uses `206 Partial Content`
* Chunk size is enforced server-side
* Browser controls request frequency; server controls response size

---

## API Reference

### Upload File

**Endpoint**

```
POST /file/upload
```

**Request**

* `multipart/form-data`
* Field name: `file`

**Example**

```bash
curl -F "file=@example.png" http://localhost:3000/file/upload
```

**Response**

```json
{
  "originalName": "example.png",
  "storedName": "01c40f70bdfd-original-example.png",
  "path": "uploads/png/01c40f70bdfd-original-example.png",
  "size": 21759,
  "mimetype": "image/png",
  "viewUrl": "/file/view/01c40f70bdfd-original-example.png"
}
```

**Intended usage**

* `storedName`: persist in database
* `path`: optional cloud upload (S3, etc.)
* `viewUrl`: direct consumption by frontend

---

### View / Stream File

**Endpoint**

```
GET /file/view/<storedName>
```

**Example**

```
http://localhost:3000/file/view/01c40f70bdfd-original-example.png
```

**Behavior**

* Supports filenames with spaces and special characters
* Uses prefix routing (not param parsing)
* Streams large files using HTTP Range
* No URL encoding required on the client

---

### Video Example

```html
<video controls width="720">
  <source
    src="http://localhost:3000/file/view/video-file.mp4"
    type="video/mp4"
  />
</video>
```

---

### Folder Statistics

**Endpoint**

```
GET /file/stats
```

**Response**

```json
{
  "totalSizeMB": 12.8,
  "folders": {
    "png": {
      "files": 3,
      "sizeMB": 1.2
    },
    "video": {
      "files": 1,
      "sizeMB": 11.4
    }
  }
}
```

**Typical use cases**

* Storage dashboards
* Quota enforcement
* Cleanup or archival jobs

---

## Error Model

All errors are returned as JSON.

### Invalid File Type

```json
{
  "success": false,
  "error": "File type .exe is not allowed"
}
```

### File Not Found

```json
{
  "success": false,
  "error": "File not found"
}
```

No HTML errors or stack traces are exposed.

---

## Testing

Uses the **Node.js built-in test runner**.

```bash
npm test
```

Tests cover:

* valid uploads
* invalid uploads
* streaming behavior
* chunk enforcement
* folder statistics

---

## Security Characteristics

* Strict extension allow-list
* No implicit directory access
* No full-file buffering in memory
* Safe for large media files
* Deterministic filesystem behavior

---

## Design Principles

* Configuration is explicit and authoritative
* No inference from filesystem state
* No hidden conventions
* Backend-first design
* CDN-style streaming model

---

## Compatibility

* Node.js 18+
* Tested on Node.js 25
* Express 4.x

---

## Roadmap

* MIME + extension cross-validation
* Filename sanitization
* Download endpoint
* S3 auto-upload hooks
* Signed URLs
* TypeScript definitions

---

## License

MIT

---

## Author

**Anish Bala Sachin**
GitHub: [https://github.com/sachinabs](https://github.com/sachinabs)
LinkedIn: [https://www.linkedin.com/in/anish-bala-sachin/](https://www.linkedin.com/in/anish-bala-sachin/)

