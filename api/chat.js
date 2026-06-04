try {
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
        messages: req.body.messages,
        stream: false
      })
    }
  );

  const result = await response.json();

  console.log('status:', response.status);
  console.log(JSON.stringify(result, null, 2));

  res.setHeader('Content-Type', 'application/json');

  return res.end(JSON.stringify(result));
}
catch (err) {
  console.error(err);

  return res.end(
    JSON.stringify({
      error: err.message
    })
  );
}
