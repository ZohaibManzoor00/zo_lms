export default function PublicCodeSnippetsPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Code Snippets
        </h1>
        <p className="text-muted-foreground">
          Discover a wide range of code snippets I&apos;ve built/used in my projects and career
        </p>
      </div>

      <RenderCodeSnippets />
    </>
  );
}

const RenderCodeSnippets = () => {
  return (
    <div>
      <h1>Code Snippets</h1>
    </div>
  );
};
