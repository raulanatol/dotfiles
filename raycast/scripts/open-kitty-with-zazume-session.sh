#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Open Kitty with zazume session
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖

# Documentation:
# @raycast.description Open Kitty using the zazume session
# @raycast.author Raúl Anatol
# @raycast.authorURL https://github.com/raulanatol

/opt/homebrew/bin/kitty --session sessions/zazume.conf
