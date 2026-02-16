/**
 * 流程检查器 - 强制约束 PPT 生成流程
 *
 * 使用方式：
 *   node flow-checker.mjs --project <dir> --step <1-5>
 *
 * 规则：
 *   - 每一步都必须按顺序执行
 *   - 不能跳过任何步骤
 *   - 必须在用户确认后才能渲染
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs, readJson, writeJson, nowIso } from "./_lib.mjs";

const STEPS = [
  { id: 1, name: "文案输入", required: ["sources/raw-content.txt"] },
  {
    id: 2,
    name: "手动编写规划",
    required: ["sources/script.md"],
    validate: validateScript,
  },
  {
    id: 3,
    name: "视觉组件方案",
    required: ["build/visual-recommendations.json"],
    validate: validateVisuals,
  },
  { id: 4, name: "用户确认", required: [], validate: validateConfirmation },
  { id: 5, name: "渲染生成", required: ["exports/recording.pptx"] },
];

function validateScript(content) {
  const errors = [];

  // 检查是否有 visual 字段
  const slideMatches = content.match(/## Slide \d+/g) || [];
  const visualMatches = content.match(/visual:/g) || [];

  if (slideMatches.length === 0) {
    errors.push("没有找到任何幻灯片");
  }

  if (visualMatches.length < slideMatches.length) {
    errors.push(
      `有 ${slideMatches.length} 页幻灯片，但只有 ${visualMatches.length} 页有 visual 字段`,
    );
  }

  // 检查字数
  const bulletMatches = content.match(/- "[^"]+"/g) || [];
  for (const match of bulletMatches) {
    const text = match.replace(/- "/, "").replace(/"$/, "");
    if (text.length < 15) {
      errors.push(`要点过短（<15字）: "${text.slice(0, 20)}..."`);
    }
    if (text.length > 50) {
      errors.push(`要点过长（>50字）: "${text.slice(0, 30)}..."`);
    }
  }

  return errors;
}

function validateVisuals(data) {
  const errors = [];

  if (!data.recommendations || !Array.isArray(data.recommendations)) {
    errors.push("视觉推荐格式错误");
    return errors;
  }

  if (data.recommendations.length === 0) {
    errors.push("没有视觉组件推荐");
  }

  for (const rec of data.recommendations) {
    if (!rec.visualType) {
      errors.push(`幻灯片 ${rec.slideId} 缺少 visualType`);
    }
  }

  return errors;
}

function validateConfirmation(manifest) {
  const errors = [];

  if (!manifest.stages?.userConfirmed?.status === "confirmed") {
    errors.push("用户尚未确认方案");
  }

  return errors;
}

function checkStep(projectDir, stepId) {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) {
    return { success: false, error: `无效的步骤: ${stepId}` };
  }

  // 检查前置步骤
  const manifestPath = path.join(projectDir, "manifest.json");
  let manifest = { stages: {} };

  if (fs.existsSync(manifestPath)) {
    manifest = readJson(manifestPath);
  }

  for (const prevStep of STEPS.filter((s) => s.id < stepId)) {
    const stageName = `step${prevStep.id}`;
    if (!manifest.stages?.[stageName]?.completed) {
      return {
        success: false,
        error: `必须先完成 Step ${prevStep.id}: ${prevStep.name}`,
      };
    }
  }

  // 检查必需文件
  for (const req of step.required) {
    const filePath = path.join(projectDir, req);
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `缺少必需文件: ${req}`,
      };
    }
  }

  // 执行自定义验证
  if (step.validate) {
    if (step.id === 2) {
      const scriptPath = path.join(projectDir, "sources/script.md");
      const content = fs.readFileSync(scriptPath, "utf-8");
      const errors = step.validate(content);
      if (errors.length > 0) {
        return { success: false, errors };
      }
    } else if (step.id === 3) {
      const visualPath = path.join(
        projectDir,
        "build/visual-recommendations.json",
      );
      const data = readJson(visualPath);
      const errors = step.validate(data);
      if (errors.length > 0) {
        return { success: false, errors };
      }
    } else if (step.id === 4) {
      const errors = step.validate(manifest);
      if (errors.length > 0) {
        return { success: false, errors };
      }
    }
  }

  return { success: true };
}

function markStepCompleted(projectDir, stepId) {
  const manifestPath = path.join(projectDir, "manifest.json");
  let manifest = { stages: {} };

  if (fs.existsSync(manifestPath)) {
    manifest = readJson(manifestPath);
  }

  manifest.stages[`step${stepId}`] = {
    completed: true,
    at: nowIso(),
  };

  writeJson(manifestPath, manifest);
}

function getStatus(projectDir) {
  const manifestPath = path.join(projectDir, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    return { currentStep: 1, completed: [] };
  }

  const manifest = readJson(manifestPath);
  const completed = [];
  let currentStep = 1;

  for (const step of STEPS) {
    if (manifest.stages?.[`step${step.id}`]?.completed) {
      completed.push(step.id);
      currentStep = step.id + 1;
    }
  }

  return { currentStep: Math.min(currentStep, 5), completed };
}

const usage = () => {
  console.log(`
流程检查器 - 强制约束 PPT 生成流程

Usage:
  node flow-checker.mjs --project <dir> --status
  node flow-checker.mjs --project <dir> --check <step>
  node flow-checker.mjs --project <dir> --complete <step>

Steps:
  1 - 文案输入
  2 - 手动编写规划（每页必须有 visual 字段）
  3 - 视觉组件方案
  4 - 用户确认（必须明确同意）
  5 - 渲染生成

Rules:
  - 每一步都必须按顺序执行
  - 不能跳过任何步骤
  - 必须在用户确认后才能渲染
`);
};

const main = () => {
  const { flags } = parseArgs(process.argv);

  if (flags.help || !flags.project) {
    usage();
    process.exit(flags.help ? 0 : 1);
  }

  const projectDir = flags.project;

  if (!fs.existsSync(projectDir)) {
    console.error(`Error: 项目目录不存在: ${projectDir}`);
    process.exit(1);
  }

  if (flags.status) {
    const { currentStep, completed } = getStatus(projectDir);
    console.log(`\n当前状态:\n`);
    for (const step of STEPS) {
      const isCompleted = completed.includes(step.id);
      const isCurrent = step.id === currentStep;
      const icon = isCompleted ? "✅" : isCurrent ? "👉" : "⬜";
      console.log(`  ${icon} Step ${step.id}: ${step.name}`);
    }
    console.log(`\n当前步骤: Step ${currentStep}\n`);
    return;
  }

  if (flags.check) {
    const stepId = parseInt(flags.check);
    const result = checkStep(projectDir, stepId);

    if (result.success) {
      console.log(`✅ Step ${stepId} 检查通过`);
    } else {
      console.error(`❌ Step ${stepId} 检查失败:`);
      if (result.error) {
        console.error(`   ${result.error}`);
      }
      if (result.errors) {
        for (const err of result.errors) {
          console.error(`   - ${err}`);
        }
      }
      process.exit(1);
    }
    return;
  }

  if (flags.complete) {
    const stepId = parseInt(flags.complete);
    const result = checkStep(projectDir, stepId);

    if (!result.success) {
      console.error(`❌ 无法完成 Step ${stepId}:`);
      if (result.error) {
        console.error(`   ${result.error}`);
      }
      if (result.errors) {
        for (const err of result.errors) {
          console.error(`   - ${err}`);
        }
      }
      process.exit(1);
    }

    markStepCompleted(projectDir, stepId);
    console.log(`✅ Step ${stepId} 已完成`);
    return;
  }

  usage();
};

main();
