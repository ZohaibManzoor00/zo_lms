import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

// interface Feature {
//   title: string;
//   description: string;
//   icon: string;
// }

// const features: Feature[] = [
//   {
//     title: "Comprehensive Courses",
//     description: "Access a wide range of courses covering various topics.",
//     icon: "📚",
//   },
//   {
//     title: "Interactive Learning",
//     description:
//       "Engage with interactive content, quizzes and assignments to enhance your learning.",
//     icon: "🎮",
//   },
//   {
//     title: "Progress Tracking",
//     description:
//       "Monitor your progress and achievements with detailed analytics and personalized dashboards.",
//     icon: "📊",
//   },
//   {
//     title: "Community Support",
//     description:
//       "Join a vibrant community of learners and instructors to collaborate and share knowledge",
//     icon: "👥",
//   },
// ];

const sectionLinks: { title: string; href: string }[] = [
  {
    title: "Projects",
    href: "/projects",
  },
  {
    title: "Courses",
    href: "/courses",
  },
  {
    title: "Blogs",
    href: "/blogs",
  },
  {
    title: "About",
    href: "/about",
  },
];

export default async function Homepage() {
  return (
    <>
      <section className="relative py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* <Badge variant="outline">Online learning made easy</Badge> */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to my learning hub.
          </h1>
          <p className="text-muted-foreground md:text-xl max-w-[700px]">
            Here you&apos;ll find the projects I&apos;ve built, the systems
            I&apos;ve designed, and the lessons I&apos;ve documented along the
            way. This space is both my portfolio and a living resource for
            anyone curious about how I think and build.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {sectionLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className={buttonVariants({
                  size: "lg",
                })}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div>
          {/* Stats section */}
       </div>
      </section>

      <div className="h-10" />
    </>
  );
}
