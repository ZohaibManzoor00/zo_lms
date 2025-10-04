// Migration script to populate junction tables from existing data
// Run this after the schema migration is complete

import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function migrateToJunctionTables() {
  console.log("Starting migration to junction tables...");

  try {
    // 1. Migrate Course -> Chapter relationships
    console.log("Migrating course-chapter relationships...");

    const courses = await prisma.course.findMany({
      include: {
        chapter: {
          orderBy: { position: "asc" },
        },
      },
    });

    for (const course of courses) {
      for (let i = 0; i < course.chapter.length; i++) {
        const chapter = course.chapter[i];

        // Check if relationship already exists
        const existing = await prisma.courseChapter.findUnique({
          where: {
            courseId_chapterId: {
              courseId: course.id,
              chapterId: chapter.id,
            },
          },
        });

        if (!existing) {
          await prisma.courseChapter.create({
            data: {
              courseId: course.id,
              chapterId: chapter.id,
              position: i + 1, // Use array index + 1 as position
            },
          });
          console.log(
            `✓ Linked course ${course.title} -> chapter ${chapter.title}`
          );
        }
      }
    }

    // 2. Migrate Chapter -> Lesson relationships
    console.log("Migrating chapter-lesson relationships...");

    const chapters = await prisma.chapter.findMany({
      include: {
        lesson: {
          orderBy: { position: "asc" },
        },
      },
    });

    for (const chapter of chapters) {
      for (let i = 0; i < chapter.lesson.length; i++) {
        const lesson = chapter.lesson[i];

        // Check if relationship already exists
        const existing = await prisma.chapterLesson.findUnique({
          where: {
            chapterId_lessonId: {
              chapterId: chapter.id,
              lessonId: lesson.id,
            },
          },
        });

        if (!existing) {
          await prisma.chapterLesson.create({
            data: {
              chapterId: chapter.id,
              lessonId: lesson.id,
              position: i + 1, // Use array index + 1 as position
            },
          });
          console.log(
            `✓ Linked chapter ${chapter.title} -> lesson ${lesson.title}`
          );
        }
      }
    }

    console.log("Migration completed successfully!");

    // 3. Verify migration
    const courseChapterCount = await prisma.courseChapter.count();
    const chapterLessonCount = await prisma.chapterLesson.count();

    console.log(`Created ${courseChapterCount} course-chapter relationships`);
    console.log(`Created ${chapterLessonCount} chapter-lesson relationships`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Verification function to ensure data integrity
export async function verifyMigration() {
  console.log("Verifying migration...");

  const issues = [];

  // Check that all chapters have course relationships
  const chaptersWithoutCourse = await prisma.chapter.findMany({
    where: {
      courseChapters: {
        none: {},
      },
    },
  });

  if (chaptersWithoutCourse.length > 0) {
    issues.push(
      `${chaptersWithoutCourse.length} chapters without course relationships`
    );
  }

  // Check that all lessons in chapters have chapter relationships
  const lessonsInChaptersWithoutRelation = await prisma.lesson.findMany({
    where: {
      chapterId: { not: null },
      chapterLessons: {
        none: {},
      },
    },
  });

  if (lessonsInChaptersWithoutRelation.length > 0) {
    issues.push(
      `${lessonsInChaptersWithoutRelation.length} lessons without chapter relationships`
    );
  }

  if (issues.length === 0) {
    console.log("✓ Migration verification passed!");
    return true;
  } else {
    console.log("❌ Migration verification failed:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
    return false;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateToJunctionTables()
    .then(() => verifyMigration())
    .then(() => {
      console.log("All done! Junction tables are ready for testing.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
