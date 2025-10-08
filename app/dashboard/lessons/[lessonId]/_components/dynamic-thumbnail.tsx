import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategoryColor, getDifficultyColor } from "@/lib/lesson-utils";

export function DynamicThumbnail({
  thumbnailUrl,
  title,
  categories,
  difficulty,
}: {
  title: string;
  categories?: string[];
  difficulty: string;
  thumbnailUrl: string;
}) {
  return (
    <div className="aspect-video overflow-hidden relative rounded-t rounded-b-none">
      <Image
        src={thumbnailUrl}
        height={400}
        width={600}
        alt="Thumbnail"
        className="object-cover w-full h-full"
      />
      <div className="absolute top-0 left-0 w-full flex justify-center items-start pointer-events-none">
        <h3 className="text-xl sm:text-2xl font-medium rounded-b px-2 sm:px-3 py-1 mt-2 text-center max-w-[90%] truncate">
          {title}
        </h3>
      </div>

      <div className="absolute bottom-[7%] left-0 w-full flex justify-center items-center pointer-events-none">
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {categories?.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={cn("text-xs", getCategoryColor(category))}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="absolute top-2 right-3 pointer-events-none">
        <Badge
          variant="outline"
          className={cn("text-xs", getDifficultyColor(difficulty))}
        >
          {difficulty}
        </Badge>
      </div>
    </div>
  );
}
