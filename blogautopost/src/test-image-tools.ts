import { imageAgent } from './mastra/agents';

async function testImageTools() {
  console.log('Testing image tools...');
  
  try {
    const result = await imageAgent.generate(`
      小学生の放課後の送迎サービスに関する画像を検索し、最適化してサンプルの表示をしてください。
      「安全」「信頼」「子供」「送迎」などのキーワードを使って最適な画像を探してください。
    `);
    
    console.log('Result:', result.text);
  } catch (error) {
    console.error('Error testing image tools:', error);
  }
}

testImageTools();
