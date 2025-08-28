shorten() {
  pushd $WORK/ralink.io
  npm run shorten "$1" "$2"
  popd
}
