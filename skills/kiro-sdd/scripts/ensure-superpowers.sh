#!/bin/sh
# Make sure obra/superpowers skills are installed before kiro-sdd calls them.
#
# Usage: sh ensure-superpowers.sh <skill> [<skill> ...]
#
# For each skill, prints "<skill> <path to SKILL.md>" when it is installed or
# was just installed, or "<skill> MISSING" when it could not be installed.
# Exits 0 when every skill is available, 1 when any is missing, 2 on bad usage.
# Missing skills are installed globally with the skills CLI:
#   npx -y skills add obra/superpowers -g -y --skill <skill> [<skill> ...]
set -u

if [ "$#" -eq 0 ]; then
  echo "usage: sh ensure-superpowers.sh <skill> [<skill> ...]" >&2
  exit 2
fi

find_skill() {
  for dir in ./.agents/skills ./.claude/skills ./.kiro/skills ./.cursor/skills \
    "$HOME/.agents/skills" "$HOME/.claude/skills" "$HOME/.kiro/skills" \
    "$HOME/.cursor/skills" "${CODEX_HOME:-$HOME/.codex}/skills"; do
    if [ -f "$dir/$1/SKILL.md" ]; then
      echo "$dir/$1/SKILL.md"
      return 0
    fi
  done
  # Claude Code plugin install of obra/superpowers; keep the newest match.
  found=""
  for file in "$HOME"/.claude/plugins/cache/*/superpowers/*/skills/"$1"/SKILL.md; do
    [ -f "$file" ] && found="$file"
  done
  [ -n "$found" ] && echo "$found" && return 0
  return 1
}

missing=""
for name in "$@"; do
  find_skill "$name" >/dev/null || missing="$missing $name"
done

if [ -n "$missing" ]; then
  if command -v npx >/dev/null 2>&1; then
    # shellcheck disable=SC2086 # word splitting of $missing is intended
    npx -y skills add obra/superpowers -g -y --skill $missing >&2 ||
      echo "skills add failed for:$missing" >&2
  else
    echo "npx not found; cannot install:$missing" >&2
  fi
fi

status=0
for name in "$@"; do
  if path=$(find_skill "$name"); then
    echo "$name $path"
  else
    echo "$name MISSING"
    status=1
  fi
done
exit "$status"
