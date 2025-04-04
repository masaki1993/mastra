import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const VIDEO_DIR = path.join(process.cwd(), 'temp_videos');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

const PLATFORM_SPECS = {
  instagram_reel: {
    aspectRatio: '9:16',
    recommendedResolution: '1080x1920',
    maxDuration: 90, // seconds
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    maxFileSize: 4000, // MB
  },
  tiktok: {
    aspectRatio: '9:16',
    recommendedResolution: '1080x1920',
    maxDuration: 180, // seconds
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    maxFileSize: 500, // MB
  },
  instagram_post: {
    aspectRatio: '1:1',
    recommendedResolution: '1080x1080',
    maxDuration: 60, // seconds
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    maxFileSize: 4000, // MB
  },
};

/**
 * Create a video from images and audio
 */
export const createVideoToolDef = createTool({
  id: 'createVideoToolDef',
  description: 'Create a video from images and audio for social media',
  inputSchema: z.object({
    imagesPaths: z.array(z.string()).describe('Paths to image files to include in the video'),
    audioPath: z.string().optional().describe('Path to audio file for the video soundtrack'),
    outputFileName: z.string().optional().describe('Name for the output file (without extension)'),
    platform: z.enum(['instagram_reel', 'tiktok', 'instagram_post']).default('instagram_reel').describe('Target platform'),
    duration: z.number().optional().describe('Total video duration in seconds'),
    transitionEffect: z.enum(['fade', 'slide', 'zoom', 'none']).default('fade').describe('Transition effect between images'),
    addWatermark: z.boolean().default(false).describe('Add watermark to the video'),
    watermarkText: z.string().optional().describe('Text to use as watermark'),
    addCaption: z.boolean().default(false).describe('Add caption to the video'),
    captionText: z.string().optional().describe('Text to use as caption'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    fileSize: z.number(),
    duration: z.number(),
    resolution: z.string(),
    format: z.string(),
    platform: z.string(),
  }),
  execute: async ({ context }) => {
    const { 
      imagesPaths, 
      audioPath, 
      outputFileName, 
      platform, 
      duration = 30, 
      transitionEffect,
      addWatermark,
      watermarkText,
      addCaption,
      captionText
    } = context;
    
    try {
      const timestamp = Date.now();
      const defaultFileName = outputFileName ? `${outputFileName}.mp4` : `video_${platform}_${timestamp}.mp4`;
      const filePath = path.join(VIDEO_DIR, defaultFileName);
      
      const specs = PLATFORM_SPECS[platform];
      
      fs.writeFileSync(filePath, 'dummy video data');
      
      
      /*
      const ffmpegCommand = [
        'ffmpeg',
        '-y',  // Overwrite output file if it exists
        '-framerate', `${imagesPaths.length / duration}`,  // Calculate framerate based on duration
        '-pattern_type', 'glob',
        '-i', imagesPaths.join(','),
        ...(audioPath ? ['-i', audioPath, '-c:a', 'aac', '-shortest'] : []),
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-vf', `scale=${specs.recommendedResolution.replace('x', ':')}`,
        ...(addWatermark ? ['-vf', `drawtext=text='${watermarkText}':x=10:y=10:fontsize=24:fontcolor=white@0.5`] : []),
        ...(addCaption ? ['-vf', `drawtext=text='${captionText}':x=(w-text_w)/2:y=(h-text_h-10):fontsize=24:fontcolor=white`] : []),
        filePath
      ];
      
      const { stdout, stderr } = await exec(ffmpegCommand.join(' '));
      */
      
      return {
        filePath,
        fileSize: 15000000, // Dummy 15MB file size
        duration,
        resolution: specs.recommendedResolution,
        format: specs.recommendedFormat,
        platform,
      };
    } catch (error: any) {
      throw new Error(`Error creating video: ${error.message}`);
    }
  },
});

/**
 * Add text overlays to a video
 */
export const addTextOverlayToolDef = createTool({
  id: 'addTextOverlayToolDef',
  description: 'Add text overlays to a video',
  inputSchema: z.object({
    videoPath: z.string().describe('Path to the video file'),
    outputFileName: z.string().optional().describe('Name for the output file (without extension)'),
    textOverlays: z.array(z.object({
      text: z.string().describe('Text to overlay'),
      startTime: z.number().describe('Start time in seconds'),
      endTime: z.number().describe('End time in seconds'),
      position: z.enum(['top', 'center', 'bottom']).default('bottom').describe('Vertical position'),
      fontSize: z.number().default(24).describe('Font size'),
      fontColor: z.string().default('white').describe('Font color'),
      backgroundColor: z.string().optional().describe('Background color for text'),
    })).describe('Text overlays to add to the video'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    fileSize: z.number(),
    duration: z.number(),
  }),
  execute: async ({ context }) => {
    const { videoPath, outputFileName, textOverlays } = context;
    
    try {
      const timestamp = Date.now();
      const defaultFileName = outputFileName ? `${outputFileName}.mp4` : `text_overlay_${timestamp}.mp4`;
      const filePath = path.join(VIDEO_DIR, defaultFileName);
      
      fs.writeFileSync(filePath, 'dummy video with text overlays');
      
      
      /*
      const textFilters = textOverlays.map((overlay, index) => {
        const yPosition = overlay.position === 'top' ? 10 : 
                         overlay.position === 'center' ? '(h-text_h)/2' : 
                         '(h-text_h-10)';
        
        const bgProperty = overlay.backgroundColor ? 
          `:box=1:boxcolor=${overlay.backgroundColor}:boxborderw=5` : '';
        
        return `drawtext=text='${overlay.text}':x=(w-text_w)/2:y=${yPosition}:fontsize=${overlay.fontSize}:fontcolor=${overlay.fontColor}${bgProperty}:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
      }).join(',');
      
      const ffmpegCommand = [
        'ffmpeg',
        '-y',  // Overwrite output file if it exists
        '-i', videoPath,
        '-vf', textFilters,
        '-c:a', 'copy',  // Copy audio stream without re-encoding
        filePath
      ];
      
      const { stdout, stderr } = await exec(ffmpegCommand.join(' '));
      */
      
      return {
        filePath,
        fileSize: 20000000, // Dummy 20MB file size
        duration: 30, // Dummy 30 seconds duration
      };
    } catch (error: any) {
      throw new Error(`Error adding text overlays: ${error.message}`);
    }
  },
});

/**
 * Optimize video for social media platforms
 */
export const optimizeVideoToolDef = createTool({
  id: 'optimizeVideoToolDef',
  description: 'Optimize a video for specific social media platforms',
  inputSchema: z.object({
    videoPath: z.string().describe('Path to the video file'),
    outputFileName: z.string().optional().describe('Name for the output file (without extension)'),
    platform: z.enum(['instagram_reel', 'tiktok', 'instagram_post']).describe('Target platform'),
    quality: z.enum(['low', 'medium', 'high']).default('high').describe('Output quality'),
    addIntro: z.boolean().default(false).describe('Add intro sequence'),
    addOutro: z.boolean().default(false).describe('Add outro sequence'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    fileSize: z.number(),
    duration: z.number(),
    resolution: z.string(),
    format: z.string(),
    platform: z.string(),
    originalSize: z.number(),
    compressionRatio: z.number(),
  }),
  execute: async ({ context }) => {
    const { videoPath, outputFileName, platform, quality, addIntro, addOutro } = context;
    
    try {
      const specs = PLATFORM_SPECS[platform];
      
      const timestamp = Date.now();
      const defaultFileName = outputFileName ? `${outputFileName}.mp4` : `optimized_${platform}_${timestamp}.mp4`;
      const filePath = path.join(VIDEO_DIR, defaultFileName);
      
      fs.writeFileSync(filePath, 'dummy optimized video data');
      
      const originalSize = fs.existsSync(videoPath) ? fs.statSync(videoPath).size : 50000000;
      
      const qualityMultiplier = quality === 'low' ? 0.4 : quality === 'medium' ? 0.6 : 0.8;
      const optimizedSize = Math.floor(originalSize * qualityMultiplier);
      
      
      /*
      const crfValue = quality === 'low' ? 28 : quality === 'medium' ? 23 : 18;
      
      let ffmpegCommand = [
        'ffmpeg',
        '-y',  // Overwrite output file if it exists
      ];
      
      if (addIntro) {
        ffmpegCommand = [
          ...ffmpegCommand,
          '-i', 'path/to/intro.mp4',
        ];
      }
      
      ffmpegCommand = [
        ...ffmpegCommand,
        '-i', videoPath,
      ];
      
      if (addOutro) {
        ffmpegCommand = [
          ...ffmpegCommand,
          '-i', 'path/to/outro.mp4',
        ];
      }
      
      if (addIntro || addOutro) {
        let filterComplex = '';
        let inputCount = 0;
        let concatParts = [];
        
        if (addIntro) {
          filterComplex += `[${inputCount}:v]scale=${specs.recommendedResolution.replace('x', ':')}[v${inputCount}];`;
          concatParts.push(`[v${inputCount}][${inputCount}:a]`);
          inputCount++;
        }
        
        filterComplex += `[${inputCount}:v]scale=${specs.recommendedResolution.replace('x', ':')}[v${inputCount}];`;
        concatParts.push(`[v${inputCount}][${inputCount}:a]`);
        inputCount++;
        
        if (addOutro) {
          filterComplex += `[${inputCount}:v]scale=${specs.recommendedResolution.replace('x', ':')}[v${inputCount}];`;
          concatParts.push(`[v${inputCount}][${inputCount}:a]`);
          inputCount++;
        }
        
        filterComplex += `${concatParts.join('')}concat=n=${inputCount}:v=1:a=1[outv][outa]`;
        
        ffmpegCommand = [
          ...ffmpegCommand,
          '-filter_complex', filterComplex,
          '-map', '[outv]',
          '-map', '[outa]',
        ];
      } else {
        ffmpegCommand = [
          ...ffmpegCommand,
          '-vf', `scale=${specs.recommendedResolution.replace('x', ':')}`,
        ];
      }
      
      ffmpegCommand = [
        ...ffmpegCommand,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', crfValue.toString(),
        '-c:a', 'aac',
        '-b:a', '128k',
        filePath
      ];
      
      const { stdout, stderr } = await exec(ffmpegCommand.join(' '));
      */
      
      return {
        filePath,
        fileSize: optimizedSize,
        duration: 30, // Dummy 30 seconds duration
        resolution: specs.recommendedResolution,
        format: specs.recommendedFormat,
        platform,
        originalSize,
        compressionRatio: originalSize / optimizedSize,
      };
    } catch (error: any) {
      throw new Error(`Error optimizing video: ${error.message}`);
    }
  },
});

/**
 * Generate video captions/subtitles from audio
 */
export const generateCaptionsToolDef = createTool({
  id: 'generateCaptionsToolDef',
  description: 'Generate captions/subtitles for a video from its audio',
  inputSchema: z.object({
    videoPath: z.string().describe('Path to the video file'),
    language: z.string().default('en').describe('Language code for transcription'),
    outputFormat: z.enum(['srt', 'vtt', 'ass']).default('srt').describe('Caption file format'),
    outputFileName: z.string().optional().describe('Name for the output file (without extension)'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    wordCount: z.number(),
    duration: z.number(),
    language: z.string(),
    format: z.string(),
  }),
  execute: async ({ context }) => {
    const { videoPath, language, outputFormat, outputFileName } = context;
    
    try {
      const timestamp = Date.now();
      const defaultFileName = outputFileName ? `${outputFileName}.${outputFormat}` : `captions_${timestamp}.${outputFormat}`;
      const filePath = path.join(VIDEO_DIR, defaultFileName);
      
      let dummyCaptions = '';
      
      if (outputFormat === 'srt') {
        dummyCaptions = `1
00:00:00,000 --> 00:00:03,000
こんにちは、えすこーとの送迎サービスについてご紹介します。

2
00:00:03,500 --> 00:00:07,000
私たちは子供の安全を第一に考えた送迎サービスを提供しています。

3
00:00:07,500 --> 00:00:12,000
専門のドライバーが学校から習い事まで安全にお子様を送迎します。`;
      } else if (outputFormat === 'vtt') {
        dummyCaptions = `WEBVTT

00:00:00.000 --> 00:00:03.000
こんにちは、えすこーとの送迎サービスについてご紹介します。

00:00:03.500 --> 00:00:07.000
私たちは子供の安全を第一に考えた送迎サービスを提供しています。

00:00:07.500 --> 00:00:12.000
専門のドライバーが学校から習い事まで安全にお子様を送迎します。`;
      } else {
        dummyCaptions = `[Script Info]
Title: Escort Service Captions
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:03.00,Default,,0,0,0,,こんにちは、えすこーとの送迎サービスについてご紹介します。
Dialogue: 0,0:00:03.50,0:00:07.00,Default,,0,0,0,,私たちは子供の安全を第一に考えた送迎サービスを提供しています。
Dialogue: 0,0:00:07.50,0:00:12.00,Default,,0,0,0,,専門のドライバーが学校から習い事まで安全にお子様を送迎します。`;
      }
      
      fs.writeFileSync(filePath, dummyCaptions);
      
      
      return {
        filePath,
        wordCount: 30, // Dummy word count
        duration: 12, // Dummy 12 seconds duration
        language,
        format: outputFormat,
      };
    } catch (error: any) {
      throw new Error(`Error generating captions: ${error.message}`);
    }
  },
});

export const videoTools = {
  createVideoToolDef,
  addTextOverlayToolDef,
  optimizeVideoToolDef,
  generateCaptionsToolDef,
};
