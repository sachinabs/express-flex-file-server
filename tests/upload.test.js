import fs from "fs";
import request from "supertest";
import express from "express";
import { test, before, after } from "node:test";
import assert from "node:assert";
import { createFileServer } from "express-flex-file-server";


const app = express();

createFileServer(app, {
    uploadRoot: "uploads-test",
    requiredDirs: {
        png: ["png"],
        video: ["mp4"],
        docs: ["txt"]
    },
    streaming: {
        enabled: true,
        chunkSizeMB: 0.5
    }
});

const server = app.listen(0);
const agent = request(server);

let uploadedFileName;


after(() => {
    server.close();
    fs.rmSync("uploads-test", { recursive: true, force: true });
});


test("UPLOAD png file", async () => {
    const res = await agent
        .post("/file/upload")
        .attach("file", Buffer.from("fake image"), "test.png");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.originalName, "test.png");
    assert.ok(res.body.storedName.includes("original-test.png"));
    assert.ok(fs.existsSync(res.body.path));

    uploadedFileName = res.body.storedName;
});

test("UPLOAD txt file", async () => {
    const res = await agent
        .post("/file/upload")
        .attach("file", Buffer.from("hello"), "note.txt");

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.path.includes("uploads-test/docs"));
});

test("REJECT invalid file type", async () => {
    const res = await agent
        .post("/file/upload")
        .attach("file", Buffer.from("bad"), "evil.exe");

    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /not allowed/i);
});

test("VIEW file returns 206 (chunked)", async () => {
    const res = await agent
        .get(`/file/view/${uploadedFileName}`);

    assert.strictEqual(res.status, 206);
    assert.ok(res.headers["content-range"]);
});

test("GET folder stats", async () => {
    const res = await agent.get("/file/stats");

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.folders.png);
    assert.ok(res.body.folders.docs);
});
