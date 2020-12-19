lazyVirtualEnv() {
  if ! [ -x "$(command -v workon)" ]; then
    source /usr/local/bin/virtualenvwrapper.sh
  fi
  workon "$1"
}

python_on() {
  lazyVirtualEnv "$1"
}
