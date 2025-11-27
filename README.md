# Merman IDE

Merman is a full-stack web-based IDE for creating, editing, and managing Mermaid.js diagrams. It features a VS Code-like interface with real-time preview, project-based file management, and export capabilities.

## Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Editor**: Monaco Editor
- **Rendering**: Mermaid.js
- **State Management**: Zustand
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (Jose), Bcryptjs


## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Ensure `.env` contains the correct database credentials. Default configuration for Docker:
   ```env
   DATABASE_URL="postgres://merman:merman_password@localhost:5439/merman"
   ```

3. **Start the Database**
   Run the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

4. **Database Migration**
   Push the schema to the database:
   ```bash
   npx drizzle-kit push
   ```

## Running the Application

Start the development server:

```bash
npm run dev
```

Access the application at `http://localhost:3000`.

## Features

- **Live Editor**: Split-pane view with Monaco Editor and real-time Mermaid preview.
- **File System**: Virtual file system stored in PostgreSQL with support for files and folders.
- **Authentication**: User registration and login system.
- **Export**: Export diagrams to SVG, PNG, and PDF formats.
- **Theming**: Custom "Abyssal" dark theme optimized for long coding sessions.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: React components (Editor, Preview, Layout).
- `src/db`: Drizzle ORM schema and client configuration.
- `src/lib`: Utility functions and authentication logic.
- `src/store`: Zustand state management stores.
