# raulanatol dotfiles

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [install](#install)
- [How to update the dotfiles project](#how-to-update-the-dotfiles-project)
- [How to add more symlinks?](#how-to-add-more-symlinks)
- [How to add a new application?](#how-to-add-a-new-application)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## install

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
make save
```

## How to add more symlinks?

Edit the file `symlinks` and add a new line.

## How to add a new application?

Create a new folder with the name of the application and put inside all the files that this application needed.
