import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  author?: string;
  tags?: string[];
};

function getMDXFiles(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      console.warn(`Blog directory not found: ${dir}`);
      return [];
    }
    return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
  } catch (error) {
    console.error("Error reading MDX files:", error);
    return [];
  }
}

function readMDXFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const rawContent = fs.readFileSync(filePath, "utf-8");
    return matter(rawContent);
  } catch (error) {
    console.error("Error reading MDX file:", error);
    throw error;
  }
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { data, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata: data as Metadata,
      slug,
      content,
    };
  });
}

export function getBlogPosts() {
  try {
    const blogsDir = path.join(process.cwd(), "src/content/blogs");
    return getMDXData(blogsDir);
  } catch (error) {
    console.error("Error getting blog posts:", error);
    return [];
  }
}

export function getBlogPost(slug: string) {
  try {
    if (!slug) {
      throw new Error("Slug is required");
    }
    const filePath = path.join(
      process.cwd(),
      "src/content/blogs",
      `${slug}.mdx`,
    );
    const { data, content } = readMDXFile(filePath);
    return {
      metadata: data as Metadata,
      content,
    };
  } catch (error) {
    console.error(`Error getting blog post for slug "${slug}":`, error);
    throw error;
  }
}
