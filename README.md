# 🧜‍♂️ Merman IDE

**Merman** is a modern, full-stack web-based IDE designed for creating, editing, and managing Diagrams as Code (Mermaid.js, PlantUML). It offers a VS Code-like experience with real-time previews, version history, and robust project management.

## Key Features

*   **Multi-Language Support**: First-class support for **Mermaid.js** and **PlantUML**.
*   **Live Preview**: Real-time rendering with instant feedback.
*   **Smart Editor**: Monaco Editor integration with syntax highlighting.
*   **Project Management**: File system-based project structure.
*   **Version Control**: Built-in history handling with diff views and rollback.
*   **Export Options**: High-quality export to **SVG**, **PNG** (Transparent), and PDF.

---

## Technology Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database**: PostgreSQL 15
*   **ORM**: Drizzle ORM
*   **Storage**: MinIO (S3 Compatible)
*   **Cache/Realtime**: Redis & Socket.IO
*   **Rendering**: Mermaid (Client-side) & PlantUML (Server-side/Docker)

---

## Development Setup

Follow these steps to get the project running efficiently on your local machine.

### 1. Prerequisites
*   Node.js 20+
*   Docker & Docker Compose

### 2. Clone & Install
```bash
git clone https://github.com/SyahrulApr86/Merman.git
cd Merman
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure it (the defaults work out-of-the-box for Docker infra).

```bash
cp .env.example .env
```

### 4. Start Infrastructure
We use Docker to run the supporting services (Postgres, Redis, MinIO, PlantUML Server).

```bash
# Starts DB, Redis, MinIO, and PlantUML
npm run infra:up
```
> **Note:** Wait a few seconds for all containers to be healthy.

### 5. Database Setup
Merman uses **Drizzle ORM**. You need to generate the migration files and push the schema to your local database.

```bash
# 1. Generate SQL migration files (Important: Commit these files!)
npm run db:generate

# 2. Push schema changes to your local running PostgreSQL
npm run db:push
```

### 6. Run the Application
Run the Next.js frontend and the WebSocket server concurrently:

```bash
npm run dev:all
```
*   **App**: [http://localhost:3000](http://localhost:3000)
*   **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `merman`, Pass: `merman_minio_password`)
*   **PlantUML Server**: [http://localhost:8080](http://localhost:8080)

---

## Database Migration Workflow

We use a strict migration workflow ensuring consistency between Local and Production.

### When you modify `src/db/schema.ts`:

1.  **Generate Migration**:
    ```bash
    npm run db:generate
    ```
    *This creates a new SQL file in the `drizzle/` folder.*

2.  **Test Locally**:
    ```bash
    npm run db:push
    ```

3.  **Commit**:
    **You MUST commit the `drizzle/` folder.** The production deployment relies on these files to auto-migrate.

---

## Deployment (Production)

The project is configured with a complete CI/CD pipeline using **GitHub Actions** and **GitHub Container Registry (GHCR)**.

### File Structure
*   `docker-compose.yml` → **Production Configuration**. Uses pre-built images from GHCR.
*   `docker-compose.dev.yml` → **Build Configuration**. Builds images locally from source.

### Deploying to VPS
1.  Ensure you have set the required **Secrets** in your GitHub Repo (`VPS_HOST`, `VPS_SSH_KEY`, `GHCR_READ_TOKEN`, etc.).
2.  Push to the `main` branch.
3.  The Action will build the image, push to GHCR, SSH into your VPS, and update the containers.

---

## Project Structure

```bash
src/
├── app/             # Next.js App Router Pages & API
├── components/      # React Components
│   ├── editor/      # Monaco Editor & Logic
│   └── preview/     # Diagram Renderers (Mermaid/PlantUML)
├── db/              # Drizzle Schema & Config
├── lib/             # Utilities (Auth, S3, Redis)
├── store/           # Zustand State Stores
└── types/           # TS Interfaces
scripts/             # Maintenance scripts (migrations, etc)
```

---

Built with ❤️ by [SyahrulApr86](https://github.com/SyahrulApr86)
