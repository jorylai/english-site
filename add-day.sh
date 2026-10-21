#!/bin/sh
# 用法: ./add-day.sh data/2026-10-22.json  -> 校验 JSON 并更新 index.json
set -e; cd "$(dirname "$0")"; python3 - "$@" <<'P'
import json,sys,glob,os
for f in sys.argv[1:]:
    d=json.load(open(f));[d[k] for k in("listen","speak","read","write")]
ds=sorted(os.path.basename(f)[:-5] for f in glob.glob("data/20*.json"))
json.dump({"dates":ds},open("data/index.json","w"));print("dates:",ds)
P
