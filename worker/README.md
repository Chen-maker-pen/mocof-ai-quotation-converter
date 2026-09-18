# MOCOF long-running conversion worker

The Vercel app only stores the uploaded source in Vercel Blob, creates a job,
and returns immediately. QStash then calls this service. The worker runs the
selected Area recipe sequentially, writes the source-preserving XLSX and JSON
result back to Blob, and updates the job status.

Deploy this directory as a private Google Cloud Run service with a request
timeout of 30–60 minutes. It requires the same values as the Vercel app:

```env
BLOB_READ_WRITE_TOKEN=...
GEMINI_API_KEY=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
```

The worker implementation is intentionally the next deployment task: it must
run the documented Area executor—not a generic replacement table—and should
not be switched on until its Area 1–10 fixture tests have been approved.
