import { getProjectFiles } from "@/app/actions";
import { ProjectInitializer } from "@/components/project-initializer";
import { MainLayout } from "@/components/layout/main-layout";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;
    const files = await getProjectFiles(id);

    return (
        <>
            <ProjectInitializer files={files} />
            <MainLayout />
        </>
    );
}
