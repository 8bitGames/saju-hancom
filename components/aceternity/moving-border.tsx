"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
  children,
  duration = 2000,
  rx = "30%",
  ry = "30%",
  className,
  containerClassName,
  borderClassName,
  as: Component = "div",
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}) {
  return (
    <Component
      className={cn(
        "relative bg-transparent p-[1px] overflow-hidden",
        containerClassName
      )}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `${rx} / ${ry}` }}
      >
        <MovingBorderInner duration={duration} rx={rx} ry={ry} className={borderClassName} />
      </div>
      <div
        className={cn(
          "relative bg-[var(--background-card)] border border-[var(--border)] backdrop-blur-xl flex items-center justify-center w-full h-full text-sm antialiased",
          className
        )}
        style={{ borderRadius: `calc(${rx} * 0.96) / calc(${ry} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
}

const MovingBorderInner = ({
  duration = 2000,
  rx = "30%",
  ry = "30%",
  className,
}: {
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
}) => {
  const pathRef = React.useRef<SVGRectElement | null>(null);
  const progress = React.useRef(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (pathRef.current) {
        const rect = pathRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <svg
      className="absolute w-full h-full"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        ref={pathRef}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="2"
        width="100%"
        height="100%"
        rx={rx}
        ry={ry}
      />
      <defs>
        <motion.linearGradient
          id="gradient"
          animate={{
            x1: ["0%", "100%", "100%", "0%", "0%"],
            x2: ["100%", "100%", "0%", "0%", "100%"],
            y1: ["0%", "0%", "100%", "100%", "0%"],
            y2: ["0%", "100%", "100%", "0%", "0%"],
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <stop stopColor="var(--accent)" stopOpacity="1" />
          <stop offset="0.5" stopColor="var(--element-fire)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--element-water)" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
