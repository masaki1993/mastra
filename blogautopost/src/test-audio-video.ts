import { audioAgent, videoAgent } from './mastra/agents';

async function testAudioVideoTools() {
  console.log('Testing audio and video tools...');
  
  try {
    console.log('Testing audio generation...');
    const audioResult = await audioAgent.generate(`
      以下の文章を音声に変換してください。
      
      「えすこーとの送迎サービスは、お子様の安全を第一に考えた専門ドライバーによる送迎を提供しています。
      学校から習い事まで、保護者の代わりに安心して任せられるサービスです。
      リアルタイム位置確認システムで、いつでもお子様の位置を確認できます。」
      
      明瞭で親しみやすい声で生成してください。
    `);
    
    console.log('Audio generation result:', audioResult.text);
    
    console.log('Testing video creation...');
    const videoResult = await videoAgent.generate(`
      以下の内容でInstagramリール用の動画を作成してください。
      
      タイトル: えすこーと送迎サービスのご紹介
      プラットフォーム: instagram_reel
      
      画像は以下のキーワードに関連するものを使用してください：
      - 子供の送迎
      - 安全な車両
      - 学童保育
      - 習い事への送迎
      
      30秒程度の短い動画を作成し、テキストオーバーレイを追加してください。
    `);
    
    console.log('Video creation result:', videoResult.text);
    
  } catch (error) {
    console.error('Error testing audio and video tools:', error);
  }
}

testAudioVideoTools();
