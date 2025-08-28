set_terminal_title() {
  source "$UTILSH_PATH/src/shell/sout"
  sout::set_terminal_title "$@"
}

shorten() {
  pushd $WORK/ralink.io
  npm run shorten "$1" "$2"
  popd
}
