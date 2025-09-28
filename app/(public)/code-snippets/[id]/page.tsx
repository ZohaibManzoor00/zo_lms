import { notFound } from "next/navigation";
import { getCodeSnippetById } from "@/app/data/code-snippet/get-code-snippet-by-id";
import { CodeSnippetDetailView } from "./_components/code-snippet-detail-view";

interface Props {
  params: {
    id: string;
  };
}

export default async function CodeSnippetViewPage({ params }: Props) {
  const snippet = await getCodeSnippetById(params.id);

  if (!snippet) {
    notFound();
  }

  return (
    <div className="container mx-auto pb-8">
      <CodeSnippetDetailView snippet={snippet} />
    </div>
  );
}
