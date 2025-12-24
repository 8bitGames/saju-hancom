"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/10",
        className
      )}
    />
  );
}

// Card skeleton for result pages
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("p-4 rounded-xl border border-white/10 bg-white/5 space-y-3", className)}>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

// Form skeleton for birth input form
export function FormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Gender selection skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Calendar type skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Birth date skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Birth time skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Birth location skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 rounded-xl" />
      </div>

      {/* Submit button skeleton */}
      <Skeleton className="h-14 rounded-xl" />
    </div>
  );
}

// Result page skeleton
export function ResultSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-32 mx-auto" />
      </div>

      {/* Main result card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

// Carousel skeleton for feature carousel
export function CarouselSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex gap-4 overflow-hidden", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-64 h-96 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
        >
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

// Loader placeholder for mystical loader
export function LoaderSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        <Skeleton className="absolute inset-0 rounded-full" />
        <div className="absolute inset-6 rounded-full bg-[#a855f7]/20 animate-pulse" />
      </div>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
