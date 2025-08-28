local wezterm = require 'wezterm'
local module = {}

function module.apply_to_config(config)
    config.scrollback_lines = 10000

    wezterm.on('format-window-title', function(tab, pane, tabs, panes, config)
        if tab.tab_title then
            return tab.tab_title
        end

        return ''
    end)
end

return module
