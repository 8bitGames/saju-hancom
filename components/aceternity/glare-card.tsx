"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    glare: {
      x: 50,
      y: 50,
    },
    background: {
      x: 50,
      y: 50,
    },
    rotate: {
      x: 0,
      y: 0,
    },
  });

  const containerStyle: React.CSSProperties = {
    "--m-x": "50%",
    "--m-y": "50%",
    "--r-x": "0deg",
    "--r-y": "0deg",
    "--bg-x": "50%",
    "--bg-y": "50%",
    "--duration": "300ms",
    "--foil-size": "100%",
    "--opacity": "0",
    "--radius": "48px",
    "--easing": "ease",
    "--transition": "var(--duration) var(--easing)",
  } as React.CSSProperties;

  const backgroundStyle: React.CSSProperties = {
    "--step": "5%",
    "--foil-svg": `url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.00014 5.08879 2.00014 6.31189 2.00014 6.5H1V5.5H2L2.00014 5.5C2.00014 5.5 2.00014 4.08879 2.99994 2.419C3.99974 0.74921 5.50014 0 5.50014 0V1C5.50014 1 4.49974 1.74921 3.49994 3.419H2.99994Z' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E")`,
    "--pattern": "var(--foil-svg) center/100% no-repeat",
    "--rainbow":
      "repeating-linear-gradient( 0deg, rgb(255,119,115) calc(var(--step) * 1), rgba(255,237,95,1) calc(var(--step) * 2), rgba(168,255,95,1) calc(var(--step) * 3), rgba(131,255,247,1) calc(var(--step) * 4), rgba(120,148,255,1) calc(var(--step) * 5), rgb(216,117,255) calc(var(--step) * 6), rgb(255,119,115) calc(var(--step) * 7) ) 0% var(--bg-y)/200% 700% no-repeat",
    "--diagonal":
      "repeating-linear-gradient( 128deg, #0e152e 0%, hsl(180,10%,60%) 3.8%, hsl(180,29%,66%) 4.5%, hsl(180,10%,60%) 5.2%, #0e152e 10%, #0e152e 12% ) var(--bg-x) var(--bg-y)/300% no-repeat",
    "--shade":
      "radial-gradient( farthest-corner circle at var(--m-x) var(--m-y), rgba(255,255,255,0.1) 12%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.25) 120% ) var(--bg-x) var(--bg-y)/300% no-repeat",
    backgroundBlendMode: "hue, hue, hue, overlay",
  } as React.CSSProperties;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!refElement.current || !isPointerInside.current) return;
    const rect = refElement.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const px = x / w;
    const py = y / h;
    const xx = (px - 0.5) / 0.5 * 15;
    const yy = (py - 0.5) / 0.5 * -15;

    setState({
      glare: {
        x: px * 100,
        y: py * 100,
      },
      background: {
        x: 50 + px * 20 - 10,
        y: 50 + py * 20 - 10,
      },
      rotate: {
        x: yy,
        y: xx,
      },
    });
  };

  const handleEnter = () => {
    isPointerInside.current = true;
    if (refElement.current) {
      refElement.current.style.setProperty("--duration", "0ms");
      setTimeout(() => {
        if (refElement.current) {
          refElement.current.style.setProperty("--duration", "300ms");
        }
      }, 0);
    }
  };

  const handleLeave = () => {
    isPointerInside.current = false;
    setState({
      glare: { x: 50, y: 50 },
      background: { x: 50, y: 50 },
      rotate: { x: 0, y: 0 },
    });
  };

  return (
    <div
      style={{
        ...containerStyle,
        "--m-x": `${state.glare.x}%`,
        "--m-y": `${state.glare.y}%`,
        "--r-x": `${state.rotate.x}deg`,
        "--r-y": `${state.rotate.y}deg`,
        "--bg-x": `${state.background.x}%`,
        "--bg-y": `${state.background.y}%`,
      } as React.CSSProperties}
      ref={refElement}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={cn(
        "relative isolate [contain:layout_style] [perspective:600px] transition-transform duration-[var(--duration)] ease-[var(--easing)] will-change-transform",
        className
      )}
    >
      <div
        className="h-full grid will-change-transform origin-center transition-transform duration-[var(--duration)] ease-[var(--easing)] [transform:rotateY(var(--r-x))_rotateX(var(--r-y))]"
      >
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_0_0_round_var(--radius))]">
          <div
            className={cn(
              "h-full w-full bg-slate-950",
              "[background:radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(255,255,255,0.8)_10%,_rgba(255,255,255,0.65)_20%,_rgba(255,255,255,0)_90%)]"
            )}
          />
        </div>
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-color-dodge opacity-70 will-change-[background-position] transition-[opacity,background-position] duration-[var(--duration)] ease-[var(--easing)] [clip-path:inset(0_0_1px_0_round_var(--radius))] [background-blend-mode:hue,_hue,_hue,_overlay]">
          <div
            style={backgroundStyle}
            className="[background:var(--pattern),_var(--rainbow),_var(--diagonal),_var(--shade)] bg-[length:var(--foil-size),200%_400%,800%,200%] bg-[position:var(--bg-x)_var(--bg-y)] bg-no-repeat"
          />
        </div>
        <div
          className={cn(
            "w-full h-full grid [grid-area:1/1] overflow-hidden rounded-[var(--radius)]",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
