#!/usr/bin/env bash


for alias in "$DOTFILES_PATH/.config/zsh/aliases/"*; do source "$alias"; done
for exports in "$DOTFILES_PATH/.config/zsh/exports/"*; do source "$exports"; done
for funcs in "$DOTFILES_PATH/.config/zsh/functions/"*; do source "$funcs"; done
