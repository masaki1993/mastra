import { Workflow, Step } from '@mastra/core/workflows';
import { z } from 'zod';
import { audioAgent } from '../agents/audioAgent';

export const audioWorkflow = new Workflow({
  name: 'audio-workflow',
  triggerSchema: z.object({
    text: z.string().describe('テキストコンテンツ'),
    language: z.enum(['japanese', 'english']).default('japanese').describe('言語'),
    voiceId: z.string().optional().describe('声のID（オプション）'),
    outputFileName: z.string().optional().describe('出力ファイル名（オプション）'),
    enhanceAudio: z.boolean().default(true).describe('音声を最適化するかどうか'),
  }),
});

const generateAudioStep = new Step({
  id: 'generateAudioStep',
  execute: async ({ context }) => {
    const text = context.triggerData.text;
    const language = context.triggerData.language;
    const voiceId = context.triggerData.voiceId;
    const outputFileName = context.triggerData.outputFileName;
    
    if (language === 'japanese') {
      const result = await audioAgent.generate(`
        以下の日本語テキストを音声に変換してください。
        
        【テキスト】
        ${text}
        
        ${voiceId ? `指定された声ID: ${voiceId}` : '送迎サービスに最適な声を選んでください。'}
        ${outputFileName ? `ファイル名: ${outputFileName}` : ''}
        
        学童送迎サービス「えすこーと」のコンテンツとして、明瞭で親しみやすい音声を生成してください。
      `);
      
      return { 
        generationResult: result.text,
        language
      };
    } else {
      const result = await audioAgent.generate(`
        Please convert the following English text to speech.
        
        【Text】
        ${text}
        
        ${voiceId ? `Specified voice ID: ${voiceId}` : 'Please select a voice suitable for a children\'s escort service.'}
        ${outputFileName ? `File name: ${outputFileName}` : ''}
        
        Generate a clear and friendly voice for the "Escort" children's transportation service content.
      `);
      
      return { 
        generationResult: result.text,
        language
      };
    }
  },
});

const enhanceAudioStep = new Step({
  id: 'enhanceAudioStep',
  execute: async ({ context }) => {
    const generationResult = context.getStepResult('generateAudioStep')?.generationResult;
    const language = context.getStepResult('generateAudioStep')?.language;
    const enhanceAudio = context.triggerData.enhanceAudio;
    
    if (!enhanceAudio) {
      return { 
        generationResult,
        enhancementResult: 'Audio enhancement skipped as requested.',
        language
      };
    }
    
    const result = await audioAgent.generate(`
      以下の生成された音声を最適化してください。
      
      【生成結果】
      ${generationResult}
      
      ${language === 'japanese' ? 
        '学童送迎サービス「えすこーと」のコンテンツとして、ノイズを除去し、明瞭さを向上させてください。' : 
        'Please remove noise and improve clarity for the "Escort" children\'s transportation service content.'}
    `);
    
    return { 
      generationResult,
      enhancementResult: result.text,
      language
    };
  },
});

audioWorkflow
  .step(generateAudioStep)
  .then(enhanceAudioStep)
  .commit();
