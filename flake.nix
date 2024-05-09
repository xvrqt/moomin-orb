{
  outputs = _: {
    # Parent flake import the default module to install the site's package, and configure serving it with nginx
    nixosModules = {
      default = {
        lib,
        pkgs,
        config,
        ...
      }: let
        # Convenience
        pkgName = "moomin-orb";
        # Create a new derivation which simply copies the static site contents to the /nix/store
        website = pkgs.stdenv.mkDerivation {
          name = "website-${pkgName}";
          src = ./.;

          installPhase = ''
            cp -r $src/src $out
          '';
        };

        # Check if both the website service is enabled, and this specific site is enabled.
        cfgcheck = config.services.websites.enable && config.services.websites.sites.${pkgName}.enable;
        # Website url
        domain = config.services.websites.sites.${pkgName}.domain;
      in {
        # Create the option to enable this site, and set its domain name
        options = {
          services = {
            websites = {
              sites = {
                moomin-orb = {
                  enable = lib.mkEnableOption "See a picture in the Moomin-Orb (static website)";
                  domain = lib.mkOption {
                    type = lib.types.str;
                    default = "orb.xvrqt.com";
                    example = "gateway.xvrqt.com";
                    description = "Domain name for the website. In the form: sub.domain.tld, domain.tld";
                  };
                };
              };
            };
          };
        };

        config = {
          # Add the website to the system's packages
          environment.systemPackages = [website];

          # Configure a virtual host on nginx
          services.nginx.virtualHosts.${domain} = lib.mkIf cfgcheck {
            forceSSL = true;
            enableACME = true;
            acmeRoot = null;
            locations."/" = {
              root = "${website}";
            };
          };
        };
      };
    };
  };
}
