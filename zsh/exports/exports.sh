PYTHON_PATH='/usr/local/opt/python/'
RUST_PATH="$HOME/.cargo"
JAVA_PATH="/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home"
ANDROID_HOME="$HOME/Library/Android/sdk"
SONAR_SCANNER="$HOME/utils/sonar-scanner"
PYENV_PATH="$HOME/.pyenv"

MISC_SCRIPTS="$HOME/utils/misc"
IDEA_SCRIPTS="$HOME/utils/idea_scripts"

export HOMEBREW_AUTO_UPDATE_SECS=86400
export HOMEBREW_NO_ANALYTICS=true
export HOMEBREW_BUNDLE_FILE_PATH="${DOTFILES_PATH}/brew/Brewfile"

export EDITOR='vim'
export WORKON_HOME="$HOME/.virtualenvs"

paths=(
  "$HOME/bin"
  "$UTILSH_PATH/bin"
  "$PYTHON_PATH/libexec/bin"
  "$RUST_PATH/bin"
  "$IDEA_SCRIPTS"
  "$MISC_SCRIPTS"
  "$SONAR_SCANNER/bin"
  "$JAVA_PATH/bin"
  "$ANDROID_HOME/emulator"
  "$ANDROID_HOME/tools"
  "$ANDROID_HOME/tools/bin"
  "$ANDROID_HOME/platform-tools"
  "$PYENV_PATH/bin"
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
