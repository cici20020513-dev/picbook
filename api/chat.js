const response = await fetch(
  'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: req.body.messages
    })
  }
);

const data = await response.json();

console.log('status=', response.status);
console.log(JSON.stringify(data, null, 2));

res.status(response.status).json(data);
