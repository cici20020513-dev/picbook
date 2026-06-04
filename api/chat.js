module.exports = async (req, res) => {
  // 设置跨域和流响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  // 预检请求直接返回
  if (req.method === 'OPTIONS') {
    return res.end();
  }

  // 只接受 POST
  if (req.method !== 'POST') {
    res.write(`data:{"error":"请使用POST请求"}\n\n`);
    return res.end();
  }

  // 读取环境变量密钥
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    res.write(`data:{"error":"未配置DASHSCOPE_API_KEY"}\n\n`);
    return res.end();
  }

  try {
    // 请求阿里云通义千问
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: { messages: req.body.messages },
        parameters: {
          result_format: 'message',
          stream: true
        }
      })
    });

    // 流式转发给前端（原生支持，不需要任何库）
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
};
