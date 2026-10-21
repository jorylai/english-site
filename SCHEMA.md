# 每日数据格式
每天只需新增 `data/YYYY-MM-DD.json`，并把日期加入 `data/index.json` 的 `dates` 数组（`{"dates":["2026-10-21",...]}`）。页面默认显示最新日期，`#YYYY-MM-DD` 可直达某天。

```jsonc
{
 "date": "YYYY-MM-DD", "level": "B1-B2", "note": "可选说明",
 "listen": { "title": "", "text": "约150词，按句号自动分句", "questions": [{"q":"","a":""}] },
 "speak":  { "prompt": "整段角色扮演提示词", "questions": ["口语题", ...], "tip": "可选" },
 "read":   { "title": "", "text": "短文",
             "vocab": [["原文中出现的词或短语(大小写不敏感)", "中文", "例句(可空)"]],
             "questions": [{"q":"","a":""}] },
 "write":  { "task": "任务(可含\\n)", "phrases": ["句型"], "feedbackPrompt": "批改提示词",
             "model": "范文", "check": "自查要点(可选)" }
}
```
注意：vocab 第一项必须与 read.text 中的文字一致才会高亮；写作/听写/进度按日期存在浏览器 localStorage。
