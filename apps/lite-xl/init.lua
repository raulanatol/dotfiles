-- put user settings here
-- this module will be loaded after everything else when the application starts
-- it will be automatically reloaded when saved

local core = require "core"
local keymap = require "core.keymap"
local config = require "core.config"
local style = require "core.style"

local home_files = os.getenv("HOME") .. "/.dotfiles/apps/lite-xl"
------------------------------ Themes ----------------------------------------

-- light theme:
-- core.reload_module("colors.summer")

--------------------------- Key bindings -------------------------------------

-- Default commands: https://github.com/lite-xl/lite-xl/blob/master/data/core/keymap.lua#L240

keymap.add {
    ["ctrl+k"] = "core:find-command"
}


------------------------------- Fonts ----------------------------------------

style.font = renderer.font.load(home_files .. "/fonts/JetBrains/JetBrainsMono-Regular.ttf", 13 * SCALE)
style.code_font = renderer.font.load(home_files .. "/fonts/JetBrains/JetBrainsMono-Regular.ttf", 16 * SCALE)

--
-- font names used by lite:
-- style.font          : user interface
-- style.big_font      : big text in welcome screen
-- style.icon_font     : icons
-- style.icon_big_font : toolbar icons
-- style.code_font     : code
--
-- the function to load the font accept a 3rd optional argument like:
--
-- {antialiasing="grayscale", hinting="full"}
--
-- possible values are:
-- antialiasing: grayscale, subpixel
-- hinting: none, slight, full

------------------------------ Plugins ----------------------------------------

-- enable or disable plugin loading setting config entries:

-- enable trimwhitespace, otherwise it is disable by default:
-- config.trimwhitespace = true
--
-- disable detectindent, otherwise it is enabled by default
-- config.detectindent = false
