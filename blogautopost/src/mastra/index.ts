import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

import {
  weatherAgent,
  contentPlannerAgent,
  blogWriterAgent,
  editorAgent,
  contentPublisherAgent,
  browserAgent,
} from './agents';
import { escortBlogWorkflow } from './workflows/blogWorkflow';
import { browserWorkflow } from './workflows/browserWorkflow';

// Load environment variables early - this needs to be first
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try to load from multiple locations to ensure the .env is found
const possibleEnvPaths = [path.join(process.cwd(), '.env'), path.join(process.cwd(), 'src', 'mastra', '.env'), '.env'];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded .env from ${envPath}`);
    break;
  }
}

// Explicitly inject the SERPAPI_API_KEY into process.env
if (!process.env.SERPAPI_API_KEY) {
  process.env.SERPAPI_API_KEY = 'e23a9f9c78c4e87b44054a4a52a17ff3de17abe4dc85dc4e271e8dbdc7907208';
  console.log('Manually set SERPAPI_API_KEY from hardcoded value');
}

export const mastra = new Mastra({
  agents: {
    weatherAgent,
    contentPlannerAgent,
    blogWriterAgent,
    editorAgent,
    contentPublisherAgent,
    browserAgent,
  },
  workflows: {
    escortBlogWorkflow,
    browserWorkflow,
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// Browser automation exports
export * from './mcp';
export { browserTool } from './tools';
export { browserAgent, createBrowserAgentWithMCP } from './agents/browserAgent';
export { browserWorkflow } from './workflows/browserWorkflow';

// Export search and url content tools
export * from './tools/search';
export * from './tools/urlContent';
