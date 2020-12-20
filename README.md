# raulanatol dotfiles

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

  - [Install](#install)
  - [How to update the dotfiles project](#how-to-update-the-dotfiles-project)
  - [How to add more symlinks?](#how-to-add-more-symlinks)
  - [How to add a new application?](#how-to-add-a-new-application)
- [Extra installation guide](#extra-installation-guide)
  - [Configure iTerm](#configure-iterm)
- [Misc](#misc)
  - [Reload completion](#reload-completion)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

Run this:

```sh
git clone https://github.com/raulanatol/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
make install
```

## How to update the dotfiles project

Something we need to update the dotfiles project, new brew applications installed, etc. To do this you only need to
execute

```shell
make checkpoint
```

## How to add more symlinks?

Edit the file `symlinks` and add a new line.

## How to add a new application?

Create a new folder with the name of the application and put inside all the files that this application needed.

# Extra installation guide

## Configure iTerm

Preferences > General > Preferences >

- ✅ Load preferences from a custom folder or URL  (~/.dotfiles/iTerm)
- ✅ Save changes to folder when iTerm2 quits

# Misc

## Reload completion

Execute the below script, after that open a new terminal.

```shell
.scripts/reload_completion.sh
```
