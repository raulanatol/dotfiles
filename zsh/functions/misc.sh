set_terminal_title() {
  source "$UTILSH_PATH/src/shell/sout"
  sout::set_terminal_title "$@"
}

j() {
  fname=$(declare -f -F _z)

  [ -n "$fname" ] || source "$DOTFILES_PATH/modules/z/z.sh"

  _z "$1"
}
