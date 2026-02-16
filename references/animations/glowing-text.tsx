// 文字光效动画
// 使用方式：包裹文字内容

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface GlowingTextProps {
  children: React.ReactNode;
  color?: string;
  intensity?: "low" | "medium" | "high";
  style?: React.CSSProperties;
}

/**
 * 文字发光效果
 * 产生脉动的光晕，适合标题和关键文字
 */
export const GlowingText: React.FC<GlowingTextProps> = ({
  children,
  color = "#00FF88",
  intensity = "medium",
  style = {},
}) => {
  const frame = useCurrentFrame();

  const intensityConfig = {
    low: { min: 5, max: 15, cycle: 45 },
    medium: { min: 10, max: 30, cycle: 30 },
    high: { min: 15, max: 50, cycle: 20 },
  };

  const config = intensityConfig[intensity];

  const progress = frame % config.cycle;

  // 光晕大小脉动
  const glowSize = interpolate(
    progress,
    [0, config.cycle / 2, config.cycle],
    [config.min, config.max, config.min],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
      easing: Easing.inOut(Easing.sin),
    },
  );

  // 透明度微调
  const opacity = interpolate(
    progress,
    [0, config.cycle / 2, config.cycle],
    [0.85, 1, 0.85],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  return (
    <span
      style={{
        color: "#fff",
        textShadow: `
          0 0 ${glowSize}px ${color},
          0 0 ${glowSize * 2}px ${color}80,
          0 0 ${glowSize * 3}px ${color}40
        `,
        opacity,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * 文字渐变流动效果
 * 适合强调品牌色
 */
export const GradientFlowText: React.FC<{
  children: React.ReactNode;
  colors?: string[];
  style?: React.CSSProperties;
}> = ({ children, colors = ["#00FF88", "#8B5CF6", "#00FF88"], style = {} }) => {
  const frame = useCurrentFrame();

  // 背景位置移动
  const bgPosition = interpolate(frame % 60, [0, 60], [0, 200], {
    extrapolateRight: "wrap",
  });

  return (
    <span
      style={{
        background: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${bgPosition}% 0`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * 打字机效果文字
 * 逐字显示
 */
export const TypewriterText: React.FC<{
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
}> = ({
  text,
  startFrame = 0,
  charsPerFrame = 1,
  style = {},
  cursorColor = "#00FF88",
}) => {
  const frame = useCurrentFrame();

  const visibleChars = Math.min(
    text.length,
    Math.max(0, Math.floor((frame - startFrame) * charsPerFrame)),
  );

  const showCursor = visibleChars < text.length;

  // 光标闪烁
  const cursorOpacity = frame % 30 < 15 ? 1 : 0;

  return (
    <span style={style}>
      {text.slice(0, visibleChars)}
      {showCursor && (
        <span
          style={{
            borderLeft: `2px solid ${cursorColor}`,
            marginLeft: "2px",
            opacity: cursorOpacity,
          }}
        >
          &nbsp;
        </span>
      )}
    </span>
  );
};

/**
 * 数字滚动效果
 * 适合数据展示
 */
export const RollingNumber: React.FC<{
  value: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}> = ({ value, durationInFrames = 30, style = {} }) => {
  const frame = useCurrentFrame();

  const displayValue = Math.min(
    value,
    Math.floor(
      interpolate(frame, [0, durationInFrames], [0, value], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      }),
    ),
  );

  return <span style={style}>{displayValue.toLocaleString()}</span>;
};

export default GlowingText;
