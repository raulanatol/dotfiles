local wezterm = require 'wezterm'
local theme = require 'theme'
local settings = require 'settings'
local keys = require 'keys'
local agents_deck = require 'plugins/agents_deck'

local config = wezterm.config_builder()

theme.apply_to_config(config)
settings.apply_to_config(config)
keys.apply_to_config(config)
-- Plugins
agents_deck.apply_to_config(config)

return config
