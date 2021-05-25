#!/usr/bin/env bash

## Inspired by https://github.com/mathiasbynens/dotfiles/blob/master/.macos
#
## Close any open System Preferences panes, to prevent them from overriding
## settings we’re about to change
#osascript -e 'tell application "System Preferences" to quit'
#
#sudo -v
#
## Keep-alive: update existing `sudo` time stamp until `.macos` has finished
#while true; do
#  sudo -n true
#  sleep 60
#  kill -0 "$$" || exit
#done 2>/dev/null &
#
## Disable the sound effects on boot
#sudo nvram SystemAudioVolume=" "
#
## Play user interface sound effects: false
defaults write com.apple.systemsound "com.apple.sound.uiaudio.enabled" -int 0

# Disable Big Sur Chime
sudo nvram StartupMute=%01

################################################################################
## Trackpad, mouse, keyboard, Bluetooth accessories, and input                 #
################################################################################

# Show language menu in the top right corner of the boot screen
sudo defaults write /Library/Preferences/com.apple.loginwindow showInputMenu -bool true

# Disable “natural” (Lion-style) scrolling
defaults write NSGlobalDomain com.apple.swipescrolldirection -bool false

# Set a blazingly fast keyboard repeat rate
defaults write NSGlobalDomain KeyRepeat -int 2
defaults write NSGlobalDomain InitialKeyRepeat -int 68

################################################################################
## Screen                                                                      #
################################################################################

# Require password immediately after sleep or screen saver begins
defaults write com.apple.screensaver askForPassword -int 1
defaults write com.apple.screensaver askForPasswordDelay -int 0

# Save screenshots to the screenshot folder
mkdir -p "${HOME}/Downloads/screenshots"
defaults write com.apple.screencapture location -string "${HOME}/Downloads/screenshots"

# Autohide the menu bar - false
defaults write NSGlobalDomain _HIHideMenuBar -bool false

################################################################################
## Finder                                                                      #
################################################################################

# Finder: show all filename extensions
defaults write NSGlobalDomain AppleShowAllExtensions -bool true

# Finder: show status bar
defaults write com.apple.finder ShowStatusBar -bool true

# Finder: show path bar
defaults write com.apple.finder ShowPathbar -bool true

# Keep folders on top when sorting by name
defaults write com.apple.finder _FXSortFoldersFirst -bool true

# When performing a search, search the current folder by default
defaults write com.apple.finder FXDefaultSearchScope -string "SCcf"

# Disable the warning when changing a file extension
defaults write com.apple.finder FXEnableExtensionChangeWarning -bool false

################################################################################
## Dock, Dashboard, and hot corners                                            #
################################################################################
#
## Enable highlight hover effect for the grid view of a stack (Dock)
#defaults write com.apple.dock mouse-over-hilite-stack -bool true
#
## Dock icons size
#defaults write com.apple.dock tilesize -int 56
#
## Change minimize/maximize window effect
#defaults write com.apple.dock mineffect -string "genie"
#
## Minimize windows into their application’s icon
#defaults write com.apple.dock minimize-to-application -bool false
#
## Show indicator lights for open applications in the Dock
#defaults write com.apple.dock show-process-indicators -bool true
#
## Don’t animate opening applications from the Dock
#defaults write com.apple.dock launchanim -bool false
#
## Speed up Mission Control animations
#defaults write com.apple.dock expose-animation-duration -float 0
#
## Don’t group windows by application in Mission Control
#defaults write com.apple.dock expose-group-by-app -bool false
#
#defaults write com.apple.Dock autohide-delay -float 0.0001
#
## Automatically hide and show the Dock
#defaults write com.apple.dock autohide -bool true
#
## Make Dock icons of hidden applications translucent
#defaults write com.apple.dock showhidden -bool true
#
################################################################################
## Terminal & iTerm 2                                                          #
################################################################################
#
## Only use UTF-8 in Terminal.app
#defaults write com.apple.terminal StringEncodings -array 4
#
################################################################################
## Activity Monitor                                                            #
################################################################################
#
## Show the main window when launching Activity Monitor
#defaults write com.apple.ActivityMonitor OpenMainWindow -bool true
#
## Visualize CPU usage in the Activity Monitor Dock icon
#defaults write com.apple.ActivityMonitor IconType -int 5
#
## Show all processes in Activity Monitor
#defaults write com.apple.ActivityMonitor ShowCategory -int 0
#
## Sort Activity Monitor results by CPU usage
#defaults write com.apple.ActivityMonitor SortColumn -string "CPUUsage"
#defaults write com.apple.ActivityMonitor SortDirection -int 0
#
## Kill affected apps
#for app in "Dock" "Finder"; do
#  killall "${app}" >/dev/null 2>&1
#done
