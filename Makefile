.DEFAULT_GOAL := check

install:
	@echo "Installing the dotfiles"
	@.scripts/install

reload:
	@.scripts/reload

checkpoint:
	@echo "Saving the dotfiles"
	@.scripts/checkpoint

check:
	@echo "✅"
