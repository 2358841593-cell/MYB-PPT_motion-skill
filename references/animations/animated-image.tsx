// 图片动画容器
// 用于外部图片（非模板图片）的动画效果

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface AnimatedImageProps {
  src: string;
  animation?: "breathing" | "glow" | "float" | "pulse" | "none";
  style?: React.CSSProperties;
  glowColor?: string;
}

/**
 * 动画图片容器
 * 为外部图片添加动画效果
 */
export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  animation = "breathing",
  style = {},
  glowColor = "#00FF88",
}) => {
  const frame = useCurrentFrame();

  const getAnimationStyle = (): React.CSSProperties => {
    switch (animation) {
      case "breathing": {
        // 呼吸效果：缩放 + 透明度
        const cycle = frame % 60;
        const scale = interpolate(cycle, [0, 30, 60], [1, 1.05, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.inOut(Easing.sin),
        });
        const opacity = interpolate(cycle, [0, 30, 60], [0.9, 1, 0.9], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        return {
          transform: `scale(${scale})`,
          opacity,
        };
      }

      case "glow": {
        // 发光效果：动态光晕
        const cycle = frame % 40;
        const glowIntensity = interpolate(cycle, [0, 20, 40], [15, 35, 15], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        return {
          filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor}80) drop-shadow(0 0 ${glowIntensity * 2}px ${glowColor}40)`,
        };
      }

      case "float": {
        // 浮动效果：上下漂浮
        const floatY = Math.sin(frame * 0.05) * 10;
        const floatRotate = Math.sin(frame * 0.03) * 2;
        return {
          transform: `translateY(${floatY}px) rotate(${floatRotate}deg)`,
        };
      }

      case "pulse": {
        // 脉冲效果：快速缩放
        const cycle = frame % 20;
        const scale = interpolate(cycle, [0, 10, 20], [1, 1.08, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        return {
          transform: `scale(${scale})`,
        };
      }

      case "none":
      default:
        return {};
    }
  };

  return (
    <img
      src={src}
      style={{
        ...style,
        ...getAnimationStyle(),
        transition: "none", // 禁用 CSS transition，使用帧动画
      }}
    />
  );
};

/**
 * 带入场动画的图片
 * 先入场，再持续动画
 */
export const AnimatedImageWithEntrance: React.FC<
  AnimatedImageProps & {
    entranceDuration?: number;
    entranceType?: "fade" | "scale" | "slide";
  }
> = ({
  src,
  animation = "breathing",
  entranceDuration = 15,
  entranceType = "fade",
  style = {},
  glowColor = "#00FF88",
}) => {
  const frame = useCurrentFrame();

  // 入场动画
  const getEntranceStyle = (): React.CSSProperties => {
    if (frame >= entranceDuration) return { opacity: 1 };

    switch (entranceType) {
      case "fade":
        return {
          opacity: interpolate(frame, [0, entranceDuration], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }),
        };
      case "scale":
        return {
          opacity: interpolate(frame, [0, entranceDuration], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }),
          transform: `scale(${interpolate(
            frame,
            [0, entranceDuration],
            [0.8, 1],
            {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            },
          )})`,
        };
      case "slide":
        return {
          opacity: interpolate(frame, [0, entranceDuration], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }),
          transform: `translateY(${interpolate(
            frame,
            [0, entranceDuration],
            [30, 0],
            {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            },
          )}px)`,
        };
      default:
        return { opacity: 1 };
    }
  };

  // 持续动画（入场完成后开始）
  const getAnimationStyle = (): React.CSSProperties => {
    if (frame < entranceDuration) return {};

    const animFrame = frame - entranceDuration;

    switch (animation) {
      case "breathing": {
        const cycle = animFrame % 60;
        const scale = interpolate(cycle, [0, 30, 60], [1, 1.05, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        return { transform: `scale(${scale})` };
      }
      case "glow": {
        const cycle = animFrame % 40;
        const glowIntensity = interpolate(cycle, [0, 20, 40], [15, 35, 15], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        return {
          filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor}80)`,
        };
      }
      case "float": {
        const floatY = Math.sin(animFrame * 0.05) * 10;
        return { transform: `translateY(${floatY}px)` };
      }
      default:
        return {};
    }
  };

  return (
    <img
      src={src}
      style={{
        ...style,
        ...getEntranceStyle(),
        ...getAnimationStyle(),
      }}
    />
  );
};

/**
 * Ken Burns 效果（缓慢缩放平移）
 * 适合全屏背景图片
 */
export const KenBurnsImage: React.FC<{
  src: string;
  durationInFrames: number;
  zoomDirection?: "in" | "out";
  style?: React.CSSProperties;
}> = ({ src, durationInFrames, zoomDirection = "in", style = {} }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // 缓慢缩放
  const scale =
    zoomDirection === "in"
      ? interpolate(progress, [0, 1], [1, 1.15])
      : interpolate(progress, [0, 1], [1.15, 1]);

  // 轻微平移
  const translateX = interpolate(progress, [0, 1], [0, 20]);
  const translateY = interpolate(progress, [0, 1], [0, 10]);

  return (
    <img
      src={src}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        transformOrigin: "center center",
      }}
    />
  );
};

/**
 * 图片幻灯片容器
 * 支持多张图片自动切换
 */
export const ImageSlideshow: React.FC<{
  images: string[];
  intervalInFrames?: number;
  transitionDuration?: number;
  animation?: "breathing" | "glow" | "float" | "none";
}> = ({
  images,
  intervalInFrames = 150,
  transitionDuration = 15,
  animation = "none",
}) => {
  const frame = useCurrentFrame();

  const currentIndex = Math.floor(frame / intervalInFrames) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

  const frameInSlide = frame % intervalInFrames;
  const isTransitioning = frameInSlide >= intervalInFrames - transitionDuration;

  const currentOpacity = isTransitioning
    ? interpolate(
        frameInSlide,
        [intervalInFrames - transitionDuration, intervalInFrames],
        [1, 0],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
      )
    : 1;

  const nextOpacity = isTransitioning
    ? interpolate(
        frameInSlide,
        [intervalInFrames - transitionDuration, intervalInFrames],
        [0, 1],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
      )
    : 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <AnimatedImage
        src={images[currentIndex]}
        animation={animation}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: currentOpacity,
        }}
      />
      {isTransitioning && (
        <AnimatedImage
          src={images[nextIndex]}
          animation={animation}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: nextOpacity,
          }}
        />
      )}
    </div>
  );
};

export default AnimatedImage;
