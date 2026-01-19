local wezterm = require 'wezterm'
local agent_deck = wezterm.plugin.require('https://github.com/Eric162/wezterm-agent-deck')
local module = {}

function module.apply_to_config(config)
    agent_deck.apply_to_config(config, {
        update_interval = 500, -- ms between status checks

        colors = {
            working = '#A6E22E',  -- green: agent processing
            waiting = '#E6DB74',  -- yellow: needs input
            idle = '#66D9EF',     -- blue: ready
            inactive = '#888888', -- gray: no agent
        },

        icons = {
            style = 'unicode', -- or 'nerd', 'emoji'
            unicode = { working = '●', waiting = '◔', idle = '○', inactive = '◌' },
        },

        notifications = { enabled = true, on_waiting = true },

        tab_title = {
            enabled = false
        },

        right_status = {
            enabled = true,
        }
    })
end

return module
