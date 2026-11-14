import Image from "next/image";
import { cn } from "@/lib/utils";

export function Avatar({
  alt = "",
  className,
  priority = false,
  sizes = "(max-width: 1024px) 64px, 28px",
}: {
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden rounded-md bg-blush", className)}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src="/avatar-face.png"
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-[center_22%]"
      />
    </span>
  );
}
