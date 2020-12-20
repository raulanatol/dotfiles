setopt PROMPT_SUBST
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FCNTL_LOCK

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




# TODO move to lazy load
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('$HOME/opt/anaconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "$HOME/opt/anaconda3/etc/profile.d/conda.sh" ]; then
        . "$HOME/opt/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="$HOME/opt/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

