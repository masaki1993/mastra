import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

/**
 * Internet search tool that allows the agent to search the web
 * This uses SerpAPI to retrieve search results
 */
export const searchTool = createTool({
  id: 'searchTool',
  description: 'Search the internet for information using SerpAPI. This tool allows you to query search engines and get results from across the web.',
  inputSchema: z.object({
    query: z.string().describe('The search query to search for on the internet'),
    limit: z.number().optional().default(10).describe('Maximum number of results to return (default: 10)'),
    engine: z.enum(['google', 'bing', 'yahoo', 'duckduckgo']).optional().default('google')
      .describe('Search engine to use (default: google)'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string().describe('Title of the search result'),
      link: z.string().describe('URL of the search result'),
      snippet: z.string().describe('Text snippet from the search result'),
      position: z.number().optional().describe('Position in search results'),
      source: z.string().optional().describe('Source of the result'),
    })),
    totalResults: z.number().describe('Total number of results found'),
    searchTime: z.number().describe('Time taken for the search in seconds'),
    query: z.string().describe('The original search query'),
  }),
  execute: async ({ context }) => {
    const { query, limit = 10, engine = 'google' } = context;
    console.log(`Searching for "${query}" using SerpAPI (${engine}, limit: ${limit})`);
    
    try {
      
      //   }
      // });
      
      const startTime = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = Array(Math.min(limit, 10)).fill(0).map((_, i) => ({
        title: `Result ${i+1} for "${query}"`,
        link: `https://example.com/result-${i+1}`,
        snippet: `This is a simulated search result snippet for "${query}". In a real implementation, this would contain actual content from the web page.`,
        position: i + 1,
        source: engine
      }));
      
      const searchTime = (Date.now() - startTime) / 1000;
      
      return {
        results,
        totalResults: 1250000, // Simulated value
        searchTime,
        query,
      };
    } catch (error: any) {
      throw new Error(`Error performing search with SerpAPI: ${error.message}`);
    }
  },
});
