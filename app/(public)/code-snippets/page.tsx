import { getAllCodeSnippets } from "@/app/data/code-snippet/get-all-code-snippets";
import { CodeSnippetCard } from "../_components/code-snippet-card";

export default function PublicCodeSnippetsPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Code Snippets
        </h1>
        <p className="text-muted-foreground">
          Discover a wide range of code snippets I&apos;ve built/used in my
          projects and career
        </p>
      </div>

      <RenderCodeSnippets />
    </>
  );
}

const RenderCodeSnippets = async () => {
  const codeSnippets = await getAllCodeSnippets();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {codeSnippets.map((snippet) => (
        <div key={snippet.id}>
          <CodeSnippetCard snippet={snippet} />
        </div>
      ))}
    </div>
  );
};
