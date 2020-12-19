# raulanatol dotfiles

## install

Run this:

```sh
git clone https://github.com/raulanatol/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
make install
```

## How to update the dotfiles project

Something we need to update the dotfiles project, new brew applications installed, etc. To do this you only need to execute

```shell
make save
```

## How to add more symlinks?

Edit the file `symlinks` and add a new line. The first column is the source path, and the second column the destination
path.

## How to add a new application?

Create a new folder with the name of the application and put inside all the files that this application needed.
