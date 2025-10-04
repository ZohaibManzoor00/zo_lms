import { BookIcon, PlayIcon, School } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SelectLessonState() {
  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookIcon className="size-12 text-primary" />
          </div>

          {/* Floating icons for visual interest */}
          <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary/20 flex items-center justify-center animate-bounce delay-100">
            <PlayIcon className="size-4 text-primary" />
          </div>
          <div className="absolute -bottom-2 -left-2 size-8 rounded-full bg-primary/20 flex items-center justify-center animate-bounce delay-300">
            <School className="size-4 text-primary" />
          </div>
        </div>

        <div className="space-y-3 max-w-md">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Select a Lesson to Get Started
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Choose any lesson from the sidebar to begin learning. You can search
            through lessons or browse by category.
          </p>
        </div>

        <Card className="w-full max-w-md border-dashed border-2 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span>Browse lessons in the sidebar</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <div className="size-2 rounded-full bg-primary animate-pulse delay-150" />
              <span>Use the search bar to find specific topics</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <div className="size-2 rounded-full bg-primary animate-pulse delay-300" />
              <span>Click any lesson to start learning</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
