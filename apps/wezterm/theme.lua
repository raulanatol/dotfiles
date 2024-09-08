local wezterm = require 'wezterm'
local module = {}

function module.apply_to_config(config)
    config.font = wezterm.font_with_fallback({
        'JetBrains Mono',
        "Apple Color Emoji"
    })

    config.font_size = 16.0
    config.line_height = 1.2

    config.colors = {
        foreground = '#acb1bd',
        background = '#282b33',

        selection_bg = '#12333f',
        selection_fg = '#95a0a0',

        ansi = {
            '#282b33',
            '#d17277',
            '#a0c180',
            '#c89c6d',
            '#6fb3bf',
            '#bb7bd7',
            '#6fb3bf',
            '#d0d0d0'
        },

        brights = {
            '#808080',
            '#d17277',
            '#a0c180',
            '#c89c6d',
            '#6fb3bf',
            '#bb7bd7',
            '#6fb3bf',
            '#feffff'
        }
    }

    config.use_fancy_tab_bar = false
    config.hide_tab_bar_if_only_one_tab = true
    config.window_background_opacity = 0.9
end

return module
