import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import WPAPI from 'wpapi';

const wp = new WPAPI({
  endpoint: 'https://pre-e-s-court.com/wp-json',
  username: 'yujiro',
  password: 'Bluecheese09',
  auth: true
});

wp.setHeaders('Authorization', 'Basic ' + Buffer.from('yujiro:uKzz dlJA 6HhZ bIZG 3ic4 mtPb').toString('base64'));

const TEMP_IMAGE_DIR = path.join(process.cwd(), 'temp_images');

if (!fs.existsSync(TEMP_IMAGE_DIR)) {
  fs.mkdirSync(TEMP_IMAGE_DIR, { recursive: true });
}

export const searchImagesToolDef = createTool({
  id: 'searchImagesToolDef',
  description: 'Search for free-to-use images related to a keyword',
  inputSchema: z.object({
    keyword: z.string().describe('The keyword to search images for'),
    limit: z.number().default(5).describe('Maximum number of images to return'),
  }),
  outputSchema: z.array(z.object({
    url: z.string(),
    title: z.string().optional(),
    source: z.string().optional(),
    thumbnailUrl: z.string().optional(),
  })),
  execute: async ({ context }) => {
    const { keyword, limit } = context;
    
    try {
      return Array(limit).fill(null).map((_, index) => ({
        url: `https://example.com/image-${index + 1}.jpg`,
        title: `${keyword} image ${index + 1}`,
        source: 'Example Image Source',
        thumbnailUrl: `https://example.com/thumbnail-${index + 1}.jpg`,
      }));
      
    } catch (error: any) {
      throw new Error(`Error searching for images: ${error.message}`);
    }
  },
});

export const optimizeImageToolDef = createTool({
  id: 'optimizeImageToolDef',
  description: 'Download and optimize an image for web use',
  inputSchema: z.object({
    imageUrl: z.string().describe('URL of the image to download and optimize'),
    fileName: z.string().optional().describe('Name to save the file as (optional)'),
    width: z.number().optional().describe('Target width for resizing'),
    quality: z.number().default(80).describe('JPEG quality (1-100)'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    originalSize: z.number(),
    optimizedSize: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  execute: async ({ context }) => {
    const { imageUrl, fileName, width, quality } = context;
    
    try {
      const timestamp = Date.now();
      const defaultFileName = fileName || `image-${timestamp}.jpg`;
      const filePath = path.join(TEMP_IMAGE_DIR, defaultFileName);
      
      fs.writeFileSync(filePath, 'dummy image data');
      
      return {
        filePath,
        originalSize: 1024000, // 1MB
        optimizedSize: 512000, // 500KB
        width: width || 1200,
        height: 800,
      };
      
      // 
      // 
      // 
      // 
    } catch (error: any) {
      throw new Error(`Error optimizing image: ${error.message}`);
    }
  },
});

export const uploadImageToWpToolDef = createTool({
  id: 'uploadImageToWpToolDef',
  description: 'Upload an image to WordPress as media',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the image file'),
    title: z.string().optional().describe('Title for the media'),
    caption: z.string().optional().describe('Caption for the media'),
    altText: z.string().optional().describe('Alternative text for the media'),
  }),
  outputSchema: z.object({
    id: z.number(),
    url: z.string(),
    title: z.object({
      rendered: z.string(),
    }),
    alt_text: z.string().optional(),
    media_details: z.object({
      width: z.number(),
      height: z.number(),
      sizes: z.record(z.any()).optional(),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const { filePath, title, caption, altText } = context;
    
    try {
      return {
        id: 12345,
        url: 'https://pre-e-s-court.com/wp-content/uploads/2023/01/example-image.jpg',
        title: {
          rendered: title || 'Example Image',
        },
        alt_text: altText || '',
        media_details: {
          width: 1200,
          height: 800,
          sizes: {
            thumbnail: {
              width: 150,
              height: 150,
              url: 'https://pre-e-s-court.com/wp-content/uploads/2023/01/example-image-150x150.jpg',
            },
            medium: {
              width: 300,
              height: 200,
              url: 'https://pre-e-s-court.com/wp-content/uploads/2023/01/example-image-300x200.jpg',
            },
          },
        },
      };
      
      // 
      // 
    } catch (error: any) {
      throw new Error(`Error uploading image to WordPress: ${error.message}`);
    }
  },
});

export const setFeaturedImageToolDef = createTool({
  id: 'setFeaturedImageToolDef',
  description: 'Set a featured image for a WordPress post',
  inputSchema: z.object({
    postId: z.number().describe('ID of the post'),
    imageId: z.number().describe('ID of the media to set as featured image'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    post_id: z.number(),
    featured_media: z.number(),
  }),
  execute: async ({ context }) => {
    const { postId, imageId } = context;
    
    try {
      return {
        success: true,
        post_id: postId,
        featured_media: imageId,
      };
      
      // 
    } catch (error: any) {
      throw new Error(`Error setting featured image: ${error.message}`);
    }
  },
});

export const imageTools = {
  searchImagesToolDef,
  optimizeImageToolDef,
  uploadImageToWpToolDef,
  setFeaturedImageToolDef,
};
