import { urlContentTool } from './mastra/tools/urlContent';

async function testUrlContentTool() {
  try {
    console.log('Testing URL Content Tool...');

    // Cast urlContentTool.execute as any to bypass TypeScript errors
    // This is a workaround for type checking issues with Mastra tools
    const execute = urlContentTool.execute as any;

    // Example: Extract content from a Wikipedia page
    const result = await execute({
      context: {
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
        extractImages: true,
        extractLinks: true,
      },
    });

    console.log('Title:', result.title);
    console.log('Description:', result.description);
    console.log('Content Length:', result.content.length);
    console.log('Content Preview:', result.content.substring(0, 500) + '...');

    if (result.images) {
      console.log(`\nFound ${result.images.length} images. First 5:`);
      result.images.slice(0, 5).forEach((img: string) => console.log('- ' + img));
    }

    if (result.links) {
      console.log(`\nFound ${result.links.length} links. First 5:`);
      result.links
        .slice(0, 5)
        .forEach((link: { url: string; text: string }) => console.log(`- ${link.text}: ${link.url}`));
    }

    console.log('\nMetadata:');
    Object.entries(result.metadata || {})
      .slice(0, 10)
      .forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing URL content tool:', error);
  }
}

// Run the test
testUrlContentTool();
