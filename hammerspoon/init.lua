hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "E", function()
    hs.execute("dot mac browser_goto", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "Z", function()
    hs.execute("dot mac zoom start", true)
end)