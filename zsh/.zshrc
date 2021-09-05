setopt PROMPT_SUBST
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FCNTL_LOCK

#### FIG ENV VARIABLES ####
# Please make sure this block is at the start of this file.
# [ -s ~/.fig/shell/pre.sh ] && source ~/.fig/shell/pre.sh
#### END FIG ENV VARIABLES ####

# Start zim
source $ZIM_HOME/init.zsh

# Async mode for autocompletion
ZSH_AUTOSUGGEST_USE_ASYNC=true
ZSH_HIGHLIGHT_MAXLENGTH=300

# Init custom shell scripts
source $DOTFILES_PATH/zsh/init.sh

fpath=("$DOTFILES_PATH/zsh/completions" "$UTILSH_PATH/completions" $fpath)

autoload -U compaudit && autoload -Uz compinit && compinit

# bindings...
source $DOTFILES_PATH/zsh/bindings/key-bindings.zsh
source $DOTFILES_PATH/zsh/bindings/reverse_search.zsh

## Starship
eval "$(starship init zsh)"

## Init extra scripts
source $DOTFILES_PATH/langs/python/pyenv/init.sh

# Atuin
source $DOTFILES_PATH/zsh/extra/atuin.sh

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"

#### FIG ENV VARIABLES ####
# Please make sure this block is at the end of this file.
# [ -s ~/.fig/fig.sh ] && source ~/.fig/fig.sh
#### END FIG ENV VARIABLES ####
