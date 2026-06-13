import { notFound } from "next/navigation";
import { WORKS, getWork } from "@/lib/works-data";
import ProjectGallery from "@/components/ProjectGallery";
import "./works.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORKS.map((w) => ({ slug: w.slug }));
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  return <ProjectGallery work={work} />;
}
