import Image from "next/image";
import { useConstructUrl } from "@/hooks/use-construct-url";

interface Props {
  thumbnail: string;
  title: string;
}

export function ThumbnailImageClient({ thumbnail, title }: Props) {
  const thumbnailUrl = useConstructUrl(thumbnail);
  return (
    <Image
      src={thumbnailUrl}
      alt={title}
      fill
      className="object-cover"
      priority
    />
  );
}
