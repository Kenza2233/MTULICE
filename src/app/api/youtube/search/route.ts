import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const apiKey = searchParams.get('key');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    if (apiKey) {
      // METHOD 1: YouTube Data API v3
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=10&key=${apiKey}`
      );
      const searchData = await searchRes.json();

      if (searchData.error) {
        throw new Error(searchData.error.message);
      }

      interface YouTubeSearchItem {
        id: { channelId: string };
        snippet: {
          title: string;
          thumbnails: { high?: { url: string }; default: { url: string } };
          description: string;
        };
      }

      const results = await Promise.all(
        searchData.items.map(async (item: YouTubeSearchItem) => {
          const channelId = item.id.channelId;

          // Get additional channel info (sub count)
          const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
          );
          const channelData = await channelRes.json();
          const channelInfo = channelData.items?.[0];

          // Check live status
          const liveRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
          );
          const liveData = await liveRes.json();
          const isLive = liveData.items && liveData.items.length > 0;

          return {
            id: channelId,
            name: item.snippet.title,
            avatar: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            description: item.snippet.description,
            subscriberCount: channelInfo?.statistics?.subscriberCount || null,
            videoCount: channelInfo?.statistics?.videoCount || null,
            isLive,
            liveVideoId: isLive ? liveData.items[0].id.videoId : null,
            platform: 'youtube'
          };
        })
      );

      return NextResponse.json(results);
    } else {
      // METHOD 2: Fallback (Public SuggestQueries + Scraping-ish)
      // Since scraping is complex and fragile in this environment,
      // we'll use a public search approach that returns basic data if possible,
      // or a placeholder if scraping isn't feasible.

      // For this implementation, we will simulate the fallback or use a lightweight approach.
      // Real scraping would require a robust parser.

      const searchRes = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%253D%253D`,
        {
           headers: {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
           }
        }
      );
      const html = await searchRes.text();

      // Simple regex to extract some channel data from ytInitialData
      // This is a bit more complex but tries to get more data
      const results = [];
      const channelBlocks = html.split('"channelRenderer":').slice(1, 11);

      for (const block of channelBlocks) {
        try {
          const idMatch = block.match(/"channelId":"([^"]+)"/);
          const nameMatch = block.match(/"title":\{"simpleText":"([^"]+)"\}/) || block.match(/"title":\{"runs":\[\{"text":"([^"]+)"\}\]\}/);
          const avatarMatch = block.match(/"url":"([^"]+)"/);
          const subsMatch = block.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/) || block.match(/"videoCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\}/);
          const descMatch = block.match(/"descriptionSnippet":\{"runs":\[\{"text":"([^"]+)"\}\]\}/);

          if (idMatch && nameMatch) {
            results.push({
              id: idMatch[1],
              name: nameMatch[1] || nameMatch[2],
              avatar: avatarMatch ? (avatarMatch[1].startsWith('//') ? 'https:' + avatarMatch[1] : avatarMatch[1]) : '',
              description: descMatch ? descMatch[1] : '',
              subscriberCount: subsMatch ? (subsMatch[1] || subsMatch[2]) : null,
              isLive: block.includes('BADGE_STYLE_TYPE_LIVE_NOW') || block.includes('LIVE NOW'),
              platform: 'youtube'
            });
          }
        } catch {
          continue;
        }
      }

      return NextResponse.json(results);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
