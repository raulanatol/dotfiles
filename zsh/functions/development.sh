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
