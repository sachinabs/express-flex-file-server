import express from "express";
import { createUploader } from "./core/uploader.js";
import { streamFile } from "./core/viewer.js";
import { getFolderStats } from "./core/stats.js";

export function createFileServer(app, userConfig = {}) {

    const config = {
        uploadRoot: userConfig.uploadRoot || "uploads",

        requiredDirs: userConfig.requiredDirs || {},

        rename: userConfig.rename || { prefix: "id" },

        createFileViewServer: userConfig.createFileViewServer ?? true,

        snap: userConfig.snap ?? true,

        maxFileSizeMB: userConfig.maxFileSizeMB || 200,

        streaming: {
            enabled: userConfig.streaming?.enabled ?? true,
            chunkSizeMB: userConfig.streaming?.chunkSizeMB ?? 10
        }
    };

    const upload = createUploader(config);

    app.post("/file/upload", upload.single("file"), (req, res) => {
        res.json({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,

            viewUrl: config.createFileViewServer
                ? `/file/view/${req.file.filename}`
                : null
        });
    });

    app.use("/file/view", (req, res) => {
        streamFile(req, res, config);
    });

    app.get("/file/stats", (req, res) => {
        res.json(getFolderStats(config.uploadRoot));
    });

    app.use((err, req, res, next) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message || "File operation failed"
            });
        }
        next();
    });
}
