DISABLE_AUTO_TITLE="true"

# Start zim
source $ZIM_HOME/init.zsh

# Async mode for autocompletion
ZSH_AUTOSUGGEST_USE_ASYNC=true
ZSH_HIGHLIGHT_MAXLENGTH=300

# Init custom shell scripts
source $DOTFILES_PATH/zsh/init.sh

fpath=("$DOTFILES_PATH/zsh/completions" "$UTILSH_PATH/completions" $fpath)

#autoload -U compaudit && autoload -Uz compinit && compinit

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

# bun completions
[ -s "/Users/raulanatol/.bun/_bun" ] && source "/Users/raulanatol/.bun/_bun"

# Bun
export BUN_INSTALL="/Users/raulanatol/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Q post block. Keep at the bottom of this file.
[[ -f "${HOME}/Library/Application Support/amazon-q/shell/zshrc.post.zsh" ]] && builtin source "${HOME}/Library/Application Support/amazon-q/shell/zshrc.post.zsh"
