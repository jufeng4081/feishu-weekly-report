export type ReportMode = 'daily' | 'weekly' | 'custom';

export interface ModeOption {
  label: string;
  value: ReportMode;
}

export const MODE_OPTIONS: ModeOption[] = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '自定义时间段', value: 'custom' },
];

export const MODEL_OPTIONS = [
  { label: 'DeepSeek Chat (快速)', value: 'deepseek-chat' },
  { label: 'DeepSeek Reasoner (深度)', value: 'deepseek-reasoner' },
];

const PROMPTS: Record<ReportMode, string> = {
  daily: `你是一个专业的日报生成助手。请根据用户提供的工作记录，生成一份结构清晰的日报。

以JSON格式返回，包含以下字段：
- date: "日期（如果文本中提到，否则留空）"
- completed: 已完成事项列表（数组，每项简洁明了）
- inProgress: 进行中的事项列表（数组）
- todo: 待办事项列表（数组）
- problems: 遇到的问题（数组，若无则留空数组）
- summary: 一句话总结今日工作（20字以内）
- energy: "高效" | "正常" | "低效"（工作状态评估）

注意事项：
- 已完成事项用过去时，待办事项用将来时
- 每项工作控制在15字以内
- 如果用户提供的信息不足以填满某个字段，使用空数组

仅返回JSON，不要其他文字。`,

  weekly: `你是一个专业的周报生成助手。请根据用户提供的一周工作记录，生成一份结构清晰的周报。

以JSON格式返回，包含以下字段：
- weekRange: "周范围（如果文本中提到，否则填'本周'）"
- completed: 本周完成事项列表（数组，每项简洁）
- inProgress: 进行中的事项列表（数组）
- plan: 下周计划列表（数组）
- achievements: 本周主要成果/亮点（数组，1-3项）
- problems: 遇到的问题及解决方案（数组，若无则留空）
- summary: 一句话总结本周工作（30字以内）
- overall: "优秀" | "良好" | "一般" | "需改进"

注意事项：
- 突出成果和量化数据（如有）
- 每项控制在20字以内

仅返回JSON，不要其他文字。`,

  custom: `你是一个专业的工作报告生成助手。请根据用户提供的工作记录和时间范围，生成结构化的工作报告。

以JSON格式返回，包含以下字段：
- period: "报告涵盖的时间段"
- completed: 完成事项列表（数组）
- inProgress: 进行中的事项（数组）
- todo: 后续计划（数组）
- highlights: 亮点与成果（数组，1-3项）
- summary: 一句话总结

仅返回JSON，不要其他文字。`,
};

export function getPrompt(mode: ReportMode): string {
  return PROMPTS[mode];
}
