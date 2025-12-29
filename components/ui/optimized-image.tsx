"use client";

import Image, { ImageProps } from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | "auto";
  showSkeleton?: boolean;
  containerClassName?: string;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
  auto: "",
};

/**
 * Optimized Image Component
 * - Automatic WebP/AVIF format selection via Next.js
 * - Lazy loading with blur placeholder
 * - Skeleton loading state
 * - Error fallback handling
 * - Responsive sizing
 */
export function OptimizedImage({
  src,
  alt,
  fallback = "/images/placeholder.jpg",
  aspectRatio = "auto",
  showSkeleton = true,
  containerClassName,
  className,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}

      <Image
        src={error ? fallback : src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={85}
        {...props}
      />
    </div>
  );
}

/**
 * Cover Image Component
 * Optimized for full-width hero/cover images
 */
export function CoverImage({
  src,
  alt,
  priority = true,
  className,
  ...props
}: Omit<OptimizedImageProps, "fill" | "sizes">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      priority={priority}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}

/**
 * Card Image Component
 * Optimized for card thumbnails
 */
export function CardImage({
  src,
  alt,
  aspectRatio = "video",
  className,
  ...props
}: Omit<OptimizedImageProps, "fill" | "sizes">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      aspectRatio={aspectRatio}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}

/**
 * Avatar Image Component
 * Optimized for small circular avatars
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, "width" | "height" | "fill" | "sizes"> & {
  size?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      showSkeleton={false}
      {...props}
    />
  );
}

/**
 * Background Video with Image Fallback
 * For hero sections with video backgrounds
 */
interface BackgroundVideoProps {
  videoSrc: string;
  posterSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function BackgroundVideo({
  videoSrc,
  posterSrc,
  alt,
  className,
  priority = false,
}: BackgroundVideoProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Fallback image - always present */}
      <Image
        src={posterSrc}
        alt={alt}
        fill
        sizes="100vw"
        priority={priority}
        className={cn(
          "object-cover transition-opacity duration-500",
          videoLoaded && !videoError ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Video - lazy loaded */}
      {!videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            videoLoaded ? "opacity-100" : "opacity-0"
          )}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

/**
 * Blur Data URL generator for placeholder
 * Use this for static images to generate blur placeholders
 */
export function getBlurDataURL(width: number, height: number): string {
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#1a1033" offset="20%" />
          <stop stop-color="#2d1b4e" offset="50%" />
          <stop stop-color="#1a1033" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#1a1033" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
}
