# raulanatol dotfiles


## Dependencies

- Stow
- nix-darwin

## Start

```sh
# Move the dotfiles
stow .

# Install nix flakes
nix run nix-darwin -- switch --flake ~/.dotfiles/nix#mini
```


