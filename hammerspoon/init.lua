hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "E", function()
    hs.execute("dot mac browser_goto", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "Z", function()
    hs.execute("dot mac zoom start", true)
end)

-- Irvue

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "w", function()
    hs.execute("dot irvue change", true)
end)

-- Slack Nologis

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "q", function()
    hs.execute("dot slack snooze Nologis 1", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "2", function()
    hs.execute("dot slack snooze Nologis 2", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "3", function()
    hs.execute("dot slack snooze Nologis 12", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "4", function()
    hs.execute("dot slack away Nologis", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "5", function()
    hs.execute("dot slack active Nologis", true)
end)

-- Slack Zazume

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "6", function()
    hs.execute("dot slack snooze Zazume 1", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "7", function()
    hs.execute("dot slack snooze Zazume 2", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "8", function()
    hs.execute("dot slack snooze Zazume 12", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "-", function()
    hs.execute("dot slack away Zazume", true)
end)

hs.hotkey.bind({ "cmd", "alt", "ctrl", "shift" }, "0", function()
    hs.execute("dot slack active Zazume", true)
end)
