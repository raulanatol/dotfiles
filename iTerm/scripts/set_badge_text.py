#!/usr/bin/env python3.7

import sys
import iterm2

if len(sys.argv) != 2:
    print("🚨 set_badge_text.py <title> needs a title")
    sys.exit(1)

async def main(connection):
    text = sys.argv[1]
    app = await iterm2.async_get_app(connection)
    window = app.current_terminal_window
    if window is not None:
        session = window.current_tab.current_session
        change = iterm2.LocalWriteOnlyProfile()
        change.set_badge_text(text)
        await session.async_set_profile_properties(change)
    else:
        # You can view this message in the script console.
        print("🚨 current window")

iterm2.run_until_complete(main)
