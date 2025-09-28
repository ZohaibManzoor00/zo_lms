import { getCodeSnippetById } from "@/app/data/admin/admin-get-code-snippet";
import { DeleteCodeSnippetForm } from "./_components/delete-code-snippet-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ snippetId: string }>;
}

export default async function DeleteCodeSnippetPage({ params }: Props) {
  const { snippetId } = await params;
  const snippet = await getCodeSnippetById(snippetId);

  if (!snippet) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-destructive">
          Delete Code Snippet
        </h1>
        <p className="text-muted-foreground">
          This action cannot be undone. This will permanently delete the code
          snippet.
        </p>
      </div>

      <DeleteCodeSnippetForm snippet={snippet} />
    </div>
  );
}
