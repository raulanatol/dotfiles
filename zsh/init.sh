#!/usr/bin/env bash

alias sudo='sudo '

for alias in "$DOTFILES_PATH/shell/aliases/"*; do source "$alias"; done
for exports in "$DOTFILES_PATH/shell/exports/"*; do source "$exports"; done
for funcs in "$DOTFILES_PATH/shell/functions/"*; do source "$funcs"; done
