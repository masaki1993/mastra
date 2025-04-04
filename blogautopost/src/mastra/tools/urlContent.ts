import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Tool to fetch content from a URL and extract relevant information
 */
export const urlContentTool = createTool({
  id: 'urlContentTool',
  description: 'Fetches content from a URL and extracts the main text, title, and metadata.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to fetch content from'),
    selector: z.string().optional().describe('Optional CSS selector to extract specific content'),
    extractImages: z.boolean().optional().default(false).describe('Whether to extract image URLs'),
    extractLinks: z.boolean().optional().default(false).describe('Whether to extract links'),
  }),
  outputSchema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    content: z.string(),
    metadata: z.record(z.string(), z.string()).optional(),
    images: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          url: z.string(),
          text: z.string(),
        }),
      )
      .optional(),
  }),
  execute: async ({ context }) => {
    const { url, selector, extractImages, extractLinks } = context;

    try {
      console.log(`Fetching content from URL: ${url}`);

      // Fetch the webpage content
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract metadata
      const metadata: Record<string, string> = {};
      $('meta').each((_, element: any) => {
        const name = $(element).attr('name') || $(element).attr('property');
        const content = $(element).attr('content');
        if (name && content) {
          metadata[name] = content;
        }
      });

      // Extract title
      const title = $('title').text().trim() || metadata['og:title'] || '';

      // Extract description
      const description = metadata['description'] || metadata['og:description'] || '';

      // Extract main content
      let content: string;
      if (selector) {
        // Use the provided selector
        content = $(selector).text().trim();
      } else {
        // Extract what seems to be the main content
        // Remove script, style, and nav elements
        $('script, style, nav, header, footer, .header, .footer, .nav, .sidebar, .ad, .advertisement').remove();

        // Select main content containers
        const mainContent = $('main, article, .content, .main, #content, #main, .article, .post, .entry');

        if (mainContent.length > 0) {
          content = mainContent.text().trim();
        } else {
          // Fallback to body content
          content = $('body').text().trim();
        }

        // Clean up whitespace
        content = content.replace(/\s+/g, ' ').trim();
      }

      // Extract images if requested
      let images: string[] | undefined;
      if (extractImages) {
        images = [];
        $('img').each((_: number, element: any) => {
          const src = $(element).attr('src');
          if (src) {
            // Convert relative URLs to absolute
            const imageUrl = new URL(src, url).href;
            images!.push(imageUrl);
          }
        });
      }

      // Extract links if requested
      let links: { url: string; text: string }[] | undefined;
      if (extractLinks) {
        links = [];
        $('a').each((_: number, element: any) => {
          const href = $(element).attr('href');
          const text = $(element).text().trim();
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            // Convert relative URLs to absolute
            try {
              const linkUrl = new URL(href, url).href;
              links!.push({ url: linkUrl, text });
            } catch (error) {
              // Skip invalid URLs
            }
          }
        });
      }

      return {
        title,
        description,
        content,
        metadata,
        images,
        links,
      };
    } catch (error: any) {
      throw new Error(`Error fetching URL content: ${error.message}`);
    }
  },
});

export const urlTools = {
  urlContentTool,
};
