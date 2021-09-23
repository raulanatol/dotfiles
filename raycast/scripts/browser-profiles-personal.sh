#!/bin/bash

############################################
## Set your browser app                   ##
## "Google Chrome"                        ##
## "Brave Browser"                        ##
############################################

browser="Brave Browser"

# @raycast.title Open Personal browser
# @raycast.author raulanatol
# @raycast.authorURL https://github.com/raulanatol
# @raycast.description Open the Personal profile

# @raycast.icon ⛵
# @raycast.mode silent
# @raycast.packageName Browser
# @raycast.schemaVersion 1

open -a "$browser" -n --args --profile-directory="Profile 1"