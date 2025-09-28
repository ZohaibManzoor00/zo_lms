import { getCodeSnippetById } from "@/app/data/admin/admin-get-code-snippet";
import { DeleteCodeSnippetForm } from "./_components/delete-code-snippet-form";
import { notFound } from "next/navigation";

interface Props {
  params: {
    snippetId: string;
  };
}

export default async function DeleteCodeSnippetPage({ params }: Props) {
  const snippet = await getCodeSnippetById(params.snippetId);

  if (!snippet) {
    notFound();
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
