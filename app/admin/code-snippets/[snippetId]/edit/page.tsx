import { getCodeSnippetById } from "@/app/data/admin/admin-get-code-snippet";
import { EditCodeSnippetForm } from "./_components/edit-code-snippet-form";
import { notFound } from "next/navigation";

interface Props {
  params: {
    snippetId: string;
  };
}

export default async function EditCodeSnippetPage({ params }: Props) {
  const snippet = await getCodeSnippetById(params.snippetId);

  if (!snippet) {
    notFound();
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
