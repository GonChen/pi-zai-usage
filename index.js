// 包根入口 shim —— 让 pi [Extensions] 显示 `pi-zai-usage` 而非 `dist`。
// （pi 显示逻辑：弹掉 index.*，取入口所在目录；入口在 ./dist/index.js 时显示 'dist'。）
// 真实实现仍在 ./dist/index.js。
export { default } from "./dist/index.js";
