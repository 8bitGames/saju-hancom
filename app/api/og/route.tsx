import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  // Load Noto Sans KR font
  const notoSansKR = await fetch(
    new URL("https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLGC5nwmPw.woff2")
  ).then((res) => res.arrayBuffer());

  // Fixed star positions for consistent rendering
  const stars = [
    { x: 5, y: 8, size: 2, opacity: 0.8 },
    { x: 12, y: 15, size: 1.5, opacity: 0.6 },
    { x: 25, y: 5, size: 2.5, opacity: 0.9 },
    { x: 35, y: 20, size: 1, opacity: 0.5 },
    { x: 45, y: 10, size: 2, opacity: 0.7 },
    { x: 55, y: 18, size: 1.5, opacity: 0.6 },
    { x: 65, y: 8, size: 2, opacity: 0.8 },
    { x: 75, y: 22, size: 1, opacity: 0.5 },
    { x: 85, y: 12, size: 2.5, opacity: 0.9 },
    { x: 92, y: 6, size: 1.5, opacity: 0.7 },
    { x: 8, y: 35, size: 1, opacity: 0.5 },
    { x: 18, y: 45, size: 2, opacity: 0.8 },
    { x: 28, y: 38, size: 1.5, opacity: 0.6 },
    { x: 72, y: 42, size: 2, opacity: 0.7 },
    { x: 82, y: 35, size: 1.5, opacity: 0.6 },
    { x: 95, y: 40, size: 1, opacity: 0.5 },
    { x: 6, y: 55, size: 2, opacity: 0.8 },
    { x: 15, y: 68, size: 1.5, opacity: 0.6 },
    { x: 88, y: 58, size: 2, opacity: 0.7 },
    { x: 95, y: 65, size: 1, opacity: 0.5 },
    { x: 10, y: 78, size: 1.5, opacity: 0.6 },
    { x: 22, y: 85, size: 2, opacity: 0.8 },
    { x: 35, y: 92, size: 1, opacity: 0.5 },
    { x: 48, y: 88, size: 2.5, opacity: 0.9 },
    { x: 62, y: 95, size: 1.5, opacity: 0.6 },
    { x: 75, y: 85, size: 2, opacity: 0.7 },
    { x: 88, y: 90, size: 1, opacity: 0.5 },
    { x: 95, y: 82, size: 2, opacity: 0.8 },
    { x: 3, y: 92, size: 1.5, opacity: 0.6 },
    { x: 50, y: 3, size: 2, opacity: 0.8 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #0f0a1a 0%, #1a1033 50%, #2d1b4e 100%)",
          position: "relative",
          fontFamily: "Noto Sans KR",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: "2px solid rgba(168, 85, 247, 0.3)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            border: "1px dashed rgba(168, 85, 247, 0.2)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "50%",
              background: `rgba(255, 255, 255, ${star.opacity})`,
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
          />
        ))}

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Main title */}
          <div
            style={{
              fontSize: "96px",
              fontWeight: "700",
              color: "#ffffff",
              textShadow: "0 0 60px rgba(168, 85, 247, 0.8), 0 0 120px rgba(168, 85, 247, 0.4)",
              marginBottom: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            한사 AI
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "36px",
              color: "#a855f7",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            AI 운세 분석
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.6)",
              display: "flex",
              gap: "20px",
              fontWeight: "500",
            }}
          >
            <span>사주</span>
            <span style={{ color: "rgba(168, 85, 247, 0.6)" }}>•</span>
            <span>궁합</span>
            <span style={{ color: "rgba(168, 85, 247, 0.6)" }}>•</span>
            <span>관상</span>
          </div>
        </div>

        {/* Corner decorations */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "30px",
            width: "60px",
            height: "60px",
            borderLeft: "2px solid rgba(168, 85, 247, 0.5)",
            borderTop: "2px solid rgba(168, 85, 247, 0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            borderRight: "2px solid rgba(168, 85, 247, 0.5)",
            borderTop: "2px solid rgba(168, 85, 247, 0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            width: "60px",
            height: "60px",
            borderLeft: "2px solid rgba(168, 85, 247, 0.5)",
            borderBottom: "2px solid rgba(168, 85, 247, 0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            borderRight: "2px solid rgba(168, 85, 247, 0.5)",
            borderBottom: "2px solid rgba(168, 85, 247, 0.5)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans KR",
          data: notoSansKR,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
