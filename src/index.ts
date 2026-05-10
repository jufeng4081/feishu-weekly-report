import {
  basekit,
  FieldType,
  FieldComponent,
  FieldCode,
} from '@lark-opdev/block-basekit-server-api';
import { callDeepSeek, extractJSON } from './ai';
import { MODE_OPTIONS, MODEL_OPTIONS, getPrompt, ReportMode } from './prompts';

basekit.addDomainList(['api.deepseek.com']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        field_name: '周报/日报生成',
        api_key: 'DeepSeek API Key',
        api_key_placeholder: '请输入你的 DeepSeek API Key',
        source_field: '工作记录字段',
        report_mode: '报告类型',
        model: 'AI 模型',
        no_api_key: '请先配置 DeepSeek API Key',
        no_input: '（请先输入工作记录）',
        ai_error: '生成失败',
        result_completed: '✅ 完成事项',
        result_in_progress: '🔄 进行中',
        result_todo: '📋 待办事项',
        result_problems: '⚠️ 问题',
        result_summary: '📝 总结',
        result_achievements: '🏆 主要成果',
        result_plan: '📅 下周计划',
        result_highlights: '⭐ 亮点',
        result_period: '📌 时间段',
        result_energy: '⚡ 状态',
        result_overall: '📊 总体评价',
      },
      'en-US': {
        field_name: 'Report Generator',
        api_key: 'DeepSeek API Key',
        api_key_placeholder: 'Enter your DeepSeek API Key',
        source_field: 'Work Records',
        report_mode: 'Report Type',
        model: 'AI Model',
        no_api_key: 'Please configure your DeepSeek API Key',
        no_input: '(Please enter work records)',
        ai_error: 'Generation failed',
        result_completed: '✅ Completed',
        result_in_progress: '🔄 In Progress',
        result_todo: '📋 To Do',
        result_problems: '⚠️ Issues',
        result_summary: '📝 Summary',
        result_achievements: '🏆 Achievements',
        result_plan: '📅 Next Week Plan',
        result_highlights: '⭐ Highlights',
        result_period: '📌 Period',
        result_energy: '⚡ Energy',
        result_overall: '📊 Overall',
      },
    },
  },
  formItems: [
    {
      key: 'apiKey',
      label: 'api_key',
      component: FieldComponent.Input,
      props: { placeholder: 'api_key_placeholder' },
      validator: { required: true },
    },
    {
      key: 'sourceField',
      label: 'source_field',
      component: FieldComponent.FieldSelect,
      props: { supportType: [FieldType.Text] },
      validator: { required: true },
    },
    {
      key: 'reportMode',
      label: 'report_mode',
      component: FieldComponent.SingleSelect,
      props: { options: MODE_OPTIONS },
      validator: { required: true },
    },
    {
      key: 'model',
      label: 'model',
      component: FieldComponent.SingleSelect,
      props: { options: MODEL_OPTIONS },
      validator: { required: true },
    },
  ],
  resultType: { type: FieldType.Text },
  execute: async (formItemParams: Record<string, any>, context: any) => {
    const logID = context?.logID || '未知';
    try {
      const apiKey: string = formItemParams.apiKey || '';
      const sourceValue: string = formItemParams.sourceField ?? '';
      const mode: ReportMode = formItemParams.reportMode || 'daily';
      const model: string = formItemParams.model || 'deepseek-chat';

      if (!apiKey) return { code: FieldCode.Success, data: '⚠️ 请先配置 DeepSeek API Key' };
      if (!sourceValue) return { code: FieldCode.Success, data: '（请先输入工作记录）' };

      const systemPrompt = getPrompt(mode);
      const result = await callDeepSeek(systemPrompt, String(sourceValue), { apiKey, model });

      if (!result.success) {
        return { code: FieldCode.Error, data: `⚠️ ${result.error}` };
      }

      const parsed = extractJSON(result.data!);
      const formatted = formatResult(parsed, mode);
      return { code: FieldCode.Success, data: formatted };
    } catch (err: any) {
      return { code: FieldCode.Error, data: `⚠️ 生成异常: ${err.message || '未知错误'}` };
    }
  },
});

function formatResult(parsed: any, mode: ReportMode): string {
  if (!parsed) return '⚠️ AI 返回格式异常，请重试';

  const lines: string[] = [];

  if (parsed.period) lines.push(`📌 ${parsed.period}`);
  if (parsed.date) lines.push(`📅 ${parsed.date}`);
  if (parsed.weekRange) lines.push(`📅 ${parsed.weekRange}`);

  if (parsed.completed?.length) {
    lines.push('\n✅ 完成事项:');
    parsed.completed.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (parsed.inProgress?.length) {
    lines.push('\n🔄 进行中:');
    parsed.inProgress.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (mode === 'weekly' && parsed.achievements?.length) {
    lines.push('\n🏆 主要成果:');
    parsed.achievements.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (parsed.todo?.length) {
    lines.push('\n📋 待办:');
    parsed.todo.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (mode === 'weekly' && parsed.plan?.length) {
    lines.push('\n📅 下周计划:');
    parsed.plan.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (parsed.problems?.length) {
    lines.push('\n⚠️ 问题:');
    parsed.problems.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (parsed.highlights?.length) {
    lines.push('\n⭐ 亮点:');
    parsed.highlights.forEach((item: string) => lines.push(`  • ${item}`));
  }
  if (parsed.energy) lines.push(`\n⚡ 状态: ${parsed.energy}`);
  if (parsed.overall) lines.push(`📊 总体评价: ${parsed.overall}`);
  if (parsed.summary) lines.push(`\n📝 ${parsed.summary}`);

  return lines.join('\n') || '⚠️ 生成结果为空，请重试';
}

export default basekit;
