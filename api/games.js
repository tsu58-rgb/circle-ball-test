export default async function handler(req, res) {
  const owner = 'tsu58-rgb';
  const repo = 'circle-ball-test';
  const branch = 'main';

  try {
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'circle-ball-game-hub'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const apiUrl =
      `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: 'GitHub API error',
        detail: text
      });
    }

    const files = await response.json();

    const games = files
      .filter(item =>
        item.type === 'file' &&
        /^game(\d+)\.html$/i.test(item.name)
      )
      .map(item => {
        const match = item.name.match(/^game(\d+)\.html$/i);
        return {
          file: item.name,
          number: Number(match[1])
        };
      })
      .sort((a, b) => a.number - b.number);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ games });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      detail: String(error)
    });
  }
}
