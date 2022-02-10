RUST_PATH="$HOME/.cargo"
ANDROID_HOME="$HOME/Library/Android/sdk"
ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
SONAR_SCANNER="$HOME/utils/sonar-scanner"
PYENV_PATH="$HOME/.pyenv"
DENO_INSTALL="$HOME/.deno"
HOMEBREW_PREFIX="/opt/homebrew";
HOMEBREW_CELLAR="/opt/homebrew/Cellar";
HOMEBREW_REPOSITORY="/opt/homebrew";
MANPATH="/opt/homebrew/share/man${MANPATH+:$MANPATH}:";
INFOPATH="/opt/homebrew/share/info:${INFOPATH:-}";

MISC_SCRIPTS="$HOME/utils/misc"
IDEA_SCRIPTS="$HOME/utils/idea_scripts"

# Java
export JAVA_HOME=$(/usr/libexec/java_home) # Latest
export JAVA_8_HOME=$(/usr/libexec/java_home -v1.8)
export JAVA_11_HOME=$(/usr/libexec/java_home -v11)
export JAVA_14_HOME=$(/usr/libexec/java_home -v14)
export JAVA_17_HOME=/opt/homebrew/Cellar/openjdk/17.0.1_1

export HOMEBREW_AUTO_UPDATE_SECS=86400
export HOMEBREW_NO_ANALYTICS=true
export HOMEBREW_BUNDLE_FILE_PATH="${DOTFILES_PATH}/brew/Brewfile"

export EDITOR='vim'
export WORKON_HOME="$HOME/.virtualenvs"

export VIRTUAL_ENV_DISABLE_PROMPT=1

export ZZM_HOME="$HOME/.zzm"

paths=(
  "$HOME/bin"
  "$UTILSH_PATH/bin"
  "$RUST_PATH/bin"
  "$DENO_INSTALL/bin"
  "$IDEA_SCRIPTS"
  "$MISC_SCRIPTS"
  "$SONAR_SCANNER/bin"
  "$ANDROID_HOME/emulator"
  "$ANDROID_HOME/tools"
  "$ANDROID_HOME/tools/bin"
  "$ANDROID_HOME/platform-tools"
  "/opt/homebrew/bin"
  "/opt/homebrew/sbin"
  "$PYENV_PATH/bin"
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
