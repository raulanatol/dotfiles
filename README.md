# raulanatol dotfiles


## Dependencies

- Stow
- nix-darwin
- softwareupdate --install-rosetta

## Start

```sh
# Move the dotfiles
stow .

# Install nix flakes
nix run nix-darwin -- switch --flake ~/.dotfiles/nix#mini
```



## More info 

- https://github.com/adriankarlen/bar.wezterm
- 
