# Roadmap

Active work only. Completed framework behavior is described in [architecture](architecture.md); historical decisions live under [docs/superpowers](superpowers/).

## Verify Android and re-check iOS

Historical evidence from the Android implementation: create, search and delete passed individually on Google Contacts (Android 17, API 37); edit failed once after an earlier failure left the app in a bad state. This is not a passing full-suite result.

Still to do:

- Run the full Android suite twice with `WDIO_RETRIES=0`.
- Run the full iOS suite twice without retries after the shared screen changes.
- Review and remove leftover `Doe-` test contacts from earlier interrupted Android runs.
- Record device, OS, app version and dependency set alongside results.

See [development evidence](development.md#integration-prerequisites-and-pending-checks) for current integration availability. No fresh device pass is claimed by standards adoption.

## Explain unsupported execute commands

Some drivers reject arbitrary scripts through WebDriver `execute/sync` with `Method is not implemented`; native `mobile:` commands have different support. Investigate a clearer error wrapper or a supported native fallback before adding behavior. Current restart helpers already use `mobile:` commands.

## Out of scope

A single command for both platforms, real-device support and validation on other Android versions remain outside the demonstrated scope.
