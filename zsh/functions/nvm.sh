lazynvm() {
  unset -f nvm node npm npx
  export NVM_DIR=~/.nvm
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
  if [ -f "$NVM_DIR/bash_completion" ]; then
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
  fi
}

lazyfnm() {
  unset -f fnm node npm npx
  [ ! -s "$FNM_DIR" ] && eval "$(fnm env)"
}

nvm() {
  lazynvm
  nvm $@
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
