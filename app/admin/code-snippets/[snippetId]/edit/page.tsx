import { getCodeSnippetById } from "@/app/data/admin/admin-get-code-snippet";
import { EditCodeSnippetForm } from "./_components/edit-code-snippet-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ snippetId: string }>;
}

export default async function EditCodeSnippetPage({ params }: Props) {
  const { snippetId } = await params;
  const snippet = await getCodeSnippetById(snippetId);

  if (!snippet) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Code Snippet</h1>
        <p className="text-muted-foreground">
          Update your code snippet details and content.
        </p>
      </div>

      <EditCodeSnippetForm snippet={snippet} />
    </div>
  );
}
