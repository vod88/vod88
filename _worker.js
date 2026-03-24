export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 拦截前端发往 /api/v1beta 的请求
    if (url.pathname.startsWith('/api/v1beta')) {
      // 拼接 Google Gemini 官方 API 地址
      const targetUrl = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`;
      
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          // 使用你刚刚在后台加密保存的 GEMINI_KEY
          'x-goog-api-key': env.GEMINI_KEY, 
        },
        body: request.body,
      });

      try {
        const response = await fetch(newRequest);
        
        // 针对 Google 常见的 403 (地区限制) 报错做特殊处理
        if (response.status === 403) {
          return new Response(JSON.stringify({ error: "🔒 节点地区受限，请尝试刷新或联系管理员" }), { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return response;
      } catch (e) {
        return new Response(JSON.stringify({ error: "📡 赛博中枢波动中..." }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. 如果不是 API 请求，则正常返回网页资源
    return env.ASSETS.fetch(request);
  },
};
