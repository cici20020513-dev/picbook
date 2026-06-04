module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') return res.end(JSON.stringify({err:"仅支持POST"}));

  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  if (!DASHSCOPE_API_KEY) {
    return res.end(`data:{"err":"未配置API密钥"}\n\n`);
  }

  const { messages } = req.body;
  try {
    const resp = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: { messages },
        parameters: { result_format: 'message', stream: true }
      })
    });
    const reader = resp.body.getReader();
    async function stream() {
      let result;
      while (!(result = await reader.read()).done) {
        res.write(Buffer.from(result.value));
      }
      res.end();
    }
    stream();
  } catch (e) {
    res.end(`data:{"err":"调用异常：${e.message}"}\n\n`);
  }
}
}
