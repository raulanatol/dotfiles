lazyfnm() {
  unset -f fnm node npm npx nvm
  [ ! -s "$FNM_DIR" ] && eval "$(fnm env)"
}

nvm() {
  lazyfnm
  fnm $@
}

node() {
  lazyfnm
  node $@
}

npm() {
  lazyfnm
  npm $@
}

npx() {
  lazyfnm
  npx $@
}

fnm() {
  lazyfnm
  fnm $@
}
