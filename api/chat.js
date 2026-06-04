const { Headers } = require('undici');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') return res.status(405).json({ err: '仅POST请求' });

  const API_KEY = process.env.DASHSCOPE_API_KEY;
  if (!API_KEY) return res.write(`data:{"msg":"密钥未配置"}\n\n`) && res.end();

  try {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const { messages } = JSON.parse(Buffer.concat(buffers).toString());

    const upstream = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-turbo",
        input: { messages },
        parameters: { result_format: "message", stream: true }
      })
    });

    upstream.body.pipe(res);
  } catch (err) {
    res.write(`data:{"err":"${err.message}"}\n\n`);
    res.end();
  }
};
