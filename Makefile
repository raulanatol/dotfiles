.DEFAULT_GOAL := check

install:
	@echo "Installing the dotfiles"
	@.scripts/install

reload:
	@echo "♻️ Reload the dotfiles"
	@.scripts/reload

save:
	@echo "Saving the dotfiles"
	@.scripts/save

check:
	@echo "✅"

docs:
	@doctoc .
	@echo "📚 Documentation ready!"