# raulanatol dotfiles

A collection of configuration files and scripts to set up a development environment on macOS.

**Table of Contents**

- [Overview](#overview)
- [Installation](#installation)
- [Available Commands](#available-commands)
- [Updating](#updating)
- [Configuration](#configuration)
  - [Adding Symlinks](#adding-symlinks)
  - [Adding New Applications](#adding-new-applications)
- [Post-Installation Setup](#post-installation-setup)
  - [iTerm2 Configuration](#iterm2-configuration)
- [Maintenance](#maintenance)
  - [Reloading Completions](#reloading-completions)
  - [macOS Defaults Management](#macos-defaults-management)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repository contains configuration files for various development tools and applications, including:

- Shell configurations (zsh with zim framework)
- Terminal emulator (WezTerm)
- Text editors (Neovim, Vim)
- Package managers (Homebrew)
- Development tools (procs, mongosh)
- Shell utilities and functions
- Git configuration
- SSH configuration
- Starship prompt configuration
- And more...

## Installation

**Prerequisites:**

- macOS (latest version recommended)
- 1Password with SSH agent configured
- Git installed on your system

To install these dotfiles on your system:

1. Update macOS to the latest version through System Preferences
2. Set up an SSH key using 1Password. Install
   the [1Password SSH agent](https://developer.1password.com/docs/ssh/get-started/#step-3-turn-on-the-1password-ssh-agent)
   and sync your SSH keys locally
3. Clone and install the dotfiles:

```sh
git clone https://github.com/raulanatol/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
make install
```

This will:

- Clone the repository to `~/.dotfiles`
- Create symbolic links to your home directory
- Install required dependencies via Homebrew

## Available Commands

The project includes a `Makefile` with several useful commands:

- `make install` - Install all dotfiles and dependencies
- `make checkpoint` - Save current system state (Homebrew packages, etc.)
- `make reload` - Reload shell configuration
- `make check` - Check system status (default goal)

**Note:** All `make` commands should be run from the `~/.dotfiles` directory.

## Updating

When you need to update the dotfiles project (e.g., after installing new Homebrew applications or making configuration
changes), run:

```shell
make checkpoint
```

This command will capture the current state of your system and update the relevant configuration files.

## Configuration

### Adding Symlinks

To add new symbolic links, edit the `symlinks` file and add a new line for each file or directory you want to link.

### Adding New Applications

To add configuration for a new application:

1. Create a new folder with the application's name in the `apps/` directory
2. Place all configuration files the application needs inside this folder
3. Add the appropriate symlink in the `symlinks` file
4. The files will be automatically linked during installation

## Post-Installation Setup

### iTerm2 Configuration

After installation, configure iTerm2 to use the dotfiles:

1. Open iTerm2 Preferences
2. Go to **General** > **Preferences**
3. Enable **Load preferences from a custom folder or URL**
4. Set the path to `~/.dotfiles/iTerm`
5. Enable **Save changes to folder when iTerm2 quits**

## Maintenance

### Reloading Completions

If you need to reload shell completions after making changes:

```shell
.scripts/reload_completion.sh
```

**Note:** Open a new terminal session after running this script for changes to take effect.

### macOS Defaults Management

To track changes in macOS system preferences:

1. Capture current state:
   ```shell
   defaults read > before
   ```

2. Make changes through the UI

3. Capture new state:
   ```shell
   defaults read > after
   ```

4. Compare the differences:
   ```shell
   diff before after
   ```

**Useful Resources:**

- [Change macOS User Preferences via Command Line](https://pawelgrzybek.com/change-macos-user-preferences-via-command-line/)
- [macOS Defaults Command](https://www.shell-tips.com/mac/defaults/)
- [macOS Defaults Database](https://macos-defaults.com)

## Project Structure

```
dotfiles/
├── apps/            # Application-specific configurations
│   ├── mongosh/     # MongoDB shell configuration
│   ├── nvim/        # Neovim configuration
│   ├── procs/       # Procs process viewer config
│   ├── raycast/     # Raycast scripts and settings
│   └── wezterm/     # WezTerm terminal configuration
├── brew/            # Homebrew packages and casks
├── git/             # Git configuration files
├── langs/           # Language-specific configurations
│   ├── python/      # Python environment setup
│   └── ruby/        # Ruby configuration
├── mac/             # macOS-specific installation scripts
├── misc/            # Miscellaneous installation scripts
├── shell/           # Shell utilities and functions
├── ssh/             # SSH configuration
├── starship/        # Starship prompt configuration
├── vim/             # Vim configuration
├── zim/             # Zim framework configuration
├── zsh/             # Zsh configuration and aliases
├── .scripts/        # Installation and utility scripts
├── symlinks         # Symbolic links configuration
└── Makefile         # Build and installation commands
```

## Troubleshooting

### Common Issues

- **Symbolic links not working**: Ensure you have the necessary permissions and that the target files exist
- **Homebrew packages not installing**: Make sure Homebrew is properly installed and updated
- **SSH key issues**: Verify that 1Password SSH agent is running and your keys are synced
- **Zsh configuration not loading**: Check that zim framework is properly installed and configured

### Getting Help

If you encounter issues:

1. Check the [Issues](https://github.com/raulanatol/dotfiles/issues) page on GitHub
2. Ensure you've followed all prerequisites
3. Verify your macOS version is compatible
4. Check the [Makefile](https://github.com/raulanatol/dotfiles/blob/main/Makefile) for available commands

## Contributing

Contributions are welcome! If you want to improve these dotfiles:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on your system
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

