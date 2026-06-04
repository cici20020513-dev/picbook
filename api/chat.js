const { Readable } = require('stream');

module.exports = async (req, res) => {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  if(req.method === 'OPTIONS') return res.end();
  if(req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if(!apiKey){
    return res.write(`data: {"err":"缺少API密钥"}\n\n`),res.end();
  }

  const { messages } = req.body;
  try {
    // 请求通义千问接口
    const resp = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${apiKey}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:"qwen-turbo", //免费可用模型
        input:{ messages },
        parameters:{ result_format:"message", stream:true }
      })
    })

    // 流式转发给前端（和原来Claude返回格式一致）
    const stream = Readable.fromWeb(resp.body);
    stream.on('data',buf=>{
      const str = buf.toString('utf8');
      res.write(str)
    })
    stream.on('end',()=>res.end())
    stream.on('err',()=>res.end())

  } catch(e) {
    res.write(`data: {"err":"接口异常"}\n\n`)
    res.end()
  }
}
}
