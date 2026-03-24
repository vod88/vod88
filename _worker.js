export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- 诊断接口：访问 你的域名/debug-ai 即可查看 ---
    if (url.pathname === '/debug-ai') {
      const hasKey = !!env.GEMINI_KEY;
      const keyLength = env.GEMINI_KEY ? env.GEMINI_KEY.length : 0;
      const keyPrefix = env.GEMINI_KEY ? env.GEMINI_KEY.substring(0, 6) : "None";

      return new Response(`
        [赛博中枢诊断报告]
        --------------------------
        1. 变量名匹配: ${hasKey ? "✅ 成功识别 GEMINI_KEY" : "❌ 未识别到 GEMINI_KEY"}
        2. Key 长度: ${keyLength} 位 (正常应为 39 位左右)
        3. Key 开头: ${keyPrefix}...
        4. 当前时间: ${new Date().toLocaleString()}
        --------------------------
        提示：如果显示“未识别”，请检查 Cloudflare 后台变量名是否全大写，且是否点击了“部署”。
      `, { headers: { "Content-Type": "text/plain;charset=utf-8" } });
    }

    // --- 正式 AI 接口转发 ---
    if (url.pathname.startsWith('/api/v1beta')) {
      const targetUrl = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`;
      
      // 检查变量是否存在
      if (!env.GEMINI_KEY) {
        return new Response(JSON.stringify({ error: "Cloudflare 后台未配置 GEMINI_KEY 变量" }), { status: 500 });
      }

      try {
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_KEY,
          },
          body: request.body,
        });

        // 捕获 Google 的原始错误
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const reason = errorData.error?.message || "Google 接口返回错误";
          const status = response.status;

          if (status === 403) return new Response(JSON.stringify({ error: `地区封锁(403): ${reason}` }), { status: 403 });
          if (status === 400) return new Response(JSON.stringify({ error: `格式错误(400): ${reason}` }), { status: 400 });
          return new Response(JSON.stringify({ error: `中枢报错(${status}): ${reason}` }), { status });
        }

        return response;
      } catch (e) {
        return new Response(JSON.stringify({ error: `网络异常: ${e.message}` }), { status: 500 });
      }
    }

    // --- 默认返回静态资源 ---
    return env.ASSETS.fetch(request);
  },
};
    }

    // 2. 如果不是 API 请求，则正常返回网页资源
    return env.ASSETS.fetch(request);
  },
};
