exports.handler = async function (event) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY; // set this in Netlify env (not VITE_)
    const body = event.body ? JSON.parse(event.body) : {};

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://codedevpro.netlify.app',
        'X-Title': 'Smart SaaS Dashboard'
      },
      body: JSON.stringify(body),
    });

    const data = await resp.text();
    return {
      statusCode: resp.ok ? 200 : resp.status,
      body: data
    };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
