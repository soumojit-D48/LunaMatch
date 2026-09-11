# LunarSync
**LunarSync — Multi-modal Lunar Image Registration System**
*Different sun. Different scale. Same ground.⚡*

> Sun-angle, scale & viewpoint-invariant image correspondence between Chandrayaan-2 optical imagery (OHRC · TMC-2 · IIRS) and lunar reference frames (LRO NAC · SELENE TC).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](frontend/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](frontend/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](frontend/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](frontend/)
[![FastAPI](https://img.shields.io/badge/FastAPI-3.11-009688?logo=fastapi&logoColor=white)](docs/ARCHITECTURE.md)
[![Celery + Redis](https://img.shields.io/badge/Celery_%2B_Redis-jobs-DC382D?logo=redis&logoColor=white)](docs/ARCHITECTURE.md)
[![PyTorch](https://img.shields.io/badge/PyTorch-learned_matchers-EE4C2C?logo=pytorch&logoColor=white)](docs/TECH_STACK.md)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-metadata-4169E1?logo=postgresql&logoColor=white)](docs/ARCHITECTURE.md)
[![MinIO S3](https://img.shields.io/badge/MinIO-S3_compatible-C00000)](docs/ARCHITECTURE.md)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)

![LunarSync landing hero — source ↔ reference correspondence visual](frontend/public/hero.png)

**The problem.** Almost every lunar-science product — landing-site hazard maps, DEMs, mineral maps, change detection — silently assumes pixel *(x, y)* in a Chandrayaan-2 frame and pixel *(x, y)* in a reference mosaic mean the same spot on the ground. When source and reference differ by up to **300× in ground-sample distance**, were shot at different sun angles (razor-sharp lunar shadows move), and from different viewpoints, that assumption breaks. LunarSync is the system that re-establishes it.

**What it produces** for each source → reference pair:

1. 🖼️ **Registered product** — source warped onto the reference grid
2. 📍 **Match points** — sub-pixel, uniformly distributed correspondences with confidence + inlier flags
3. 📊 **Evaluation report** — RMSE, inlier count/ratio, coverage, timing, and an explicit `reliability` verdict (never a silent bad result)

> **Repo status (honest):** the landing-page frontend and the full system design (`docs/`) exist. The FastAPI backend, CV/ML pipeline, and infra compose files are **specified in `docs/` but not yet scaffolded** (`backend/`, `infra/`, `configs/`, `scripts/` currently hold only `.gitkeep`). This README documents the real design as specified, and clearly marks what is implemented vs. planned.

---

## ✨ Features

### Core product

| Feature | What it does |
|---|---|
| Multi-modal matching | Registers panchromatic OHRC (0.25 m) / TMC-2 (5 m) **and** hyperspectral IIRS (80 m) against LRO NAC / SELENE references |
| Dual matcher strategy | Classical branch (SIFT / ASIFT / AKAZE / RIFT2) for fast equatorial baselines + learned branch (SuperPoint + SuperGlue / LightGlue) for polar & extreme-illumination pairs where every classical method fails |
| Sub-pixel refinement | Correlation-peak / least-squares refinement past the integer grid (a 1-px OHRC error is already ~25 cm on the ground) |
| Uniform spatial selection | Grid-binning / NMS so control points cover the overlap region instead of clustering in one textured corner |
| Honest failure reporting | Low-confidence outputs return `reliability: "low" \| "failed"` with a human-readable reason — never a misleading "clean" result |
| Deep-zoom inspection | OpenSeadragon viewer with match-point / correspondence-line overlays, opacity & checkerboard blend controls |
| Classical-vs-learned compare view | Side-by-side evaluation of matcher choices on the same pair |
| Sensor-pair configs | Per-pair YAML (`ohrc_nac.yaml`, `iirs_wac.yaml`, …) — adding a sensor pair is a config file, not a code fork |

### Engineering / platform

| Feature | What it does |
|---|---|
| Async job system | Slow registrations (seconds on GPU → 10+ min for full-frame classical on CPU) never block HTTP; pollable `PENDING → RUNNING → SUCCEEDED / FAILED` lifecycle with per-stage progress |
| GPU/CPU routing | `gpu-tasks` and `cpu-tasks` Celery queues; learned matchers prefer GPU, auto-fall back to CPU classical pipeline with a user-visible warning |
| Split storage | PostgreSQL for queryable state (jobs, pairs, points, metrics) · MinIO/S3 for pixel blobs (raw, interim, outputs, overlays) · Redis as broker + result backend |
| Typed contracts | FastAPI/Pydantic OpenAPI schema is the source of truth; frontend TypeScript types are generated/checked against it |
| One-command demo | Single `docker compose up` brings up the whole stack; GPU worker is a compose override |
| Reproducible science | Standalone pipeline CLI (`run_single_pair.py`) + stratified benchmark CLI (`run_benchmark.py`) + synthetic ground-truth generator, independent of the web stack |

---

## 🏗️ Architecture

Web UI + async job-processing system. The API tier never runs CV code; the worker tier never speaks HTTP.

```mermaid
graph TD
    subgraph Client["Client"]
        Browser["Browser"]
    end

    subgraph Frontend["Frontend tier"]
        NextJS["Next.js 16 + TypeScript<br/>SSR pages + API proxy routes<br/>upload UX · deep-zoom viewer · dashboards"]
    end

    subgraph API["API tier"]
        FastAPI["FastAPI (Python 3.11)<br/>validation · job orchestration · result serving"]
    end

    subgraph Async["Async tier"]
        Redis[("Redis<br/>Celery broker + result backend")]
        WorkerCPU["Celery worker — CPU<br/>classical pipeline<br/>SIFT / ASIFT / AKAZE / RIFT2"]
        WorkerGPU["Celery worker — GPU<br/>learned pipeline<br/>SuperPoint + SuperGlue / LightGlue"]
    end

    subgraph Data["Data tier"]
        Postgres[("PostgreSQL<br/>jobs · image pairs · match points · metrics")]
        MinIO[("MinIO / S3<br/>raw + interim + output images")]
    end

    Browser <--> NextJS
    NextJS <--> FastAPI
    FastAPI <--> Postgres
    FastAPI --> Redis
    Redis --> WorkerCPU
    Redis --> WorkerGPU
    WorkerCPU <--> Postgres
    WorkerCPU <--> MinIO
    WorkerGPU <--> Postgres
    WorkerGPU <--> MinIO
    FastAPI <--> MinIO
```

> There is **no Temporal** in this system — durability/async execution is Celery + Redis by design (see `docs/ARCHITECTURE.md`). There is no `packages/` shared-TypeScript workspace; frontend/backend stay in sync via the exported OpenAPI schema (`docs/api/openapi.json`, planned).

### Component responsibilities

| Component | Owns | Does NOT own |
|---|---|---|
| Next.js frontend | Upload UX, deep-zoom viewing, overlay rendering, metric dashboards, job polling | Any image processing or match-validity logic |
| FastAPI | Pydantic validation, job creation, enqueueing, result serving, presigned URLs | Feature extraction, RANSAC, warping |
| Celery workers | Entire `backend/pipeline/` (preprocess → match → register → evaluate → visualize) | HTTP concerns |
| PostgreSQL | Job state, pair metadata, match points, metrics, transforms | Pixel data |
| MinIO / S3 | Raw / interim / output / overlay images | Anything queryable |
| Redis | Broker + result backend + status pub/sub | Durable state (Postgres is source of truth) |

---

## 🔄 How It Works

### User flow

```mermaid
flowchart TD
    U["User (browser)"] --> FE["Next.js: upload source + reference + metadata"]
    FE --> API1["FastAPI: POST /uploads → store raw in MinIO, row in Postgres"]
    API1 --> FE2["returns imagePairId"]
    FE2 --> U2["User clicks Register (matcher + transform config)"]
    U2 --> API2["FastAPI: POST /jobs → PENDING row + enqueue task"]
    API2 --> W["Worker: run CV pipeline, stream stage progress"]
    W --> DB["Postgres: match points, transform, metrics · MinIO: outputs"]
    DB --> FE3["Frontend polls GET /jobs/id → SUCCEEDED"]
    FE3 --> R["GET /jobs/id/result → viewer + overlays + metrics"]
```

### Request / job lifecycle (sequence)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as Next.js
    participant API as FastAPI
    participant Q as Redis/Celery
    participant W as Worker (pipeline/)
    participant DB as Postgres
    participant S as MinIO

    U->>FE: Upload source + reference + metadata
    FE->>API: POST /uploads (multipart)
    API->>S: Store raw images
    API->>DB: Insert ImagePair row
    API-->>FE: { imagePairId }

    U->>FE: Click "Register"
    FE->>API: POST /jobs { imagePairId, config }
    API->>DB: Insert Job (status=PENDING)
    API->>Q: enqueue registration_task(jobId)
    API-->>FE: { jobId }

    FE->>API: GET /jobs/{jobId} (poll every ~2s)
    API->>DB: read status
    API-->>FE: { status: RUNNING, stage: "feature_extraction" }

    Q->>W: deliver task
    W->>S: fetch raw images
    W->>W: run pipeline (ingest → evaluate → visualize)
    W->>DB: update stage progress
    W->>S: write registered image + overlays
    W->>DB: write match points, transform, metrics
    W->>DB: update Job (status=SUCCEEDED)

    FE->>API: GET /jobs/{jobId} (poll)
    API-->>FE: { status: SUCCEEDED }
    FE->>API: GET /jobs/{jobId}/result
    API->>DB: fetch match points + metrics
    API->>S: presigned URLs for images
    API-->>FE: full result payload
    FE->>U: render viewer + overlay + metrics
```

Polling (not WebSockets) is the documented MVP choice: simpler to debug at hackathon scale; stage timestamps already stored on the `Job` row make an SSE/WebSocket upgrade purely additive later.

### CV pipeline flow

Each box below maps to a real `backend/pipeline/` stage from `docs/PROJECT_STRUCTURE.md` §3. The pipeline is framework-agnostic (file paths/arrays in, structured objects out) so it runs identically inside a Celery worker or standalone via `scripts/run_single_pair.py`.

```mermaid
flowchart TD
    SRC["SOURCE IMAGE<br/>OHRC 0.25 m · TMC-2 5 m · IIRS 80 m<br/>moving frame"]:::src
    REF["REFERENCE IMAGE<br/>LRO NAC · SELENE TC<br/>fixed frame"]:::ref
    CFG2["PIPELINE CONFIG<br/>configs/sensor_pairs/{src}_{ref}.yaml<br/>+ pipeline_defaults.yaml<br/>API overrides win"]:::cfg

    SRC --> ING
    REF --> ING
    CFG2 -.-> ING
    CFG2 -.-> PRE
    CFG2 -.-> FEAT

    subgraph ING_BOX["1 · Ingestion — pipeline/ingestion/"]
        ING["Readers + metadata<br/>PDS3/PDS4 + GeoTIFF via rasterio/GDAL<br/>extract sun az/el · GSD · projection"]
    end

    subgraph PRE_BOX["2 · Preprocessing — pipeline/preprocessing/"]
        GEO["Georeference check<br/>reproject to common frame"]
        RS["GSD resampling<br/>resample source toward reference GSD"]
        NORM["8-bit intensity normalization"]
        ENH["Sensor-pair enhancement<br/>OHRC↔NAC: CLAHE + inversion + dilation + PCA<br/>IIRS↔WAC: hist-match + shadow-norm + log"]
        GEO --> RS --> NORM --> ENH
    end

    subgraph ROI_BOX["3 · Overlap — pipeline/overlap/"]
        ROI["ROI estimation<br/>footprint-based overlap detection<br/>crop to shared coverage"]
    end

    subgraph FEAT_BOX["4 · Features + Matching — pipeline/features/ + pipeline/matching/"]
        direction LR
        CLASSIC["CLASSICAL BRANCH (CPU)<br/>SIFT / ASIFT / AKAZE detectors<br/>ratio test + mutual-NN matching"]
        RIFT["RIFT2 BRANCH (CPU)<br/>phase-congruency detection<br/>Maximum Index Map descriptor"]
        LEARNED["LEARNED BRANCH (GPU)<br/>SuperPoint detect<br/>SuperGlue / LightGlue GNN match"]
    end

    subgraph REG_BOX["5 · Registration — pipeline/registration/"]
        OUTL["Outlier rejection<br/>RANSAC / MAGSAC"]
        XF["Transform estimation<br/>similarity / affine / homography / polynomial"]
        SUBP["Sub-pixel refinement<br/>correlation peak-fit / least-squares"]
        UNI["Uniform selection<br/>grid binning / NMS spatial spread"]
        OUTL --> XF --> SUBP --> UNI
    end

    subgraph OUT_BOX["6 · Product + Evaluation — warp / evaluation / visualization"]
        WARP2["Warp + resample<br/>registered product image"]
        METR["Metrics<br/>RMSE (held-out points) · inlier count/ratio<br/>coverage · MAE · timing"]
        VIS["Visualization<br/>match-line overlay · checkerboard blend"]
        REP["Reliability verdict<br/>high / medium / low / failed + reason"]
        WARP2 --> METR --> VIS --> REP
    end

    ING --> PRE_BOX
    PRE_BOX --> ROI_BOX
    ROI_BOX --> FEAT_BOX
    FEAT_BOX --> REG_BOX
    REG_BOX --> OUT_BOX

    OUT_BOX --> PROD[("MinIO<br/>registered image<br/>overlays · checkerboards")]
    OUT_BOX --> META[("PostgreSQL<br/>match points · transform<br/>evaluation report")]

    classDef src fill:#0f766e,stroke:#5eead4,color:#fff
    classDef ref fill:#7c3aed,stroke:#c4b5fd,color:#fff
    classDef cfg fill:#334155,stroke:#94a3b8,color:#fff
```

The classical preprocessing recipes (e.g. CLAHE + inversion + dilation + PCA for OHRC↔NAC; histogram matching + shadow normalization + log transform for IIRS↔WAC) and the "resample toward the reference GSD before matching" rule come from ISRO/SAC-affiliated benchmarking on this exact dataset family (`docs/PROJECT_OVERVIEW.md` §12.1). Key empirical result driving the dual-branch design: SuperGlue had the lowest RMSE on **every** tested pair and was the **only** method that registered the polar/extreme-illumination pair at all.

### Frontend ↔ backend flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js (proxy route)
    participant F as FastAPI

    B->>N: POST /api/proxy/uploads (multipart)
    N->>F: POST /uploads (API key stays server-side)
    F-->>N: { imagePairId }
    N-->>B: { imagePairId }
    B->>N: POST /api/proxy/jobs
    N->>F: POST /jobs
    F-->>N: { jobId }
    N-->>B: { jobId }
    B->>N: GET /api/proxy/jobs/{id} (TanStack Query poll)
    N->>F: GET /jobs/{id}
    F-->>N: status payload
    N-->>B: status payload
```

### Data / persistence flow

```mermaid
flowchart TD
    API["FastAPI routes<br/>uploads · jobs · results"] --> PG[("Postgres<br/>ImagePair · Job · MatchPoint<br/>Transform · EvaluationReport")]
    API --> OB[("MinIO<br/>raw / interim / outputs")]
    W["Celery worker<br/>run_pipeline.py"] --> PG
    W --> OB
    CFG["configs/sensor_pairs/*.yaml<br/>+ pipeline_defaults.yaml"] --> W
```

### Data model

```mermaid
erDiagram
    IMAGE_PAIR ||--o{ JOB : "registered by"
    JOB ||--o{ MATCH_POINT : produces
    JOB ||--|| TRANSFORM : produces
    JOB ||--|| EVALUATION_REPORT : produces

    IMAGE_PAIR {
        uuid id PK
        string source_sensor
        string reference_sensor
        string source_storage_key
        string reference_storage_key
        float source_gsd_m
        float reference_gsd_m
        float source_sun_azimuth_deg
        float source_sun_elevation_deg
        float reference_sun_azimuth_deg
        float reference_sun_elevation_deg
        string projection
        timestamp created_at
    }

    JOB {
        uuid id PK
        uuid image_pair_id FK
        string status
        string current_stage
        string matcher_type
        string transform_model
        string error_message
        timestamp started_at
        timestamp completed_at
    }

    MATCH_POINT {
        uuid id PK
        uuid job_id FK
        float src_x
        float src_y
        float ref_x
        float ref_y
        float confidence
        boolean is_inlier
    }

    TRANSFORM {
        uuid job_id PK
        string model_type
        json parameters
    }

    EVALUATION_REPORT {
        uuid job_id PK
        float rmse_x
        float rmse_y
        int inlier_count
        float inlier_ratio
        float coverage_score
        float processing_time_s
        string reliability
    }
```

Queryable state (above) lives in PostgreSQL; pixel blobs (raw / interim / registered / overlays) live in MinIO. Full field-level discussion: `docs/ARCHITECTURE.md` §5.

---

## 🧠 Matcher System (no autonomous agents)

LunarSync has **no LLM/agent framework** — "agentic" here means the pipeline's matcher-selection and fallback logic, not AI agents. The decision flow:

```mermaid
flowchart TD
    CFG["JOB CONFIG<br/>matcher_type + transform_model<br/>API overrides > sensor-pair YAML > defaults"] --> ROUTE{"Matcher requested?"}

    ROUTE -->|superglue / lightglue<br/>GPU available| QGPU["Enqueue → gpu-tasks queue<br/>Celery + Redis"]
    ROUTE -->|sift / asift / akaze / rift2<br/>or no GPU| QCPU["Enqueue → cpu-tasks queue<br/>Celery + Redis"]

    subgraph GPUW["GPU worker — learned pipeline"]
        DET["SuperPoint detection<br/>learned keypoints + descriptors"]
        GNN["SuperGlue / LightGlue<br/>self + cross attention<br/>optimal-transport assignment"]
        DET --> GNN
    end

    subgraph CPUW["CPU worker — classical pipeline"]
        CDET["Classical detection<br/>SIFT / ASIFT / AKAZE<br/>RIFT2 phase-congruency"]
        CMAT["Classical matching<br/>Lowe ratio test<br/>mutual nearest neighbor"]
        CDET --> CMAT
    end

    QGPU --> GPUW
    QCPU --> CPUW

    GPUW --> FALLBACK{"GPU task failed<br/>or no GPU worker online?"}
    FALLBACK -->|yes — warn user| CPUW
    FALLBACK -->|no| TAIL

    CPUW --> TAIL

    subgraph TAILBOX["Shared tail — both branches converge"]
        TAIL["RANSAC / MAGSAC<br/>outlier rejection"]
        XF2["Transform fit<br/>similarity / affine / homography"]
        SP2["Sub-pixel refinement<br/>+ uniform grid selection"]
        W2["Warp → evaluate<br/>RMSE · inlier ratio · coverage"]
        TAIL --> XF2 --> SP2 --> W2
    end

    W2 --> VERDICT{"Quality gates pass?<br/>inliers · RMSE · coverage"}
    VERDICT -->|yes| OK["SUCCEEDED<br/>reliability = high / medium"]
    VERDICT -->|no| HONEST["SUCCEEDED with<br/>reliability = low / failed<br/>+ human-readable reason"]
```

API-level overrides win over the sensor-pair YAML, which wins over hardcoded pipeline defaults. All worker writes are keyed on `job_id` with upsert semantics so crashed tasks (e.g. OOM on a full-frame OHRC image) are safely retryable.

---

## 📦 Monorepo Structure

Actual top level (verified):

```text
LunarSync/
├── frontend/            # Next.js 16 + React 19 + TypeScript (landing page implemented)
├── backend/             # FastAPI + Celery + pipeline (SPECIFIED in docs/, .gitkeep only for now)
├── infra/               # Docker / compose / Nginx / k8s (SPECIFIED, .gitkeep only for now)
├── docs/                # Product + system design (the real source of truth today)
├── configs/             # Per-sensor-pair pipeline YAML (SPECIFIED, .gitkeep only for now)
├── data/                # raw/ interim/ ground_truth/ samples/ (SPECIFIED, .gitkeep only for now)
├── scripts/             # fetch-models / run_single_pair / benchmark (SPECIFIED, .gitkeep only)
├── .github/workflows/   # CI (placeholder)
├── docker-compose.yml   # Thin wrapper: includes infra/compose/docker-compose.dev.yml
├── Makefile             # dev / dev-gpu / down / test / lint / benchmark / fetch-models
├── .env.example         # Shared env template
└── README.md            # This file
```

---

## 🛠️ Tech Stack

Verified against `frontend/package.json`, `.nvmrc`, `.python-version`, `Makefile`, `.env.example`, and `docs/TECH_STACK.md`. (Only the frontend half is installed today; the Python half is the documented choice.)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | Next.js 16.3.4 (App Router) + React 19 + TypeScript 5 | Web app, SSR pages, API proxy routes |
| Styling / components | Tailwind CSS v4 + shadcn/ui + Base UI + Radix primitives | Image-heavy UI without hand-rolled CSS |
| Motion / icons | `motion`, `lucide-react` | Animation, iconography |
| Client server-state | TanStack Query *(planned)* | Job-status polling, caching, retries |
| Client UI-state | Zustand 5 | Selected pair, tabs, overlay/viewer state |
| Upload | react-dropzone *(planned)* | Drag-and-drop GeoTIFF/PDS uploads |
| Large-image viewer | OpenSeadragon *(planned)* | Tile-rendered deep zoom for 10k+ px OHRC frames |
| Overlay drawing | react-konva / Canvas *(planned)* | Match points + correspondence lines |
| Charts | Recharts *(planned)* | RMSE / inlier / coverage visuals |
| Backend API | FastAPI + Pydantic v2 + Uvicorn *(planned)* | Validation, orchestration, OpenAPI contract |
| Async jobs | Celery + Redis *(planned)* | Non-blocking registrations, broker + result backend |
| Classical CV | OpenCV *(planned)* | SIFT/AKAZE/ORB, `findHomography`, warping |
| Learned matching | PyTorch + LightGlue (primary) / SuperGlue (benchmark) *(planned)* | Robust matching incl. polar/extreme-shadow pairs |
| Geo I/O | GDAL / rasterio *(planned)* | PDS/GeoTIFF reading, reprojection, resampling |
| Preprocessing | scikit-image, NumPy/SciPy *(planned)* | CLAHE, histogram matching, peak fitting |
| Relational DB | PostgreSQL + SQLAlchemy + Alembic *(planned)* | Jobs, pairs, points, metrics |
| Object storage | MinIO (S3-compatible) *(planned)* | Image blobs; swap to AWS S3 with no code change |
| Containers | Docker + Docker Compose | One-command local/demo environment |
| Proxy | Nginx *(planned)* | `/api/*` → FastAPI, rest → Next.js |
| GPU | NVIDIA CUDA worker image + CPU-only fallback *(planned)* | Learned inference with graceful fallback |
| Package managers | Bun 1.3.6 (frontend), Python 3.11 + Node 20 | Per `.nvmrc`, `.python-version`, `packageManager` |
| CI | GitHub Actions *(placeholder)* | Lint, type-check, tests |
| Testing | Vitest + RTL, Playwright, pytest, ruff + mypy, ESLint + `tsc --noEmit` *(planned)* | Unit, e2e, pipeline, lint, types |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Bun | 1.3.6 | Frontend package manager (`packageManager` field) |
| Node | 20 | See `.nvmrc` |
| Python | 3.11 | See `.python-version` (backend, when scaffolded) |
| Docker + Docker Compose | recent | Full-stack demo (`make dev`) |
| NVIDIA GPU + container toolkit | optional | Only for the learned-matcher worker; CPU fallback works without it |

### 1. Clone

```bash
git clone <repo-url> LunarSync
cd LunarSync
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in local values (MinIO credentials at minimum). The template already carries sane local defaults (`localhost:5432`, `localhost:6379`, `localhost:9000`, `NEXT_PUBLIC_API_URL=http://localhost:8000`, `MODEL_DEVICE=cpu`).

### 3. Run the frontend (works today)

```bash
cd frontend
bun install
bun dev        # http://localhost:3000
```

### 4. Run the full stack (once backend/infra land)

```bash
# CPU-only demo (all services: Next.js, FastAPI, CPU worker, Redis, Postgres, MinIO)
make dev            # == docker compose up --build

# With NVIDIA GPU worker for the learned pipeline
make dev-gpu        # == docker compose -f docker-compose.yml -f infra/compose/docker-compose.gpu.yml up --build

# Tear down (including volumes)
make down
```

Pretrained weights (SuperPoint/SuperGlue/LightGlue → `backend/models/`, gitignored) will be fetchable via:

```bash
make fetch-models   # bash scripts/fetch_pretrained_models.sh
```

### 5. Access (planned ports)

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend API (FastAPI + OpenAPI docs) | http://localhost:8000 (`/docs`) |
| MinIO console | http://localhost:9001 |
| PostgreSQL / Redis | localhost:5432 / localhost:6379 |

> Ports above are the documented local-dev convention (`NEXT_PUBLIC_API_URL=http://localhost:8000`, standard Postgres/Redis/MinIO ports). Treat `infra/compose/*.yml` as authoritative once those files land.

---

## ⚙️ Configuration

Root/shared variables only (source of truth: `.env.example`). Service-specific overrides will live next to their compose files.

| Variable | Required | Used by | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | FastAPI, workers | SQLAlchemy URL, e.g. `postgresql+psycopg://lunarsync:lunarsync@localhost:5432/lunarsync` |
| `REDIS_URL` | Yes | FastAPI, workers | Celery broker + result backend, e.g. `redis://localhost:6379/0` |
| `MINIO_ENDPOINT` | Yes | FastAPI, workers | Object storage endpoint (`localhost:9000` locally) |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Yes | MinIO | Local dev credentials — change from defaults |
| `MINIO_BUCKET` | Yes | FastAPI, workers | Bucket for raw/interim/output images (`lunarsync`) |
| `MINIO_SECURE` | No | FastAPI, workers | `false` locally, `true` against TLS S3 endpoints |
| `NEXT_PUBLIC_API_URL` | Yes | Frontend | Browser-reachable FastAPI base URL |
| `MODEL_DEVICE` | No | GPU worker | `cuda` \| `cpu` — worker auto-falls back to the CPU classical pipeline without a GPU |
| `DATA_DIR` | No | Pipeline/scripts | Local dataset root (`./data`) |
| `MODELS_DIR` | No | Workers/scripts | Pretrained weights dir (`./backend/models`) |

Never commit `.env`. Large uploads should use presigned MinIO URLs (browser → storage directly) rather than proxying multi-GB files through FastAPI; workers use windowed/tiled `rasterio` reads instead of loading full OHRC frames into memory.

---

## 🧑‍💻 Development

Authoritative commands: `Makefile` + `frontend/package.json` scripts.

```bash
# Full stack
make dev / make dev-gpu / make down

# Frontend
cd frontend
bun dev          # hot-reload dev server
bun run build    # production build
bun start        # serve production build
bunx eslint .    # lint  (Makefile `lint` target wraps: eslint + tsc --noEmit)
bunx tsc --noEmit

# Backend (once scaffolded)
cd backend && python -m pytest tests/ -q
ruff check . && ruff format --check . && mypy .

# One-shot entry points (planned)
make test lint benchmark fetch-models
python scripts/run_single_pair.py      # pipeline without the web stack
python scripts/run_benchmark.py        # stratified benchmark across test pairs
```

Conventions: `backend/pipeline/` must stay framework-agnostic (no FastAPI/Celery imports — paths/arrays in, structured objects out) so it remains unit-testable and runnable via the CLI. Prettier (`semi: true`, `printWidth: 100`, 2-space) governs formatting at root.

---

## 🔌 API

Thin, job-oriented REST surface (FastAPI; full table in `docs/ARCHITECTURE.md` §4):

| Endpoint | Method | Purpose |
|---|---|---|
| `/uploads` | POST | Upload source/reference + metadata → `imagePairId` |
| `/image-pairs/{id}` | GET | Pair metadata (sensor, sun angles, GSD, projection) |
| `/jobs` | POST | Start registration (matcher + transform config) → `jobId` |
| `/jobs` | GET | Paginated job history |
| `/jobs/{id}` | GET | Poll `PENDING \| RUNNING \| SUCCEEDED \| FAILED` + current stage |
| `/jobs/{id}/result` | GET | Match points + transform + report + presigned image URLs |
| `/jobs/{id}/matches` | GET | Match points only (overlay renderer) |
| `/jobs/{id}/report` | GET | Evaluation report only (RMSE, inlier ratio, coverage, timing) |
| `/health` | GET | Liveness/readiness probe |

Contracts are Pydantic models (`backend/app/schemas/`, planned); the exported OpenAPI schema (`docs/api/openapi.json`, planned) is what frontend TypeScript types are checked against. Detailed endpoint docs belong with the backend once scaffolded — this section intentionally stays high-level.

---

## 🖥️ Frontend

Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/Base UI + Zustand. Role in the architecture: **upload UX, job orchestration calls (via server-side proxy routes that keep secrets off the client), deep-zoom result inspection, metric dashboards** — zero CV logic. Long jobs are polled with TanStack Query (`useJobStatus`); UI-only state (selected pair, overlay opacity, active tab) lives in a Zustand store.

**Today:** the implemented surface is the marketing/landing experience (`frontend/app/page.tsx` → `components/landing/*`: hero, problem, sensors, approach, pipeline, alignment, metrics, deliverables, architecture, impact). The app surfaces from the spec — `app/jobs/`, `app/compare/`, `components/viewer/` (OpenSeadragon + canvas overlays), `components/metrics/`, `hooks/`, `lib/api-client.ts` — are the next build slice; see `docs/PROJECT_STRUCTURE.md` §2 for the target tree.

---

## ⚙️ Backend & Workers

FastAPI owns HTTP; Celery workers own pixels; `backend/pipeline/` owns the science and knows about neither.

Planned layout (`docs/PROJECT_STRUCTURE.md` §3): `app/` (routes, Pydantic schemas, `core/config.py`, SQLAlchemy models + Alembic migrations, MinIO wrapper, `registration_task.py`) plus `pipeline/` stages — `ingestion` (PDS/GeoTIFF via rasterio/GDAL) → `preprocessing` (georeference, GSD resampling, normalization, CLAHE/shadow-norm) → `overlap` (ROI estimation) → `features` (classical / RIFT2 / learned) → `matching` → `registration` (RANSAC/MAGSAC, transform fit, warp) → `refinement` (sub-pixel) → `selection` (uniform distribution) → `evaluation` (RMSE, inlier ratio, coverage, timing) → `visualization` (match overlays, checkerboards) — orchestrated by `run_pipeline.py`.

GPU vs CPU routing, presigned-URL large-file handling, config-precedence (API override > sensor-pair YAML > defaults), idempotent `job_id`-keyed writes, and per-stage `Job` timestamps for progress + timing breakdowns are all specified in `docs/ARCHITECTURE.md` §6.

---

## 🏗️ Infrastructure

Planned single-host MVP (`infra/compose/docker-compose.dev.yml`): one `docker compose up` for Nginx → Next.js + FastAPI → Redis → CPU worker (+ optional GPU worker override) → Postgres + MinIO. The GPU worker is a compose override (`docker-compose.gpu.yml`), omitted on machines without NVIDIA hardware. Production (`docker-compose.prod.yml`: Gunicorn-backed API, Prod builds) and multi-host/k8s (`infra/k8s/`) reuse the same images with env-injected config — k8s is an explicit stretch goal, not MVP.

```mermaid
graph TD
    subgraph Host["Single host — docker compose (MVP)"]
        Nginx["Nginx<br/>/api/* → FastAPI<br/>/* → Next.js"]
        FE["Next.js"]
        API["FastAPI (Uvicorn/Gunicorn)"]
        WCU["Worker CPU"]
        WGPU["Worker GPU (optional override)"]
        R[("Redis")]
        P[("Postgres")]
        M[("MinIO")]
        Nginx --> FE
        Nginx --> API
        API --> R
        API --> P
        API --> M
        R --> WCU
        R --> WGPU
        WCU --> P
        WCU --> M
        WGPU --> P
        WGPU --> M
    end
```

CI (`.github/workflows/`, placeholder) will run frontend lint/type-check/tests and backend `ruff`/`mypy`/`pytest` per the `Makefile` targets.

---

## 📚 Documentation

| I want to… | Read |
|---|---|
| Understand the problem & domain (sensors, sun/scale/viewpoint invariance, benchmarks) | `docs/PROJECT_OVERVIEW.md` |
| Understand the system (flows, API surface, data model, deployment, non-goals) | `docs/ARCHITECTURE.md` |
| See the target repo/file layout | `docs/PROJECT_STRUCTURE.md` |
| See exact dependency choices & rationale | `docs/TECH_STACK.md` |
| Work on the frontend | `frontend/` (+ `frontend/AGENTS.md`, `CLAUDE.md` for agent rules) |
| Work on the backend/pipeline | `docs/ARCHITECTURE.md` §§3–6, then `backend/` once scaffolded |
| Run the whole thing locally | This README → Quick Start; then `Makefile` |

---

## 🧪 Testing

Planned strategy (`docs/TECH_STACK.md` §7, `Makefile`):

| Scope | Tool | Command |
|---|---|---|
| Frontend unit/components | Vitest + React Testing Library | `make test` (frontend slice) |
| End-to-end (upload → view → download) | Playwright | per `frontend/tests/e2e/` (planned) |
| Pipeline unit/integration (incl. synthetic pairs) | pytest + fixtures | `cd backend && python -m pytest tests/ -q` |
| Python lint/format/types | ruff + mypy | `ruff check . && ruff format --check . && mypy .` |
| TS lint/types | ESLint + `tsc --noEmit` | `cd frontend && bunx eslint . && bunx tsc --noEmit` |
| Registration quality benchmark | `scripts/run_benchmark.py` | `make benchmark` |

Evaluation discipline (from the problem analysis): RMSE must be computed on **held-out check points**, never just the points the transform was fit on — otherwise the numbers are flattering fiction. `data/samples/` (small committed crops) keeps CI light; full frames stay gitignored under `data/raw/`.

---

## 🚢 Deployment

1. **Build** — Docker images per service (`frontend/Dockerfile`, `backend/Dockerfile`, `Dockerfile.worker[.cpu]`); same images run in compose and k8s.
2. **Configure** — environment only (`.env` / secrets manager); no per-environment code changes. Swap MinIO → AWS S3 by changing endpoint/credentials.
3. **Run (MVP)** — single host, `docker compose up`; GPU worker added via override file.
4. **Data** — Postgres (jobs/points/metrics) + object storage (images) + Redis (ephemeral queue state only).
5. **Scale (post-MVP)** — fixed worker pool first; queue-depth autoscaling and k8s manifests are documented stretch goals.

---

## 🔐 Security

Only practices actually specified are claimed: multipart uploads validated by Pydantic schemas before any work is enqueued; the Next.js API-proxy route pattern keeps backend keys server-side; secrets live exclusively in `.env` (never committed — `.gitignore` covers it); large files travel via short-lived presigned MinIO URLs instead of through the API process. Not yet in scope by design: multi-tenant auth/isolation (the route layer is structured so an auth dependency can be added in `backend/app/api/deps.py` without restructuring), rate limiting, and exactly-once delivery (at-least-once Celery + idempotent writes is the documented sufficiency call).

---

## 🤝 Contributing

1. Read `docs/PROJECT_OVERVIEW.md` (problem), `docs/ARCHITECTURE.md` (system), `docs/PROJECT_STRUCTURE.md` (where code goes).
2. Keep `backend/pipeline/` free of web-framework imports; add sensor pairs as `configs/sensor_pairs/*.yaml`, not code branches.
3. Match the existing tooling: Prettier + ESLint + `tsc` (frontend), ruff + mypy + pytest (backend).
4. Add/extend tests with behavior changes; report RMSE on held-out points.
5. Open a PR — CI (lint, type-check, tests) must pass.

---

## 📄 License

MIT — see [LICENSE](LICENSE). © 2026 LunarSync Contributors.
