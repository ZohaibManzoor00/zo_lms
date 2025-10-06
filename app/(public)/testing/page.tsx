"use client";

import ThemeElectricBorder from "@/components/ThemeElectricBorder";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
// import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  GraduationCap,
  Settings,
  User,
  Heart,
  Star,
  Download,
  Upload,
  Search,
  Bell,
  Home,
  Menu,
  X,
  Check,
  AlertTriangle,
  Info,
  Zap,
  Play,
  Pause,
  Volume2,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  Github,
} from "lucide-react";
import { PublicCourseCard } from "@/app/(public)/_components/public-course-card";
// import { PublicLessonCard } from "@/app/(public)/_components/public-lesson-card";
import { CodeSnippetCard } from "@/app/(public)/_components/code-snippet-card";
import { RecentResourcesCard } from "@/app/(public)/_components/recent-resources-card";

// Mock data for components
const mockCourse = {
  id: "1",
  title: "Advanced React Patterns",
  slug: "advanced-react-patterns",
  smallDescription:
    "Learn advanced React patterns including render props, compound components, and custom hooks for building scalable applications.",
  fileKey: "",
  level: "Advanced" as const,
  category: "Frontend Development" as const,
  duration: 8,
  price: 99,
  status: "Published" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// const mockLesson = {
//   id: "1",
//   title: "Introduction to Custom Hooks",
//   description: "Learn how to create and use custom hooks in React",
//   videoKey: "",
//   thumbnailKey: "",
//   position: 1,
//   chapter: {
//     course: {
//       slug: "react-course",
//     },
//   },
//   walkthroughs: [{ id: "1", title: "Hook Example" }],
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };

const mockCodeSnippet = {
  id: "1",
  title: "useLocalStorage Hook",
  description:
    "A custom React hook for managing localStorage with automatic JSON serialization",
  code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
  language: "typescript",
  clickCount: 42,
  tags: ["react", "hooks", "localStorage", "typescript"],
  isFeatured: true,
};

const mockRecentResources = [
  {
    id: "1",
    title: "Advanced React Patterns",
    createdAt: new Date(),
    href: "/courses/advanced-react",
    type: "Frontend Development",
  },
  {
    id: "2",
    title: "Custom Hooks Deep Dive",
    createdAt: new Date(),
    href: "/lessons/custom-hooks",
    type: "Video + Walkthrough",
  },
  {
    id: "3",
    title: "useLocalStorage Implementation",
    createdAt: new Date(),
    href: "/code-snippets/use-localstorage",
    type: "typescript",
  },
];

export default function DesignSystemTestingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Design System Showcase
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive view of all components, colors, and design patterns
            used throughout the application.
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium text-primary">Primary</p>
              <p className="text-xs text-muted-foreground">Main brand color</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium text-secondary">Secondary</p>
              <p className="text-xs text-muted-foreground">Supporting color</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-accent rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium text-accent">Accent</p>
              <p className="text-xs text-muted-foreground">Highlight color</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-destructive rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium text-destructive">
                Destructive
              </p>
              <p className="text-xs text-muted-foreground">Error/danger</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium text-muted-foreground">Muted</p>
              <p className="text-xs text-muted-foreground">Subtle elements</p>
            </div>
          </div>
        </section>

        {/* Electric Border Showcase */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Electric Border Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ThemeElectricBorder
              colorTheme="primary"
              speed={0.5}
              chaos={0.5}
              thickness={2}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">
                    Primary Lightning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Dynamic primary color border
                  </p>
                </CardContent>
              </Card>
            </ThemeElectricBorder>

            <ThemeElectricBorder
              colorTheme="destructive"
              speed={1.2}
              chaos={0.8}
              thickness={1}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">
                    Destructive Lightning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    High energy error state
                  </p>
                </CardContent>
              </Card>
            </ThemeElectricBorder>

            <ThemeElectricBorder
              customColor="#7df9ff"
              speed={0.8}
              chaos={0.6}
              thickness={2}
            >
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: "#7df9ff" }}>
                    Custom Cyan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Custom color override
                  </p>
                </CardContent>
              </Card>
            </ThemeElectricBorder>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              With Icon
            </Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Badges
          </h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
          </div>
        </section>

        {/* Form Elements */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Form Elements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
                <div>
                  <Label>Select Option</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Progress & Loading */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Progress & Loading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Bars</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Course Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Loading</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeletons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Custom Components */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Custom Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PublicCourseCard data={mockCourse} />
            {/* <PublicLessonCard data={mockLesson} /> */}
            <div className="md:col-span-2 lg:col-span-1">
              <CodeSnippetCard snippet={mockCodeSnippet} />
            </div>
          </div>
        </section>

        {/* Recent Resources Card */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Resource Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecentResourcesCard
              title="Latest Courses"
              icon={BookOpen}
              items={mockRecentResources}
              viewAllHref="/courses"
              emptyMessage="No courses available yet."
            />
            <RecentResourcesCard
              title="Latest Lessons"
              icon={GraduationCap}
              items={mockRecentResources.slice(0, 2)}
              viewAllHref="/lessons"
              emptyMessage="No lessons available yet."
            />
            <RecentResourcesCard
              title="Code Snippets"
              icon={Code}
              items={mockRecentResources.slice(0, 1)}
              viewAllHref="/code-snippets"
              emptyMessage="No snippets available yet."
            />
          </div>
        </section>

        {/* Dialogs & Modals */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Menu className="h-6 w-6 text-primary" />
            Dialogs & Modals
          </h2>
          <div className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sample Dialog</DialogTitle>
                  <DialogDescription>
                    This is a sample dialog with some content.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>Dialog content goes here...</p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Item</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Tabs
          </h2>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    This is the overview tab content with general information.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Analytics and metrics would be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Configuration options and preferences.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="help" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Documentation and support resources.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Icons Showcase */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Icon Library
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {[
              { icon: Home, name: "Home" },
              { icon: User, name: "User" },
              { icon: Settings, name: "Settings" },
              { icon: Search, name: "Search" },
              { icon: Bell, name: "Bell" },
              { icon: Heart, name: "Heart" },
              { icon: Star, name: "Star" },
              { icon: Download, name: "Download" },
              { icon: Upload, name: "Upload" },
              { icon: Play, name: "Play" },
              { icon: Pause, name: "Pause" },
              { icon: Volume2, name: "Volume" },
              { icon: Calendar, name: "Calendar" },
              { icon: Clock, name: "Clock" },
              { icon: Mail, name: "Mail" },
              { icon: Phone, name: "Phone" },
              { icon: Globe, name: "Globe" },
              { icon: Github, name: "Github" },
              { icon: Check, name: "Check" },
              { icon: X, name: "Close" },
              { icon: AlertTriangle, name: "Warning" },
              { icon: Info, name: "Info" },
              { icon: BookOpen, name: "Book" },
              { icon: Code, name: "Code" },
            ].map(({ icon: IconComponent, name }) => (
              <div
                key={name}
                className="text-center p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <IconComponent className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <section className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            Design System Showcase • Built with shadcn/ui and Tailwind CSS
          </p>
        </section>
      </div>
    </div>
  );
}
