{
  description = "Node.js and pnpm development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    utils,
  }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs
          nodePackages.pnpm
        ];

        shellHook = ''
          echo "Nix environment loaded: Node $(node -v), pnpm $(pnpm -v)"
        '';
      };
    });
}
