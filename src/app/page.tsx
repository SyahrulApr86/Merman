import { getProjects, signOut } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Terminal, FolderGit2 } from "lucide-react";
import { CreateProjectCard } from "@/components/create-project-card";
import { ProjectCard } from "@/components/project-card";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-border pb-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tighter text-primary">
              MERMAN<span className="text-foreground">_IDE</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Logged in as <span className="text-accent">@{session.user.username}</span>
            </p>
          </div>
          <form action={signOut}>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-destructive transition-colors px-4 py-2 rounded-md hover:bg-white/5">
              <LogOut size={16} />
              LOGOUT
            </button>
          </form>
        </header>

        {/* Projects Grid */}
        <main>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <Terminal className="text-primary" />
              Active Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Project Card */}
            <CreateProjectCard />

            {/* Project List */}
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
