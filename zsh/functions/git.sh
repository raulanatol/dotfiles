# Git create branch from an issue
gbi() {
  local branch_name=$1
  git checkout -b issue_${branch_name}
}
