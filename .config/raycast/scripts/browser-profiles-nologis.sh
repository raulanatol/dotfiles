#!/bin/bash

############################################
## Set your browser app                   ##
## "Google Chrome"                        ##
## "Brave Browser"                        ##
############################################

browser="Brave Browser"

# Required parameters:
# @raycast.title Open Nologis browser
# @raycast.author raulanatol
# @raycast.authorURL https://github.com/raulanatol
# @raycast.description Open the Nologis profile

# @raycast.icon ⛵
# @raycast.mode silent
# @raycast.packageName Browser
# @raycast.schemaVersion 1
# @raycast.argument1 { "type": "text", "placeholder": "website", "optional": true }

open -a "$browser" -n --args --profile-directory="Profile 2" "$1"