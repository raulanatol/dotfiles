.DEFAULT_GOAL := check

install:
	@echo "Installing the dotfiles"
	@.scripts/install

reload:
	@.scripts/reload

checkpoint:
	@echo "Saving the dotfiles"
	@.scripts/checkpoint

brew-update:
	@echo "Updating Brewfile with currently installed packages..."
	@brew bundle dump --file=brew/Brewfile --force
	@echo "Brewfile updated ✅"

check:
	@echo "✅"
