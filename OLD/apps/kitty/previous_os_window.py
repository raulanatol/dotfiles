from kitty.fast_data_types import current_os_window, focus_os_window

def main(args):
    pass

from kittens.tui.handler import result_handler
@result_handler(no_ui=True)
def handle_result(args, answer, target_window_id, boss):
    l = list(boss.os_window_map.keys())
    osw_id = current_os_window()
    if osw_id in l:
        i = l.index(osw_id) - 1
        if i < 0:
            i = len(l) - 1
        focus_os_window(l[i], True)
