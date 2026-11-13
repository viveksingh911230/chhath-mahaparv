#!/bin/bash
cd "$(dirname "$0")"
{
cat <<'HEAD'
<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>छठ महापर्व – सूर्य देव की पावन यात्रा | Chhath Mahaparv</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@500;600;700;800&family=Yatra+One&display=swap" rel="stylesheet">
<style>
html,body{margin:0;height:100%;background:#2a0f05;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none}
body{display:flex;align-items:center;justify-content:center}
canvas{display:block;touch-action:none;image-rendering:auto;box-shadow:0 0 40px rgba(0,0,0,.6)}
</style>
</head>
<body>
<canvas id="game"></canvas>
<script>
HEAD
for f in core audio art levels world minigames screens main; do echo "// ---- $f.js ----"; cat src/$f.js; echo; done
cat <<'TAIL'
</script>
</body>
</html>
TAIL
} > index.html
echo built $(wc -c < index.html) bytes
