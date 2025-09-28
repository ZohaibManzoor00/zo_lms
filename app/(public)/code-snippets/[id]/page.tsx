import { notFound } from "next/navigation";
import { getCodeSnippetById } from "@/app/data/code-snippet/get-code-snippet-by-id";
import { CodeSnippetDetailView } from "./_components/code-snippet-detail-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CodeSnippetViewPage({ params }: Props) {
  const { id } = await params;
  const snippet = await getCodeSnippetById(id);

  if (!snippet) {
    return notFound();
  }

  return (
    <div className="container mx-auto pb-8">
      <CodeSnippetDetailView snippet={snippet} />
    </div>
  );
}
