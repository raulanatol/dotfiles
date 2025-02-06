{
    description = "Wololoo Darwin system flake";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
        nix-darwin.url = "github:LnL7/nix-darwin/master";
        nix-darwin.inputs.nixpkgs.follows = "nixpkgs";
        nix-homebrew.url = "github:zhaofengli-wip/nix-homebrew";
    };

    outputs = inputs@{ self, nix-darwin, nixpkgs, nix-homebrew }:
    let configuration = { pkgs,  config, ... }: {
        nixpkgs.config.allowUnfree = true;

        # List packages installed in system profile. To search by name, run:
        # $ nix-env -qaP | grep wget
        environment.systemPackages = [
            pkgs.bat
            pkgs.bruno
            pkgs.bruno-cli
            pkgs.cyberduck
            pkgs.delta
            pkgs.discord
            pkgs.eza
            pkgs.fnm
            pkgs.fzf
            pkgs.gh
            pkgs.git-open
            pkgs.gnupg
            pkgs.jq
            pkgs.mongosh
            pkgs.obsidian
            pkgs.starship
            pkgs.stow
            pkgs.telegram-desktop
            pkgs.vim
            pkgs.wget
            pkgs.zellij
            pkgs.zoxide
        ];

        homebrew = {
            enable = true;
            brews = [
                "mas"
            ];
            casks = [
                "1password"
                "1password-cli"
#                "bartender"
#                "betterdisplay"
                "brave-browser"
                "cleanmymac"
                "cleanshot"
                "elgato-stream-deck"
                "figma"
                "firefox"
                "ghostty"
                "google-chrome"
                "google-chrome@canary"
                "jetbrains-toolbox"
                "little-snitch"
#                "loopback"
                "microsoft-excel"
                "microsoft-word"
                "miro"
                "ngrok"
                "obs"
                "odrive"
                "orbstack"
                "proxyman"
                "shifty"
                "slack"
#                "soundsource"
                "spotify"
                "whatsapp"
                "raycast"
            ];
            masApps = {
	            "One Thing" = 1604176982;
	            "Velja" = 1607635845;
                "Bitwarden" = 1352778147;
                "Spark" = 1176895641;
            };
            onActivation.cleanup = "zap";
            onActivation.autoUpdate = false;
            onActivation.upgrade = true;
        };

        fonts.packages = [
            pkgs.nerd-fonts.jetbrains-mono
        ];

        system.defaults = {
            ".GlobalPreferences"."com.apple.sound.beep.sound" = null;
            dock.autohide  = true;
            dock.persistent-apps = [
                "${pkgs.obsidian}/Applications/Obsidian.app"
            ];
            loginwindow.GuestEnabled  = false;
            NSGlobalDomain.AppleICUForce24HourTime = true;
            NSGlobalDomain.AppleInterfaceStyle = "Dark";
            NSGlobalDomain.KeyRepeat = 2;
        };

        # Necessary for using flakes on this system.
        nix.settings.experimental-features = "nix-command flakes";

        # Enable alternative shell support in nix-darwin.
        # programs.fish.enable = true;
        # Set Git commit hash for darwin-version.
        system.configurationRevision = self.rev or self.dirtyRev or null;

        # Used for backwards compatibility, please read the changelog before changing.
        # $ darwin-rebuild changelog
        system.stateVersion = 6;

        # The platform the configuration will be used on.
        nixpkgs.hostPlatform = "aarch64-darwin";
    };
    in
    {
        # Build darwin flake using:
        # $ darwin-rebuild build --flake .#simple
        darwinConfigurations."mini" = nix-darwin.lib.darwinSystem {
            modules = [
                configuration
                nix-homebrew.darwinModules.nix-homebrew
                {
                    nix-homebrew = {
                        enable = true;
                        enableRosetta = true;
                        user = "raulanatol";
                        autoMigrate = true;

                    };
                }
            ];
        };
        # Expose the package set, including overlays, for convenience.
        darwinPackages = self.darwinConfigurations."mini".pkgs;
    };
}
