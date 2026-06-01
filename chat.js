export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `你是一个专门陪伴视障儿童阅读绘本的 AI 助手。你的名字叫"小光"。
说话规则：
- 用温柔、亲切、简单的语言，适合6-12岁儿童理解
- 描述画面时注重声音、触感、情绪，而不只是视觉
- 每次回答不超过150字，简短清晰
- 用"小朋友"或"宝贝"称呼用户
- 遇到抽象概念，用生活中的例子解释
- 语气温暖，像一个会讲故事的大朋友`,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    res.status(200).json({ text: data.content[0].text });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
