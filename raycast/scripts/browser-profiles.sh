#!/bin/bash

############################################
## Set your browser app                   ##
## "Google Chrome"                        ##
## "Brave Browser"                        ##
############################################

browser="Brave Browser"

# Required parameters:
# @raycast.title Open the browser profile
# @raycast.author raulanatol
# @raycast.authorURL https://github.com/raulanatol
# @raycast.description Open the browser profile

# @raycast.icon ⛵
# @raycast.mode silent
# @raycast.packageName Browser
# @raycast.argument1 { "type": "text", "placeholder": "Profile name" }
# @raycast.argument2 { "type": "text", "placeholder": "website", "optional": true }
# @raycast.schemaVersion 1

open -a "$browser" -n --args --profile-directory="$1" "$2"