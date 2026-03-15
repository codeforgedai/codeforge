import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface ClaudeSdkConfig {
  cwd: string;
  maxTurns: number;
  allowedTools: string[];
  env?: Record<string, string>;
}

export interface ClaudeSdkResult {
  output: string;
  toolResults: any[];
  messages: any[];
}

export async function executeClaudeSdk(
  prompt: string,
  config: ClaudeSdkConfig,
): Promise<ClaudeSdkResult> {
  const args = [
    '--print',
    '--max-turns', String(config.maxTurns),
    '--output-format', 'json',
  ];

  for (const tool of config.allowedTools) {
    args.push('--allowedTools', tool);
  }

  args.push(prompt);

  const env = {
    ...process.env,
    ...config.env,
  };

  try {
    const { stdout } = await execFileAsync('claude', args, {
      cwd: config.cwd,
      env,
      maxBuffer: 10 * 1024 * 1024,
    });

    let parsed: any;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return {
        output: stdout,
        toolResults: [],
        messages: [],
      };
    }

    const output = parsed.result ?? parsed.text ?? stdout;
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    const toolResults = messages.filter((m: any) => m.type === 'tool_result' || m.role === 'tool');

    return { output, toolResults, messages };
  } catch (err) {
    return {
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
      toolResults: [],
      messages: [],
    };
  }
}
