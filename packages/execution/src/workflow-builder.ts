import { getStepFactory, type StepFactory, type StepContext } from './step-registry.js';

export interface WorkflowStepConfig {
  stepType: string;
  agentId: string;
  config: Record<string, any>;
}

export interface WorkflowConfig {
  name: string;
  orgId: string;
  projectId: string;
  steps: WorkflowStepConfig[];
}

export interface WorkflowStepResult {
  stepId: string;
  output: any;
  durationMs: number;
  error?: string;
}

export interface WorkflowResult {
  name: string;
  steps: WorkflowStepResult[];
  success: boolean;
  totalDurationMs: number;
}

export interface RunnableWorkflow {
  name: string;
  stepCount: number;
  run: (input: any) => Promise<WorkflowResult>;
}

export function buildWorkflow(config: WorkflowConfig): RunnableWorkflow {
  const resolvedSteps: Array<{ factory: StepFactory; stepConfig: WorkflowStepConfig }> = [];

  for (const stepCfg of config.steps) {
    const factory = getStepFactory(stepCfg.stepType);
    resolvedSteps.push({ factory, stepConfig: stepCfg });
  }

  return {
    name: config.name,
    stepCount: resolvedSteps.length,
    run: async (input: any) => {
      const results: WorkflowStepResult[] = [];
      let currentInput = input;
      let allSuccess = true;
      const workflowStart = Date.now();

      for (const { factory, stepConfig } of resolvedSteps) {
        const stepStart = Date.now();
        const context: StepContext = {
          agentId: stepConfig.agentId,
          orgId: config.orgId,
          projectId: config.projectId,
          config: stepConfig.config,
        };

        try {
          const output = await factory.execute(currentInput, context);
          results.push({
            stepId: factory.id,
            output,
            durationMs: Date.now() - stepStart,
          });
          currentInput = { ...currentInput, ...output };
        } catch (err) {
          allSuccess = false;
          results.push({
            stepId: factory.id,
            output: null,
            durationMs: Date.now() - stepStart,
            error: err instanceof Error ? err.message : String(err),
          });
          break;
        }
      }

      return {
        name: config.name,
        steps: results,
        success: allSuccess,
        totalDurationMs: Date.now() - workflowStart,
      };
    },
  };
}
