import { Suspense } from "react";
import { getAllCodeSnippets } from "@/app/data/code-snippet/get-all-code-snippets";
import {
  AdminCodeSnippetCard,
  AdminCodeSnippetCardSkeleton,
} from "./_components/admin-code-snippet-card";
import { EmptyCourseState } from "@/components/general/empty-course-state";
import { ForwardButton } from "@/components/ui/forward-button";

export default function CodeSnippetsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Code Snippets</h1>
        <ForwardButton
          href="/admin/code-snippets/create"
          label="Create Code Snippet"
          variant="default"
        />
      </div>

      <Suspense fallback={<AdminCodeSnippetSkeletonLayout />}>
        <RenderCodeSnippets />
      </Suspense>
    </>
  );
}

async function RenderCodeSnippets() {
  const codeSnippets = await getAllCodeSnippets();

  return (
    <>
      {codeSnippets.length === 0 ? (
        <EmptyCourseState
          title="No code snippets found"
          description="You haven't created any code snippets yet."
          buttonText="Create Code Snippet"
          href="/admin/code-snippets/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {codeSnippets.map((snippet) => (
            <AdminCodeSnippetCard key={snippet.id} data={snippet} />
          ))}
        </div>
      )}
    </>
  );
}

function AdminCodeSnippetSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {Array.from({ length: 6 }).map((_, idx) => (
        <AdminCodeSnippetCardSkeleton key={idx} />
      ))}
    </div>
  );
}
