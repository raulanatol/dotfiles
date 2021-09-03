#lazyVirtualEnv() {
#  if ! [ -x "$(command -v workon)" ]; then
#    source /usr/local/bin/virtualenvwrapper.sh
#  fi
#  workon "$1"
#}
#
#python_on() {
#  lazyVirtualEnv "$1"
#}
#
#pyenv_install_mac() {
#  local -r VERSION=$1
#  CFLAGS="-I$(brew --prefix openssl)/include -I$(brew --prefix bzip2)/include -I$(brew --prefix readline)/include -I$(xcrun --show-sdk-path)/usr/include" LDFLAGS="-L$(brew --prefix openssl)/lib -L$(brew --prefix readline)/lib -L$(brew --prefix zlib)/lib -L$(brew --prefix bzip2)/lib" pyenv install --patch "${VERSION}" < <(curl -sSL https://github.com/python/cpython/commit/8ea6353.patch\?full_index\=1)
#}
#
#lazy_penv() {
#  unset -f pyenv python python3
#  eval "$(pyenv init -)"
#  eval "$(pyenv virtualenv-init -)"
#}
#
#pyenv() {
#  lazy_penv
#  pyenv $@
#}
#
#python() {
#  lazy_penv
#  python3 $@
#}
#
#python3() {
#  lazy_penv
#  python3 $@
#}

