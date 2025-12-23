import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hansa.ai.kr";

  // Video stillshot as card background
  const cardImageUrl = `${baseUrl}/images/og-frame-5s.jpg`;

  // Load Noto Sans KR font (optional - design works without it)
  let notoSansKR: ArrayBuffer | null = null;
  try {
    const fontResponse = await fetch(
      "https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLGC5nwmPw.woff2",
      { cache: "force-cache" }
    );
    if (fontResponse.ok) {
      notoSansKR = await fontResponse.arrayBuffer();
    }
  } catch {
    // Continue without custom font
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0a0612 0%, #150d24 40%, #1a1030 70%, #0f0919 100%)",
          fontFamily: "Noto Sans KR",
          position: "relative",
        }}
      >
        {/* Subtle purple glow behind card */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "700px",
            background: "radial-gradient(ellipse, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Main layout: Text left, Card right - centered together */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "60px",
            position: "relative",
          }}
        >
          {/* Left side - All text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            {/* Chinese characters - bigger */}
            <div
              style={{
                fontSize: "32px",
                color: "rgba(168, 85, 247, 0.9)",
                fontWeight: "600",
                letterSpacing: "0.15em",
                marginBottom: "16px",
              }}
            >
              韓 · 事
            </div>
            {/* Main title */}
            <div
              style={{
                fontSize: "108px",
                fontWeight: "700",
                color: "#ffffff",
                textShadow: "0 0 80px rgba(168, 85, 247, 0.5)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: "24px",
              }}
            >
              한사
            </div>
            {/* Subtitle */}
            <div
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: "500",
              }}
            >
              AI 운세 서비스
            </div>
          </div>

          {/* Right side - Card with video stillshot */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Card container */}
            <div
              style={{
                width: "300px",
                height: "530px",
                borderRadius: "16px",
                background: "linear-gradient(145deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(168, 85, 247, 0.2) 100%)",
                padding: "4px",
                display: "flex",
                boxShadow: "0 0 60px rgba(168, 85, 247, 0.3), 0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Inner card with image */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  position: "relative",
                  background: "#0a0612",
                }}
              >
                <img
                  src={cardImageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Subtle overlay on image */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(180deg, transparent 60%, rgba(10, 6, 18, 0.6) 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "30px",
            width: "40px",
            height: "40px",
            borderLeft: "2px solid rgba(168, 85, 247, 0.4)",
            borderTop: "2px solid rgba(168, 85, 247, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "30px",
            width: "40px",
            height: "40px",
            borderRight: "2px solid rgba(168, 85, 247, 0.4)",
            borderTop: "2px solid rgba(168, 85, 247, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            width: "40px",
            height: "40px",
            borderLeft: "2px solid rgba(168, 85, 247, 0.4)",
            borderBottom: "2px solid rgba(168, 85, 247, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            width: "40px",
            height: "40px",
            borderRight: "2px solid rgba(168, 85, 247, 0.4)",
            borderBottom: "2px solid rgba(168, 85, 247, 0.4)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(notoSansKR && {
        fonts: [
          {
            name: "Noto Sans KR",
            data: notoSansKR,
            style: "normal" as const,
            weight: 700 as const,
          },
        ],
      }),
    }
  );
}
