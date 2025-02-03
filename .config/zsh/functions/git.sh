# Git create branch from an issue
gbi() {
  local branch_name=$1
  git checkout -b issue_${branch_name}
}

# Git checkout interactive
gch() {
  git checkout "$(git branch -a | fzf | tr -d '[:space:]')"
}
