#!/usr/bin/env python3
"""Build a self-contained HTML preview from the shared game logic and DOM UI."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'preview/index.html').read_text(encoding='utf-8')
css=(root/'src/style.css').read_text(encoding='utf-8')
core=(root/'src/core/engine.js').read_text(encoding='utf-8')
ui=(root/'preview/main.js').read_text(encoding='utf-8')
# Plain script version: strip ES-module tokens from the shared core and UI.
core=core.replace('export const ','const ').replace('export function ','function ')
ui='\n'.join(ui.splitlines()[1:])
html=html.replace('<link rel="stylesheet" href="../src/style.css">','<style>'+css+'</style>')
html=html.replace('<script type="module" src="./main.js"></script>', '<script>\n'+core+'\n'+ui+'\n</script>')
html=html.replace('免安装试玩版 · 与 React / Phaser 版共用同一套游戏规则','免安装试玩版 · 与 React / Phaser 版共用游戏规则')
# Browser runs this file without importing external content.
(root/'playable.html').write_text(html,encoding='utf-8')
print('Created',root/'playable.html')
