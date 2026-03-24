export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 只要你的手机请求 vod88.top/api/... 就会触发这里
    if (url.pathname.startsWith('/api/')) {
      // 核心：把国内无法访问的 Google API 地址，在这里拼接出来
      const targetUrl = 'https://generativelanguage.googleapis.com' + url.pathname.replace('/api/', '/') + url.search;
      
      // 核心：自动从你刚才设置的后台里读取 GEMINI_KEY
      const proxyUrl = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'key=' + env.GEMINI_KEY;

      const newRequest = new Request(proxyUrl, {
        method: request.method,
        headers: {
          ...request.headers,
          "host": "generativelanguage.googleapis.com"
        },
        body: request.body
      });

      return fetch(newRequest);
    }

    // 如果不是 API 请求，就正常加载你的 index.html 网页
    return env.ASSETS.fetch(request);
  }
};
