#!/bin/bash

# 1. 把所有变动添加到暂存区
git add .

# 2. 提交变动并备注时间
git commit -m "自动更新：$(date '+%Y-%m-%d %H:%M:%S')"

# 3. 推送到 GitHub
git push

echo "-----------------------------------"
echo "🚀 网站已同步！请等待 Cloudflare 生效。"
echo "-----------------------------------"#!/bin/bash
git add .
git commit -m "auto update"
git push
echo "--- 网站更新成功！ ---"
