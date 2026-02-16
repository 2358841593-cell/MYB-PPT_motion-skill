// 元素入场动画
// 使用 spring 实现自然的入场效果

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";

interface StaggerInProps {
  children: React.ReactNode;
  index?: number;
  delayPerItem?: number;
  style?: React.CSSProperties;
}

/**
 * 弹性入场动画
 * 从下方滑入 + 淡入
 */
export const StaggerIn: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayPerItem = 5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * delayPerItem;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const translateY = interpolate(progress, [0, 1], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 缩放入场动画
 */
export const ScaleIn: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayPerItem = 5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * delayPerItem;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scale = interpolate(progress, [0, 1], [0.5, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 从左侧滑入
 */
export const SlideInLeft: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayPerItem = 5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * delayPerItem;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 25, stiffness: 120 },
  });

  const translateX = interpolate(progress, [0, 1], [-50, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 从右侧滑入
 */
export const SlideInRight: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayPerItem = 5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * delayPerItem;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 25, stiffness: 120 },
  });

  const translateX = interpolate(progress, [0, 1], [50, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 旋转入场
 */
export const RotateIn: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayPerItem = 5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * delayPerItem;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const rotation = interpolate(progress, [0, 1], [-180, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const scale = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 弹跳入场
 */
export const BounceIn: React.FC<StaggerInProps> = ({
  children,
  index = 0,
  delayPerItem = 5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * delayPerItem;
  const adjustedFrame = Math.max(0, frame - delay);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
  });

  const scale = interpolate(progress, [0, 0.5, 1], [0, 1.2, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 列表项依次入场
 * 用于渲染列表
 */
export const StaggerList: React.FC<{
  items: React.ReactNode[];
  delayPerItem?: number;
  animation?: "fadeUp" | "scale" | "slideLeft" | "slideRight" | "bounce";
}> = ({ items, delayPerItem = 5, animation = "fadeUp" }) => {
  const animationComponent = {
    fadeUp: StaggerIn,
    scale: ScaleIn,
    slideLeft: SlideInLeft,
    slideRight: SlideInRight,
    bounce: BounceIn,
  }[animation];

  return (
    <>
      {items.map((item, index) =>
        React.createElement(
          animationComponent,
          { key: index, index, delayPerItem },
          item,
        ),
      )}
    </>
  );
};

export default StaggerIn;
