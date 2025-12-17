import { getProjects, signOut } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Terminal, FolderGit2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { CreateProjectCard } from "@/components/create-project-card";

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
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
              >
                <Link href={`/project/${project.id}`}>
                  <div className="h-full min-h-[200px] bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(100,255,218,0.1)] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FolderGit2 size={64} />
                    </div>

                    <div className="space-y-2 z-10">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {project.id.slice(0, 8)}...
                      </p>
                    </div>

                    <div className="z-10 pt-8 flex justify-between items-end">
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.createdAt!).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        OPEN PROJECT &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
