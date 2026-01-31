import fs from 'fs/promises';
import path from 'path';
import { Project, ProjectContext, BlogPost } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

async function ensureProjectDir(projectId: string) {
    const dir = path.join(DATA_DIR, projectId);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
    return dir;
}

// --- Project Registry ---

export async function getProjects(): Promise<Project[]> {
    await ensureDataDir();
    const projectsFile = path.join(DATA_DIR, 'projects.json');
    try {
        const data = await fs.readFile(projectsFile, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function saveProject(project: Project): Promise<void> {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
        projects[index] = project;
    } else {
        projects.push(project);
    }
    await fs.writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
    await ensureProjectDir(project.id);
}

// --- Context ---

export async function getProjectContext(projectId: string): Promise<ProjectContext | null> {
    const dir = await ensureProjectDir(projectId);
    try {
        const data = await fs.readFile(path.join(dir, 'context.json'), 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export async function saveProjectContext(projectId: string, context: ProjectContext): Promise<void> {
    const dir = await ensureProjectDir(projectId);
    await fs.writeFile(path.join(dir, 'context.json'), JSON.stringify(context, null, 2));
}

// --- Planner ---

export async function getBlogPosts(projectId: string): Promise<BlogPost[]> {
    const dir = await ensureProjectDir(projectId);
    try {
        const data = await fs.readFile(path.join(dir, 'planner.json'), 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
    const posts = await getBlogPosts(post.projectId);
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
        posts[index] = post;
    } else {
        posts.push(post);
    }
    const dir = await ensureProjectDir(post.projectId);
    await fs.writeFile(path.join(dir, 'planner.json'), JSON.stringify(posts, null, 2));
}

export async function deleteBlogPost(projectId: string, postId: string): Promise<void> {
    let posts = await getBlogPosts(projectId);
    posts = posts.filter(p => p.id !== postId);
    const dir = await ensureProjectDir(projectId);
    await fs.writeFile(path.join(dir, 'planner.json'), JSON.stringify(posts, null, 2));
}

export async function deleteProject(projectId: string): Promise<void> {
    const projects = await getProjects();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    await fs.writeFile(path.join(DATA_DIR, 'projects.json'), JSON.stringify(updatedProjects, null, 2));

    // Remove project directory
    const dir = path.join(DATA_DIR, projectId);
    try {
        await fs.rm(dir, { recursive: true, force: true });
    } catch (e) {
        console.error(`Failed to delete project directory for ${projectId}`, e);
    }
}
