#!/bin/bash
# Pushes main, then proves the tool pages (and the files they need) are on GitHub.
# Run from anywhere:  bash "/Users/oleg/Smartalock-Configuration-Studio/Claude outputs/push-tools.sh"
cd /Users/oleg/Smartalock-Configuration-Studio || exit 1
FILES="pages/mapper.html pages/desk-numbering.html assets/images/neighbourhood-demo.gif assets/images/desk-numbering-demo.gif assets/images/floorsense-logo.png"

# 1. Refuse to push if a required file has uncommitted changes or is untracked.
bad=0
for f in $FILES; do
  if ! git ls-files --error-unmatch "$f" >/dev/null 2>&1; then echo "NOT TRACKED: $f"; bad=1
  elif [ -n "$(git status --porcelain -- "$f")" ]; then echo "UNCOMMITTED CHANGES: $f"; bad=1; fi
done
[ $bad = 1 ] && { echo "Fix the above (git add / git commit those files), then run this again."; exit 1; }

# 2. Push.
git push origin main || { echo "PUSH FAILED"; exit 1; }

# 3. Verify GitHub's copy matches your local copy for every required file.
git fetch origin main -q || { echo "FETCH FAILED"; exit 1; }
for f in $FILES; do
  if [ "$(git rev-parse "origin/main:$f" 2>/dev/null)" = "$(git hash-object "$f")" ]; then echo "OK on GitHub: $f"
  else echo "MISSING OR DIFFERENT ON GITHUB: $f"; bad=1; fi
done
[ $bad = 1 ] && exit 1
echo; echo "All tool pages are on GitHub. Pages can take a minute or two to update:"
echo "https://olegovchinn.github.io/Smartalock-Configuration-Studio/pages/mapper.html"
echo "https://olegovchinn.github.io/Smartalock-Configuration-Studio/pages/desk-numbering.html"
