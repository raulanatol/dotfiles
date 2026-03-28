wtc() {
    if [ -z "$1" ]; then
        echo "Usage: wtc <feature_branch_name>"
        return 1
    fi
    wt switch -c "$1"
}

wtmm() {
    wt switch ^
}

load_tauri_signing_key() {
  local key_file="$HOME/.config/tauri/tauri-updater-keys"
  if [[ -f "$key_file" ]]; then
    export TAURI_SIGNING_PRIVATE_KEY="$(cat "$key_file")"
  fi
}
