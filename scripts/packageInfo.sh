#!/bin/bash
# filepath: /home/code/asf-csgo-delivery/scripts/packageInfo.sh

# 设置路径
SCRIPT_DIR="$(dirname "$0")"
PKG_PATH="${SCRIPT_DIR}/../package.json"
OUT_PATH="${SCRIPT_DIR}/../src/lib/packageInfo.ts"

echo "$PKG_PATH"
echo "$OUT_PATH"

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo "错误: 此脚本需要 jq。请运行: sudo apt install jq"
    exit 1
fi

# 使用 jq 从 package.json 提取字段
NAME=$(jq -r '.name' "$PKG_PATH")
VERSION=$(jq -r '.version' "$PKG_PATH")
DESCRIPTION=$(jq -r '.description // ""' "$PKG_PATH")
AUTHOR=$(jq -r '.author // ""' "$PKG_PATH")

# 创建 JSON 对象
JSON_OBJECT=$(jq -n \
  --arg name "$NAME" \
  --arg version "$VERSION" \
  --arg description "$DESCRIPTION" \
  --arg author "$AUTHOR" \
  '{name: $name, version: $version, description: $description, author: $author}')

# 写入到 packageInfo.ts 文件
echo "export const PACKAGE_INFO = $JSON_OBJECT;" > "$OUT_PATH"

echo "packageInfo.ts generated: $OUT_PATH"