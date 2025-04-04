import { Workflow, Step } from '@mastra/core/workflows';
import { z } from 'zod';
import { imageAgent } from '../agents';

export const blogImageWorkflow = new Workflow({
  name: 'blog-image-workflow',
  triggerSchema: z.object({
    blogTitle: z.string().describe('ブログ記事のタイトル'),
    blogContent: z.string().describe('ブログ記事の内容'),
    keywords: z.string().optional().describe('関連キーワード（カンマ区切り）'),
    postId: z.number().optional().describe('WordPressの投稿ID（既存の投稿の場合）'),
    imageCount: z.number().default(1).describe('検索・追加する画像の数'),
  }),
});

const imageSearchStep = new Step({
  id: 'imageSearchStep',
  execute: async ({ context }) => {
    const title = context.triggerData.blogTitle;
    const keywords = context.triggerData.keywords || '';
    const imageCount = context.triggerData.imageCount;
    
    const searchResult = await imageAgent.generate(`
      以下のブログ記事タイトルとキーワードに関連する画像を${imageCount}枚検索してください。
      
      【ブログタイトル】
      ${title}
      
      【キーワード】
      ${keywords}
      
      学童送迎サービス「えすこーと」のブログ記事に適した、プロフェッショナルで親しみやすい画像を選んでください。
      子供の安全、保護者の安心、時間の節約などのテーマに関連する画像が望ましいです。
    `);
    
    return { searchResults: searchResult.text };
  },
});

const imageOptimizeStep = new Step({
  id: 'imageOptimizeStep',
  execute: async ({ context }) => {
    const searchResults = context.getStepResult('imageSearchStep')?.searchResults;
    const title = context.triggerData.blogTitle;
    
    const optimizeResult = await imageAgent.generate(`
      以下の検索結果から、学童送迎サービス「えすこーと」のブログ記事「${title}」に最適な画像を選んで最適化してください。
      
      【検索結果】
      ${searchResults}
      
      画像はブログ用に適切なサイズ（幅1200px程度）に最適化し、ファイルサイズを小さくしてください。
      プロフェッショナルで親しみやすい印象の画像を優先してください。
    `);
    
    return { 
      searchResults,
      optimizationResults: optimizeResult.text 
    };
  },
});

const imageUploadStep = new Step({
  id: 'imageUploadStep',
  execute: async ({ context }) => {
    const optimizationResults = context.getStepResult('imageOptimizeStep')?.optimizationResults;
    const title = context.triggerData.blogTitle;
    const postId = context.triggerData.postId;
    
    const uploadResult = await imageAgent.generate(`
      以下の最適化された画像を学童送迎サービス「えすこーと」のブログ記事「${title}」用にWordPressにアップロードしてください。
      
      【最適化結果】
      ${optimizationResults}
      
      画像のタイトル、キャプション、代替テキストを適切に設定してください。
      ${postId ? `投稿ID: ${postId}の記事のアイキャッチ画像として設定してください。` : ''}
    `);
    
    return { 
      searchResults: context.getStepResult('imageSearchStep')?.searchResults,
      optimizationResults,
      uploadResults: uploadResult.text 
    };
  },
});

blogImageWorkflow
  .step(imageSearchStep)
  .then(imageOptimizeStep)
  .then(imageUploadStep)
  .commit();
