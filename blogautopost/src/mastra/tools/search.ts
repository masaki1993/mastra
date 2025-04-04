import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getJson } from 'serpapi';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Use an absolute path to load the .env file from project root
const rootDir = path.resolve(process.cwd());
const envPath = path.join(rootDir, '.env');

// Check if .env file exists and load it
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded .env from ${envPath}`);
} else {
  console.warn(`No .env file found at ${envPath}`);
}

/**
 * Search tool that allows querying the web using SerpAPI
 * This tool leverages SerpAPI to perform web searches and return structured results
 */
export const searchTool = createTool({
  id: 'searchTool',
  description:
    'Search the web using Google via SerpAPI. Returns search results with title, link, and snippet for each result.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    num_results: z.number().optional().default(10).describe('Number of results to return (max 10)'),
    search_type: z.enum(['web', 'news', 'images']).optional().default('web').describe('Type of search to perform'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        position: z.number().optional(),
        title: z.string().optional(),
        link: z.string().optional(),
        snippet: z.string().optional(),
        displayed_link: z.string().optional(),
      }),
    ),
    search_metadata: z.object({
      status: z.string().optional(),
      processed_at: z.string().optional(),
      total_time_taken: z.number().optional(),
    }),
  }),
  execute: async ({ context }) => {
    const { query, num_results, search_type } = context;

    // Try to get API key from environment variables first, then use fallback
    const apiKey = process.env.SERPAPI_API_KEY || 'e23a9f9c78c4e87b44054a4a52a17ff3de17abe4dc85dc4e271e8dbdc7907208';

    try {
      const params: any = {
        q: query,
        api_key: apiKey,
        num: num_results || 10,
      };

      switch (search_type) {
        case 'news':
          params.tbm = 'nws'; // This is SerpAPI's parameter for news search
          break;
        case 'images':
          params.tbm = 'isch'; // This is SerpAPI's parameter for image search
          break;
        default:
          break;
      }

      const data = await getJson('google', params);

      let results: any[] = [];

      if (search_type === 'images' && data.images_results) {
        results = data.images_results.slice(0, num_results).map((img: any, index: number) => ({
          position: index + 1,
          title: img.title || '',
          link: img.original || img.thumbnail,
          snippet: img.snippet || '',
          displayed_link: img.source || '',
        }));
      } else if (search_type === 'news' && data.news_results) {
        results = data.news_results.slice(0, num_results).map((news: any, index: number) => ({
          position: index + 1,
          title: news.title || '',
          link: news.link || '',
          snippet: news.snippet || '',
          displayed_link: news.source || '',
        }));
      } else if (data.organic_results) {
        results = data.organic_results.slice(0, num_results).map((result: any, index: number) => ({
          position: index + 1,
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          displayed_link: result.displayed_link || '',
        }));
      }

      return {
        results,
        search_metadata: {
          status: data.search_metadata?.status || 'Success',
          processed_at: data.search_metadata?.processed_at || new Date().toISOString(),
          total_time_taken: data.search_metadata?.total_time_taken || 0,
        },
      };
    } catch (error: any) {
      throw new Error(`Error performing search: ${error.message}`);
    }
  },
});

export const searchTools = {
  searchTool,
};
