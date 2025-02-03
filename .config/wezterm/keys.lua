local wezterm = require 'wezterm'
local act = wezterm.action

local module = {}

function print_methods(obj)
    for key, value in pairs(obj) do
        if type(value) == "function" then
            wezterm.log_error("Método encontrado: " .. key)
        end
    end
end

function module.apply_to_config(config)
    config.keys = {
        {
            key = 'k',
            mods = 'CMD',
            action = act.ClearScrollback 'ScrollbackAndViewport'
        },
        {
            key = 'l',
            mods = 'CMD',
            action = act.ShowTabNavigator
        },
        {
            key = 'LeftArrow',
            mods = 'CMD',
            action = act.ActivateWindowRelative(-1)
        },
        {
            key = 'RightArrow',
            mods = 'CMD',
            action = act.ActivateWindowRelative(1)
        },
        {
            key = 'r',
            mods = 'CMD',
            action = act.PromptInputLine {
                description = 'Enter new name for window/tab',
                action = wezterm.action_callback(function(window, _, line)
                    -- line will be `nil` if they hit escape without entering anything
                    -- An empty string if they just hit enter
                    -- Or the actual line of text they wrote
                    if line then
                        window:active_tab():set_title(line)
                    end
                end),
            },
        },
    }
end

return module
