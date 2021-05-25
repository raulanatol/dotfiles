PYTHON_PATH='/usr/local/opt/python/'
RUST_PATH="$HOME/.cargo"
JAVA_PATH="$(/usr/libexec/java_home -v 1.8)"
ANDROID_HOME="$HOME/Library/Android/sdk"
GRAILS_HOME=/Users/yodra/desarrollo/leanmind/netex/grails-2.5.5
GOPATH=$HOME/go
PYENV_PATH="$HOME/.pyenv"
PYENV_ROOT="$HOME/.pyenv"
GOROOT="/usr/local/opt/go/libexec"

IDEA_SCRIPTS="$HOME/utils/idea_scripts"
MISC_SCRIPTS="$HOME/utils/misc"

export HOMEBREW_AUTO_UPDATE_SECS=86400
export HOMEBREW_NO_ANALYTICS=true
export HOMEBREW_BUNDLE_FILE_PATH="${DOTFILES_PATH}/brew/Brewfile"

export EDITOR='vim'
export CERT_PATH="/Users/raulanatol/utils/cert_path"
export WORKON_HOME="$HOME/.virtualenvs"

# LiFull Projects
export GOPRIVATE="gitlab.services/crawling/go-core"

paths=(
  "$HOME/bin"
  "$PYTHON_PATH/libexec/bin"
  "$RUST_PATH/bin"
  "$IDEA_SCRIPTS"
  "$MISC_SCRIPTS"
  "$JAVA_PATH/bin"
  "$ANDROID_HOME/emulator"
  "$ANDROID_HOME/tools"
  "$ANDROID_HOME/tools/bin"
  "$ANDROID_HOME/platform-tools"
  "$PYENV_PATH/bin"
  "$GRAILS_HOME/bin"
  "$GOPATH/bin"
  "$GOROOT/bin"
  "/Users/yodra/.utilsh/bin"
  "/bin"
  "/usr/local/bin"
  "/usr/local/opt/gnu-sed/libexec/gnubin"
  "/usr/local/opt/make/libexec/gnubin"
  "/usr/bin"
  "/usr/local/sbin"
  "/usr/sbin"
  "/sbin"
)

PATH=$(
  IFS=":"
  echo "${paths[*]}"
)

export PATH
