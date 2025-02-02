function helper_test() {
  // App.launch('Iterm').focus();

  osascript(`
    tell application "iTerm2"
      tell application "System Events"
        keystroke "n" using { command down }
      end tell
    end tell
  `)

  // osascript(`tell application "iTerm2"
  //     tell current session of current tab of current window
  //       write text "setupTargetMc"
  //       write text "sshmc2"
  //       write text "sudo su"
  //       write text "./installStuff.sh"
  //       write text "watch -n1 'docker ps --format=\\"{{.Names}} {{.Ports}} {{.Status}}\\"'"
  //       split horizontally with default profile
  //       split vertically with default profile
  //     end tell
  //   end tell`);
}
