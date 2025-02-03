local wezterm = require 'wezterm'
local theme = require 'theme'
local settings = require 'settings'
local keys = require 'keys'

local config = wezterm.config_builder()
theme.apply_to_config(config)
settings.apply_to_config(config)
keys.apply_to_config(config)

return config
