module.exports = async (req, res) => {
  // 设置跨域和流响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  if (req.method === 'OPTIONS') {
    return res.end();
  }

  if (req.method !== 'POST') {
    res.write(`data:{"error":"请使用POST请求"}\n\n`);
    return res.end();
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    res.write(`data:{"error":"未配置DASHSCOPE_API_KEY"}\n\n`);
    return res.end();
  }

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: req.body.messages
          },
          parameters: {
            result_format: 'message',
            stream: true
          }
        })
      }
    );

    response.body.on('data', (chunk) => {
      res.write(chunk.toString());
    });

    response.body.on('end', () => {
      res.end();
    });

  } catch (err) {
    res.write(`data:{"error":"接口异常：${err.message}"}\n\n`);
    res.end();
  }
};
