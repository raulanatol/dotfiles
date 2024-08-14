class SpacesHelper {
  static moveToSpace(number) {

    // const space = Space.active();
    // const window = Window.focused();
    // space.moveWindows([window]);
    // window.focus();
    const spaces = Space.all();
    console.log('SpacesHelper.js [9]', spaces);
    for (const a of spaces) {
      const windows = a.windows();
      for (const w of windows) {
        console.log('SpacesHelper.js [11]', w.title());
      }
    }
  }
}
