-- hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "E", function()
--    hs.execute("dot mac browser_goto", true)
-- end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "Z", function()
    hs.execute("dot mac zoom start", true)
end)

-- Irvue

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "w", function()
    hs.execute("dot irvue change", true)
end)


-- Slack

-- hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "comma", function()
--    hs.execute("dot slack status Lunch :ramen:", true)
--end)

--hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "", function()
--    hs.execute("dot slack status", true)
--end)

-- hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "8", function()
--    hs.execute("dot slack status Focus :safety_vest:", true)
-- end)