PYTHON_PATH='/usr/local/opt/python/'
RUST_PATH="$HOME/.cargo"
JAVA_PATH="$(/usr/libexec/java_home -v 1.8)"
ANDROID_HOME="$HOME/Library/Android/sdk"
GRAILS_HOME=/Users/yodra/desarrollo/leanmind/netex/grails-2.5.5
GOPATH=$HOME/go
GOROOT="/usr/local/opt/go/libexec"
PYENV_PATH="$HOME/.pyenv"
PYENV_ROOT="$HOME/.pyenv"

HOMEBREW_PREFIX="/opt/homebrew";
HOMEBREW_CELLAR="/opt/homebrew/Cellar";
HOMEBREW_REPOSITORY="/opt/homebrew";
MANPATH="/opt/homebrew/share/man${MANPATH+:$MANPATH}:";
INFOPATH="/opt/homebrew/share/info:${INFOPATH:-}";

MISC_SCRIPTS="$HOME/utils/misc"
IDEA_SCRIPTS="$HOME/utils/idea_scripts"
MISC_SCRIPTS="$HOME/utils/misc"

export HOMEBREW_AUTO_UPDATE_SECS=86400
export HOMEBREW_NO_ANALYTICS=true
export HOMEBREW_BUNDLE_FILE_PATH="${DOTFILES_PATH}/brew/Brewfile"

export EDITOR='vim'
export WORKON_HOME="$HOME/.virtualenvs"

export VIRTUAL_ENV_DISABLE_PROMPT=1

paths=(
  "$HOME/bin"
  "$PYTHON_PATH/libexec/bin"
  "$UTILSH_PATH/bin"
  "$RUST_PATH/bin"
  "$IDEA_SCRIPTS"
  "$MISC_SCRIPTS"
  "$JAVA_PATH/bin"
  "$ANDROID_HOME/emulator"
  "$ANDROID_HOME/tools"
  "$ANDROID_HOME/tools/bin"
  "$ANDROID_HOME/platform-tools"
  "/opt/homebrew/bin"
  "/opt/homebrew/sbin"
  "$PYENV_PATH/bin"
  "$GRAILS_HOME/bin"
  "$GOPATH/bin"
  "$GOROOT/bin"
  "$PYENV_PATH/shims"
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
