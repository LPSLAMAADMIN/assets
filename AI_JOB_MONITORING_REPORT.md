# AI Job Monitoring Report

**Date:** 2025-07-05  
**Feature:** Real-time AI Processing Monitor  
**Status:** ✅ Complete — End-to-end working

---

## Summary

Replaced the static "AI Processing Documents..." screen with a real-time progress tracking system using Server-Sent Events (SSE). Users can now see exactly what stage their document is in, with live progress updates, error details, retry capability, and processing logs.

---

## Architecture

```
┌─────────────┐     SSE Stream      ┌─────────────┐
│  Dashboard  │◄────────────────────│   lps-api   │
│  (Browser)  │                      │  (Node.js)  │
└─────────────┘                      └──────┬──────┘
                                            │
                                    HTTP Callbacks
                                            │
                                     ┌──────▼──────┐
                                     │   lps-ai    │
                                     │  (FastAPI)  │
                                     └─────────────┘
```

**Flow:**
1. API creates AIJob record (QUEUED)
2. API calls AI service `/api/v1/process-tracked` with `callback_url`
3. AI service processes document through stages
4. At each stage, AI service sends HTTP PATCH to API with progress
5. API updates database and emits SSE event
6. Dashboard receives SSE event and updates UI in real-time

---

## Files Created

### lps-api
| File | Purpose |
|------|---------|
| `src/modules/ai-jobs/ai-jobs.service.ts` | Service: create, update, progress, complete, fail, retry |
| `src/modules/ai-jobs/ai-jobs.routes.ts` | REST + SSE endpoints |
| `prisma/migrations/20250705120000_add_ai_job_tracking/migration.sql` | Database migration |
| `test/unit/ai-jobs.service.test.ts` | 8 unit tests |

### lps-ai
| File | Purpose |
|------|---------|
| `src/api/routes/job_tracking.py` | `/process-tracked` with stage callbacks |
| `tests/unit/test_job_tracking.py` | 3 integration tests |

### lps-dashboard
| File | Purpose |
|------|---------|
| `components/ai/AIJobMonitor.tsx` | Real-time progress UI component |

### Modified
| File | Change |
|------|--------|
| `lps-api/prisma/schema.prisma` | Added AIJob model + enums |
| `lps-api/src/main.ts` | Registered ai-jobs routes |
| `lps-ai/src/main.py` | Registered job_tracking router |

---

## Database Schema

```sql
CREATE TABLE "AIJob" (
    "id" TEXT PRIMARY KEY,
    "propertyId" TEXT NOT NULL REFERENCES "Property"("id") ON DELETE CASCADE,
    "documentId" TEXT REFERENCES "Document"("id") ON DELETE SET NULL,
    "status" AIJobStatus DEFAULT 'QUEUED',
    "stage" AIJobStage DEFAULT 'UPLOAD',
    "progressPercent" INTEGER DEFAULT 0,
    "message" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "retries" INTEGER DEFAULT 0,
    "maxRetries" INTEGER DEFAULT 3,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX ON "AIJob"("propertyId");
CREATE INDEX ON "AIJob"("documentId");
CREATE INDEX ON "AIJob"("status");
CREATE INDEX ON "AIJob"("createdAt");
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/ai/jobs/:jobId` | Get job status |
| POST | `/api/v1/ai/jobs/:jobId/retry` | Retry failed job |
| GET | `/api/v1/ai/jobs/:jobId/events` | SSE progress stream |
| GET | `/api/v1/properties/:id/ai-jobs` | All jobs for property |

### SSE Events

| Event | Data | Trigger |
|-------|------|---------|
| `connected` | `{ jobId }` | On connection |
| `progress` | Full job state | Each stage transition |
| `done` | Final job state | Completion or failure |

---

## Processing Stages

| Stage | Progress | Description |
|-------|----------|-------------|
| UPLOAD | 10% | File validation |
| CLASSIFICATION | 25% | Document type detection |
| OCR | 45% | Text extraction (native PDF or Tesseract) |
| EXTRACTION | 65% | Named entity recognition |
| MAPPING | 80% | Field mapping to structured data |
| VALIDATION | 90% | Data validation and confidence scoring |
| COMPLETE | 100% | Results saved |

---

## UI Features

- **Progress bar** with percentage and animated fill
- **Stage timeline** showing completed/active/pending stages
- **Live status messages** from AI service
- **Error box** with detailed error message on failure
- **Retry button** for failed jobs
- **Skip to review** button during processing
- **View logs** panel with timestamped processing log
- **Dark mode** support
- **Auto-reconnect** on connection loss

---

## Test Results

### lps-api (8 tests)
```
✓ should create a job with QUEUED status
✓ should update job stage and percent
✓ should mark job as COMPLETED with 100%
✓ should set RETRYING status if retries remain
✓ should set FAILED status if max retries exhausted
✓ should reset a failed job to QUEUED
✓ should throw if job is not failed
✓ should return jobs ordered by createdAt desc
```

### Full Suite: 36 API tests passing

---

## Docker Verification

All 7 services healthy after rebuild:
```
lps-platform-blockchain-1      Up (healthy)
lps-platform-lps-ai-1          Up (healthy)
lps-platform-lps-api-1         Up (healthy)
lps-platform-lps-dashboard-1   Up (healthy)
lps-platform-nginx-1           Up (healthy)
lps-platform-postgres-1        Up (healthy)
lps-platform-redis-1           Up (healthy)
```

---

## Usage Example

```tsx
import { AIJobMonitor } from '@/components/ai/AIJobMonitor';

function PropertyIntakePage({ jobId, fileName }) {
  return (
    <AIJobMonitor
      jobId={jobId}
      fileName={fileName}
      onComplete={() => router.push('/review')}
      onRetry={() => refetchJob()}
    />
  );
}
```

---

## Logging

Every AI job step is logged with structured fields:
```json
{
  "level": "info",
  "message": "AI job updated",
  "jobId": "abc-123",
  "status": "PROCESSING",
  "stage": "OCR",
  "progress": 45,
  "context": "ai-jobs"
}
```

---

## Known Limitations

1. SSE doesn't work through HTTP/2 push (nginx handles correctly)
2. Token passed as query param for EventSource (browser limitation)
3. Max 100 concurrent SSE listeners per API instance
4. No persistent job queue yet (in-process only) — Redis queue planned for v1.1
