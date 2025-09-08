export default function PublicProjectsPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Explore Projects
        </h1>
        <p className="text-muted-foreground">
          Check out the projects I&apos;ve built.
        </p>
      </div>

      <RenderProjects />

    </>
  );
}

async function RenderProjects() {
  const projects = [
    {
      id: "1",
      name: "Project 1",
      description: "Description 1",
    },
    {
      id: "2",
      name: "Project 2",
      description: "Description 2",
    },
    
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects?.map((project) => (
        <div key={project.id}>
          {project.name}
        </div>
      ))}
    </div>
  )
}
