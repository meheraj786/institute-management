import { notFound } from "next/navigation";
import {
  InstituteDashboard,
  type ViewId,
} from "@/components/institute-dashboard";

const moduleIds: ViewId[] = [
  "students",
  "attendance",
  "fees",
  "exams",
  "notices",
  "teachers",
  "classes",
  "sections",
  "subjects",
  "academic-years",
  "users",
];

export const instant = false;

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!moduleIds.includes(module as ViewId)) notFound();
  return <InstituteDashboard />;
}
