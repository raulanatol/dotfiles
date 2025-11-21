local wezterm = require 'wezterm'
local module = {}

function module.apply_to_config(config)
    config.scrollback_lines = 10000
    config.force_reverse_video_cursor = false

    wezterm.on('format-window-title', function(tab, pane, tabs, panes, config)
        if tab.tab_title then
            return tab.tab_title
        end

        return ''
    end)

    local bar = wezterm.plugin.require("https://github.com/adriankarlen/bar.wezterm")
    bar.apply_to_config(config, {
        position = "bottom",
        padding = {
            left = 2,
            right = 2,
        },
        separator = {
            space = 1,
            left_icon = "",
            right_icon = "",
            field_icon = wezterm.nerdfonts.indent_line,
        },
        modules = {
            workspace = {
                enabled = false
            },
            pane = {
                enabled = false
            },
            username = {
                enabled = false
            },
            hostname = {
                enabled = false
            },
            clock = {
                enabled = false
            }
        }
    })
end

return module
