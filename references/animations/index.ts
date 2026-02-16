// 动画效果库导出
// 从这里导入所有动画组件

// 光影呼吸效果
export { BreathingLight, BreathingLights } from "./breathing-light";

// 文字光效
export {
  GlowingText,
  GradientFlowText,
  TypewriterText,
  RollingNumber,
} from "./glowing-text";

// 元素入场动画
export {
  StaggerIn,
  ScaleIn,
  SlideInLeft,
  SlideInRight,
  RotateIn,
  BounceIn,
  StaggerList,
} from "./stagger-in";

// 页面过渡
export {
  FadeTransition,
  ScaleFadeTransition,
  SlideInTransition,
  SpringTransition,
  FlipTransition,
  BlurTransition,
  Transition,
  type TransitionType,
} from "./slide-transition";

// 图片动画
export {
  AnimatedImage,
  AnimatedImageWithEntrance,
  KenBurnsImage,
  ImageSlideshow,
} from "./animated-image";

// 动画效果类型汇总
export const ANIMATION_EFFECTS = {
  // 背景效果
  backgrounds: {
    breathingLight: {
      name: "光影呼吸",
      description: "缓慢脉动的光晕效果，适合背景装饰",
      component: "BreathingLight",
    },
    breathingLights: {
      name: "多点呼吸",
      description: "多个呼吸光点组合，适合背景装饰",
      component: "BreathingLights",
    },
  },

  // 文字效果
  text: {
    glowingText: {
      name: "文字发光",
      description: "脉动的文字光晕效果",
      component: "GlowingText",
    },
    gradientFlow: {
      name: "渐变流动",
      description: "颜色渐变流动效果",
      component: "GradientFlowText",
    },
    typewriter: {
      name: "打字机",
      description: "逐字显示文字",
      component: "TypewriterText",
    },
    rollingNumber: {
      name: "数字滚动",
      description: "数字从0滚动到目标值",
      component: "RollingNumber",
    },
  },

  // 入场效果
  entrance: {
    fadeUp: {
      name: "淡入上滑",
      description: "从下方滑入并淡入",
      component: "StaggerIn",
    },
    scale: {
      name: "缩放入场",
      description: "从0.5缩放到1",
      component: "ScaleIn",
    },
    slideLeft: {
      name: "左滑入场",
      description: "从左侧滑入",
      component: "SlideInLeft",
    },
    slideRight: {
      name: "右滑入场",
      description: "从右侧滑入",
      component: "SlideInRight",
    },
    rotate: {
      name: "旋转入场",
      description: "旋转进入",
      component: "RotateIn",
    },
    bounce: {
      name: "弹跳入场",
      description: "弹性效果入场",
      component: "BounceIn",
    },
  },

  // 过渡效果
  transition: {
    fade: {
      name: "淡入淡出",
      description: "简单的透明度过渡",
      component: "FadeTransition",
    },
    scaleFade: {
      name: "缩放淡入",
      description: "缩放 + 淡入",
      component: "ScaleFadeTransition",
    },
    slide: {
      name: "滑动",
      description: "从左侧滑入",
      component: "SlideInTransition",
    },
    spring: {
      name: "弹性",
      description: "物理弹性效果",
      component: "SpringTransition",
    },
    flip: {
      name: "翻转",
      description: "3D翻转效果",
      component: "FlipTransition",
    },
    blur: {
      name: "模糊",
      description: "模糊到清晰",
      component: "BlurTransition",
    },
  },

  // 图片效果
  image: {
    breathing: {
      name: "呼吸",
      description: "缓慢缩放呼吸效果",
      animation: "breathing",
    },
    glow: {
      name: "发光",
      description: "动态光晕效果",
      animation: "glow",
    },
    float: {
      name: "浮动",
      description: "上下漂浮效果",
      animation: "float",
    },
    pulse: {
      name: "脉冲",
      description: "快速缩放脉冲",
      animation: "pulse",
    },
    kenBurns: {
      name: "Ken Burns",
      description: "缓慢缩放平移，适合背景图",
      component: "KenBurnsImage",
    },
  },
} as const;

// 使用示例
/*
// 光影呼吸
import { BreathingLight } from "./animations";
<BreathingLight color="#00FF88" size={300} />

// 文字发光
import { GlowingText } from "./animations";
<GlowingText color="#00FF88">标题文字</GlowingText>

// 列表项依次入场
import { StaggerList } from "./animations";
<StaggerList 
  items={items.map((item, i) => <div key={i}>{item}</div>)} 
  animation="fadeUp" 
/>

// 页面过渡
import { Transition } from "./animations";
<Transition type="spring" durationInFrames={30}>
  <SlideContent />
</Transition>

// 图片动画
import { AnimatedImage } from "./animations";
<AnimatedImage 
  src="/path/to/image.jpg" 
  animation="breathing" 
/>
*/
