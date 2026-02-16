// 页面过渡效果
// 用于幻灯片之间的切换

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  useVideoConfig,
} from "remotion";

interface TransitionProps {
  children: React.ReactNode;
  durationInFrames?: number;
}

/**
 * 淡入淡出过渡
 */
export const FadeTransition: React.FC<TransitionProps> = ({
  children,
  durationInFrames = 15,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/**
 * 缩放淡入过渡
 */
export const ScaleFadeTransition: React.FC<TransitionProps> = ({
  children,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, durationInFrames * 0.6], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(frame, [0, durationInFrames], [0.9, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * 从左侧滑入
 */
export const SlideInTransition: React.FC<TransitionProps> = ({
  children,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const translateX = interpolate(frame, [0, durationInFrames], [width, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [0, durationInFrames * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, transform: `translateX(${translateX}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * 弹性过渡
 */
export const SpringTransition: React.FC<TransitionProps> = ({
  children,
  durationInFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
    durationInFrames,
  });

  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(progress, [0, 0.7, 1], [0.8, 1.02, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * 翻转过渡
 */
export const FlipTransition: React.FC<TransitionProps> = ({
  children,
  durationInFrames = 25,
}) => {
  const frame = useCurrentFrame();

  const rotateY = interpolate(frame, [0, durationInFrames], [-90, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [0, durationInFrames * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `perspective(1000px) rotateY(${rotateY}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * 模糊过渡
 */
export const BlurTransition: React.FC<TransitionProps> = ({
  children,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();

  const blur = interpolate(frame, [0, durationInFrames], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = interpolate(frame, [0, durationInFrames * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * 过渡类型枚举
 */
export type TransitionType =
  | "fade"
  | "scale-fade"
  | "slide"
  | "spring"
  | "flip"
  | "blur";

/**
 * 通用过渡组件
 * 根据 type 自动选择过渡效果
 */
export const Transition: React.FC<{
  children: React.ReactNode;
  type?: TransitionType;
  durationInFrames?: number;
}> = ({ children, type = "fade", durationInFrames = 20 }) => {
  const transitions: Record<TransitionType, React.FC<TransitionProps>> = {
    fade: FadeTransition,
    "scale-fade": ScaleFadeTransition,
    slide: SlideInTransition,
    spring: SpringTransition,
    flip: FlipTransition,
    blur: BlurTransition,
  };

  const TransitionComponent = transitions[type];

  return (
    <TransitionComponent durationInFrames={durationInFrames}>
      {children}
    </TransitionComponent>
  );
};

export default Transition;
