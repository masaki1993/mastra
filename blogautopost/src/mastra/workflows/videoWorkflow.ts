import { Workflow, Step } from '@mastra/core/workflows';
import { z } from 'zod';
import { videoAgent } from '../agents/videoAgent';
import { audioAgent } from '../agents/audioAgent';

export const videoWorkflow = new Workflow({
  name: 'video-workflow',
  triggerSchema: z.object({
    imagesPaths: z.array(z.string()).describe('画像ファイルのパス'),
    scriptText: z.string().describe('ナレーションのスクリプト'),
    platform: z.enum(['instagram_reel', 'tiktok']).default('instagram_reel').describe('ターゲットプラットフォーム'),
    duration: z.number().default(30).describe('動画の長さ（秒）'),
    title: z.string().describe('動画のタイトル'),
    addCaptions: z.boolean().default(true).describe('字幕を追加するかどうか'),
    language: z.enum(['japanese', 'english']).default('japanese').describe('言語'),
    outputFileName: z.string().optional().describe('出力ファイル名（拡張子なし）'),
  }),
});

const generateAudioStep = new Step({
  id: 'generateAudioStep',
  execute: async ({ context }) => {
    const scriptText = context.triggerData.scriptText;
    const language = context.triggerData.language;
    const outputFileName = context.triggerData.outputFileName ? 
      `${context.triggerData.outputFileName}_audio` : 
      `audio_${Date.now()}`;
    
    if (language === 'japanese') {
      const result = await audioAgent.generate(`
        以下の日本語テキストを音声に変換してください。
        
        【テキスト】
        ${scriptText}
        
        送迎サービス「えすこーと」のSNS動画用ナレーションとして、明瞭で親しみやすい音声を生成してください。
        ファイル名: ${outputFileName}
      `);
      
      return { 
        audioGenerationResult: result.text,
        language
      };
    } else {
      const result = await audioAgent.generate(`
        Please convert the following English text to speech.
        
        【Text】
        ${scriptText}
        
        Generate a clear and friendly voice for the "Escort" children's transportation service SNS video narration.
        File name: ${outputFileName}
      `);
      
      return { 
        audioGenerationResult: result.text,
        language
      };
    }
  },
});

const createVideoStep = new Step({
  id: 'createVideoStep',
  execute: async ({ context }) => {
    const audioGenerationResult = context.getStepResult('generateAudioStep')?.audioGenerationResult;
    const imagesPaths = context.triggerData.imagesPaths;
    const platform = context.triggerData.platform;
    const duration = context.triggerData.duration;
    const title = context.triggerData.title;
    const outputFileName = context.triggerData.outputFileName ? 
      `${context.triggerData.outputFileName}_raw` : 
      `video_${platform}_${Date.now()}_raw`;
    
    const result = await videoAgent.generate(`
      以下の画像と音声から${platform === 'instagram_reel' ? 'Instagramリール' : 'TikTok'}用の動画を作成してください。
      
      【画像ファイル】
      ${imagesPaths.join('\n')}
      
      【音声生成結果】
      ${audioGenerationResult}
      
      【動画タイトル】
      ${title}
      
      【動画の長さ】
      ${duration}秒
      
      【出力ファイル名】
      ${outputFileName}
      
      【プラットフォーム】
      ${platform === 'instagram_reel' ? 'Instagramリール' : 'TikTok'}
      
      送迎サービス「えすこーと」のSNS投稿用として、縦型（9:16）の動画を作成してください。
      画像間の遷移効果はフェードを使用し、全体的に明るく親しみやすい印象になるようにしてください。
    `);
    
    return { 
      audioGenerationResult,
      videoCreationResult: result.text,
      platform,
      title
    };
  },
});

const addTextOverlayStep = new Step({
  id: 'addTextOverlayStep',
  execute: async ({ context }) => {
    const videoCreationResult = context.getStepResult('createVideoStep')?.videoCreationResult;
    const title = context.triggerData.title;
    const platform = context.triggerData.platform;
    const outputFileName = context.triggerData.outputFileName ? 
      `${context.triggerData.outputFileName}_text` : 
      `video_${platform}_${Date.now()}_text`;
    
    const result = await videoAgent.generate(`
      以下の動画にテキストオーバーレイを追加してください。
      
      【動画作成結果】
      ${videoCreationResult}
      
      【動画タイトル】
      ${title}
      
      【出力ファイル名】
      ${outputFileName}
      
      送迎サービス「えすこーと」のSNS投稿用として、以下のテキストオーバーレイを追加してください：
      
      1. 冒頭（0-3秒）：「${title}」を画面上部に表示
      2. 中盤（動画の中間点）：「子どもの安全を第一に」を画面中央に表示
      3. 終盤（最後の3秒）：「えすこーと公式サイトで詳細を確認」を画面下部に表示
      
      テキストは読みやすく、背景とのコントラストが高いフォントを使用してください。
    `);
    
    return { 
      audioGenerationResult: context.getStepResult('generateAudioStep')?.audioGenerationResult,
      videoCreationResult,
      textOverlayResult: result.text,
      platform,
      title
    };
  },
});

const optimizeVideoStep = new Step({
  id: 'optimizeVideoStep',
  execute: async ({ context }) => {
    const textOverlayResult = context.getStepResult('addTextOverlayStep')?.textOverlayResult;
    const platform = context.triggerData.platform;
    const outputFileName = context.triggerData.outputFileName;
    const addCaptions = context.triggerData.addCaptions;
    
    const result = await videoAgent.generate(`
      以下の動画を${platform === 'instagram_reel' ? 'Instagramリール' : 'TikTok'}用に最適化してください。
      
      【テキストオーバーレイ結果】
      ${textOverlayResult}
      
      【出力ファイル名】
      ${outputFileName || `final_${platform}_${Date.now()}`}
      
      【プラットフォーム】
      ${platform}
      
      ${addCaptions ? '動画に字幕を追加してください。' : ''}
      
      送迎サービス「えすこーと」のSNS投稿用として、${platform === 'instagram_reel' ? 'Instagramリール' : 'TikTok'}の
      技術仕様（解像度、ビットレート、ファイルサイズなど）に合わせて最適化してください。
      動画の冒頭に短いイントロアニメーションを追加し、最後にロゴを表示してください。
    `);
    
    return { 
      audioGenerationResult: context.getStepResult('generateAudioStep')?.audioGenerationResult,
      videoCreationResult: context.getStepResult('createVideoStep')?.videoCreationResult,
      textOverlayResult,
      optimizationResult: result.text,
      platform,
      title: context.triggerData.title,
      finalVideoPath: result.text.includes('filePath') ? 
        result.text.match(/filePath: ([^\n]+)/)?.[1] || 'Unknown path' : 
        'Unknown path'
    };
  },
});

videoWorkflow
  .step(generateAudioStep)
  .then(createVideoStep)
  .then(addTextOverlayStep)
  .then(optimizeVideoStep)
  .commit();
