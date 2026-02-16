// 光影呼吸效果
// 使用方式：在组件中导入并使用

import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface BreathingLightProps {
  color?: string;
  size?: number;
  x?: number | string;
  y?: number | string;
  blur?: number;
  cycleFrames?: number; // 一个呼吸周期的帧数
}

/**
 * 光影呼吸效果组件
 * 产生缓慢脉动的光晕效果，适合背景装饰
 */
export const BreathingLight: React.FC<BreathingLightProps> = ({
  color = "#00FF88",
  size = 300,
  x = "50%",
  y = "50%",
  blur = 40,
  cycleFrames = 60, // 2秒一个周期（30fps）
}) => {
  const frame = useCurrentFrame();

  const progress = frame % cycleFrames;

  // 透明度：0.3 -> 0.8 -> 0.3
  const opacity = interpolate(
    progress,
    [0, cycleFrames / 2, cycleFrames],
    [0.3, 0.8, 0.3],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    },
  );

  // 缩放：1 -> 1.15 -> 1
  const scale = interpolate(
    progress,
    [0, cycleFrames / 2, cycleFrames],
    [1, 1.15, 1],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    },
  );

  // 将 opacity 转换为 hex
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale})`,
        background: `radial-gradient(circle, ${color}${opacityHex} 0%, ${color}40 30%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * 多个呼吸光点组合
 * 适合背景装饰
 */
export const BreathingLights: React.FC<{
  colors?: string[];
  count?: number;
}> = ({ colors = ["#00FF88", "#8B5CF6", "#34D399"], count = 3 }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const color = colors[i % colors.length];
        // 每个光点有不同的相位偏移
        const phaseOffset = i * 20;
        const cycleFrames = 80;

        const progress = (frame + phaseOffset) % cycleFrames;
        const opacity = interpolate(
          progress,
          [0, cycleFrames / 2, cycleFrames],
          [0.2, 0.6, 0.2],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
        );
        const scale = interpolate(
          progress,
          [0, cycleFrames / 2, cycleFrames],
          [1, 1.2, 1],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
        );

        // 随机位置（基于索引生成伪随机）
        const seed = i * 137.5;
        const x = 20 + ((seed * 37) % 60); // 20% - 80%
        const y = 20 + ((seed * 53) % 60);
        const size = 200 + ((seed * 17) % 200);

        const opacityHex = Math.round(opacity * 255)
          .toString(16)
          .padStart(2, "0");

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) scale(${scale})`,
              background: `radial-gradient(circle, ${color}${opacityHex} 0%, transparent 70%)`,
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

export default BreathingLight;
