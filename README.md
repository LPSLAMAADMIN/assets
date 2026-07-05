# Trust Wallet Assets Info

![Check](https://github.com/trustwallet/assets/workflows/Check/badge.svg)

## Overview

Trust Wallet token repository is a comprehensive, up-to-date collection of information about several thousands (!) of crypto tokens.

[Trust Wallet](https://trustwallet.com) uses token logos from this source, alongside a number of other projects.

The repository contains token info from several blockchains, info on dApps, staking validators, etc.
For every token a logo and optional additional information is available (such data is not available on-chain).

Such a large collection can be maintained only through a community effort, so _feel free to add your token_.

<center><img src='https://trustwallet.com/assets/images/media/assets/horizontal_blue.png' height="200"></center>

## How to add token

Please note that __brand new tokens are not accepted__,
the projects have to be sound, with information available, and __non-minimal circulation__
(for limit details see <https://developer.trustwallet.com/listing-new-assets/requirements>).

### Assets App

The [Assets web app](https://assets.trustwallet.com) can be used for most new token additions (Github account is needed).

### Quick starter

Details of the repository structure and contribution guidelines are listed on the
[Developers site](https://developer.trustwallet.com/listing-new-assets/new-asset).
Here is a quick starter summary for the most common use case.


## Documentation

For details, see the [Developers site](https://developer.trustwallet.com):

- [Contribution guidelines](https://developer.trustwallet.com/listing-new-assets/repository_details)

- [FAQ](https://developer.trustwallet.com/listing-new-assets/faq)

## Scripts

There are several scripts available for maintainers:

- `make check` -- Execute validation checks; also used in continuous integration.
- `make fix` -- Perform automatic fixes where possible
- `make update-auto` -- Run automatic updates from external sources, executed regularly (GitHub action)
- `make add-token asset_id=c60_t0x4Fabb145d64652a948d72533023f6E7A623C7C53` -- Create `info.json` file as asset template.
- `make add-tokenlist asset_id=c60_t0x4Fabb145d64652a948d72533023f6E7A623C7C53` -- Adds a token to tokenlist.json.
- `make add-tokenlist-extended asset_id=c60_t0x4Fabb145d64652a948d72533023f6E7A623C7C53` -- Adds a token to tokenlist-extended.json.

## On Checks

This repo contains a set of scripts for verification of all the information. Implemented as Golang scripts, available through `make check`, and executed in CI build; checks the whole repo.
There are similar check logic implemented:

- in assets-management app; for checking changed token files in PRs, or when creating a PR.  Checks diffs, can be run from browser environment.
- in merge-fee-bot, which runs as a GitHub app shows result in PR comment. Executes in a non-browser environment.

## Trading pair maintenance

Info on supported trading pairs are stored in `tokenlist.json` files.
Trading pairs can be updated --
from Uniswap/Ethereum and PancakeSwap/Smartchain -- using update script (and checking in changes).
Minimal limit values for trading pair inclusion are set in the [config file](https://github.com/trustwallet/assets/blob/master/.github/assets.config.yaml).
There are also options for force-include and force-exclude in the config.

## Disclaimer

Trust Wallet team allows anyone to submit new assets to this repository. However, this does not mean that we are in direct partnership with all of the projects.

Trust Wallet team will reject projects that are deemed as scam or fraudulent after careful review.
Trust Wallet team reserves the right to change the terms of asset submissions at any time due to changing market conditions, risk of fraud, or any other factors we deem relevant.

Additionally, spam-like behavior, including but not limited to mass distribution of tokens to random addresses will result in the asset being flagged as spam and possible removal from the repository.

## LPS Platform — Production Deployment

The LPS Platform (v1.0.0-rc4) is production-ready. Deploy the full stack:

```bash
git clone https://github.com/LPSLAMAADMIN/lps-platform.git
cd lps-platform
git checkout v1.0.0-rc4

./scripts/init-secrets.sh
# Edit .env with production values

docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
./scripts/migrate.sh deploy
./scripts/health-check.sh
```

See [Infrastructure Guide](INFRASTRUCTURE_GUIDE.md) for full details.

## LPS Platform Documentation

| Document | Description |
|----------|-------------|
| [RC4 Certification](RC4_CERTIFICATION.md) | Production readiness certification (97/100) |
| [Security Hardening Report](SECURITY_HARDENING_REPORT.md) | TLS, penetration testing, container security |
| [Infrastructure Guide](INFRASTRUCTURE_GUIDE.md) | Architecture, deployment, operations |
| [Monitoring Guide](MONITORING_GUIDE.md) | Prometheus, Grafana, Alertmanager, Loki |
| [Production Checklist](PRODUCTION_CHECKLIST.md) | Pre/post-deployment checklist |
| [Go-Live Checklist](GO_LIVE_CHECKLIST.md) | Required steps before live customer data |
| [Release Notes v1.0.0-rc4](RELEASE_NOTES_v1.0.0-rc4.md) | Full release changelog |
| [Architecture](ARCHITECTURE.md) | System architecture |
| [Deployment Guide](DEPLOYMENT_GUIDE.md) | Step-by-step deployment |
| [Operations Manual](OPERATIONS_MANUAL.md) | Day-to-day operations |
| [Known Limitations](KNOWN_LIMITATIONS.md) | Current limitations |

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
