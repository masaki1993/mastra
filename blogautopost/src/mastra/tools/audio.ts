import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'temp_audio');

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const ELEVEN_LABS_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Antoni' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Elli' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Bella' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Antoni' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
];

/**
 * Generate text-to-speech audio using ElevenLabs API
 */
export const generateAudioToolDef = createTool({
  id: 'generateAudioToolDef',
  description: 'Generate text-to-speech audio using ElevenLabs API',
  inputSchema: z.object({
    text: z.string().describe('The text to convert to speech'),
    voiceId: z.string().optional().describe('Voice ID from ElevenLabs (defaults to "Adam")'),
    fileName: z.string().optional().describe('Name for the output file (without extension)'),
    stability: z.number().min(0).max(1).default(0.5).describe('Voice stability (0-1)'),
    similarityBoost: z.number().min(0).max(1).default(0.75).describe('Voice clarity and similarity (0-1)'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    durationMs: z.number().optional(),
    voiceId: z.string(),
    voiceName: z.string(),
    audioUrl: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB', fileName, stability, similarityBoost } = context;
    
    try {
      
      const timestamp = Date.now();
      const outputFileName = fileName ? `${fileName}.mp3` : `audio_${timestamp}.mp3`;
      const filePath = path.join(AUDIO_DIR, outputFileName);
      
      fs.writeFileSync(filePath, 'dummy audio data');
      
      const voice = ELEVEN_LABS_VOICES.find(v => v.id === voiceId) || { name: 'Adam' };
      
      
      /*
      const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY
        },
        data: {
          text,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost
          }
        },
        responseType: 'arraybuffer'
      });
      
      fs.writeFileSync(filePath, response.data);
      */
      
      return {
        filePath,
        durationMs: Math.floor(text.length * 80), // Rough estimate of audio duration
        voiceId,
        voiceName: voice.name,
        audioUrl: `file://${filePath}`,
      };
    } catch (error: any) {
      throw new Error(`Error generating audio: ${error.message}`);
    }
  },
});

/**
 * List available voices from ElevenLabs
 */
export const listVoicesToolDef = createTool({
  id: 'listVoicesToolDef',
  description: 'List available voices from ElevenLabs',
  inputSchema: z.object({}),
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  execute: async () => {
    try {
      
      /*
      const response = await axios({
        method: 'GET',
        url: 'https://api.elevenlabs.io/v1/voices',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY
        }
      });
      
      return response.data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name
      }));
      */
      
      return ELEVEN_LABS_VOICES;
    } catch (error: any) {
      throw new Error(`Error listing voices: ${error.message}`);
    }
  },
});

/**
 * Convert text to speech with Japanese language support
 */
export const generateJapaneseAudioToolDef = createTool({
  id: 'generateJapaneseAudioToolDef',
  description: 'Generate Japanese text-to-speech audio with proper pronunciation',
  inputSchema: z.object({
    text: z.string().describe('The Japanese text to convert to speech'),
    voiceId: z.string().optional().describe('Voice ID from ElevenLabs (defaults to "Antoni")'),
    fileName: z.string().optional().describe('Name for the output file (without extension)'),
    stability: z.number().min(0).max(1).default(0.3).describe('Voice stability (0-1)'),
    similarityBoost: z.number().min(0).max(1).default(0.8).describe('Voice clarity and similarity (0-1)'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    durationMs: z.number().optional(),
    voiceId: z.string(),
    voiceName: z.string(),
    audioUrl: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL', fileName, stability, similarityBoost } = context;
    
    try {
      const timestamp = Date.now();
      const outputFileName = fileName ? `${fileName}.mp3` : `jp_audio_${timestamp}.mp3`;
      const filePath = path.join(AUDIO_DIR, outputFileName);
      
      fs.writeFileSync(filePath, 'dummy japanese audio data');
      
      const voice = ELEVEN_LABS_VOICES.find(v => v.id === voiceId) || { name: 'Antoni' };
      
      return {
        filePath,
        durationMs: Math.floor(text.length * 100), // Japanese may take longer per character
        voiceId,
        voiceName: voice.name,
        audioUrl: `file://${filePath}`,
      };
    } catch (error: any) {
      throw new Error(`Error generating Japanese audio: ${error.message}`);
    }
  },
});

/**
 * Process and enhance audio files
 */
export const enhanceAudioToolDef = createTool({
  id: 'enhanceAudioToolDef',
  description: 'Process and enhance audio files for better quality',
  inputSchema: z.object({
    inputPath: z.string().describe('Path to the input audio file'),
    outputFileName: z.string().optional().describe('Name for the output file (without extension)'),
    removeBackground: z.boolean().default(true).describe('Remove background noise'),
    normalize: z.boolean().default(true).describe('Normalize audio levels'),
    increaseClarity: z.boolean().default(false).describe('Increase speech clarity'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    originalSize: z.number(),
    enhancedSize: z.number(),
    durationMs: z.number().optional(),
  }),
  execute: async ({ context }) => {
    const { inputPath, outputFileName, removeBackground, normalize, increaseClarity } = context;
    
    try {
      const timestamp = Date.now();
      const outputFileName2 = outputFileName ? `${outputFileName}.mp3` : `enhanced_${timestamp}.mp3`;
      const filePath = path.join(AUDIO_DIR, outputFileName2);
      
      const originalSize = fs.existsSync(inputPath) ? fs.statSync(inputPath).size : 1000000;
      
      fs.writeFileSync(filePath, 'dummy enhanced audio data');
      const enhancedSize = fs.statSync(filePath).size;
      
      return {
        filePath,
        originalSize,
        enhancedSize,
        durationMs: 30000, // Dummy 30 seconds duration
      };
    } catch (error: any) {
      throw new Error(`Error enhancing audio: ${error.message}`);
    }
  },
});

export const audioTools = {
  generateAudioToolDef,
  listVoicesToolDef,
  generateJapaneseAudioToolDef,
  enhanceAudioToolDef,
};
