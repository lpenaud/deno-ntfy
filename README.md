# deno-ntfy

Helper scripts to call [ntfy](https://ntfy.sh).

## PAM Script

`notify_ssh_success` sends a notification whenever an SSH session is opened or
closed on the host. It reads its configuration from environment variables and is
meant to be called from
[`pam_exec`](https://man7.org/linux/man-pages/man8/pam_exec.8.html).

At the end of `/etc/pam.d/sshd`

```
# ...
session optional pam_exec.so /usr/local/bin/notify_ssh_success.sh
```

Wrapper script `/usr/local/bin/notify_ssh_success.sh`:

```bash
#!/bin/bash
export NTFY_URL=https://yourinstance.ntfy
export NTFY_TOKEN=tk_your_token
export NTFY_TOPIC=your_topic

exec /usr/local/bin/notify_ssh_success
```

Where `/usr/local/bin/notify_ssh_success` is the compiled Deno binary.

Both files must be owned by root, since they hold the ntfy credentials:

```sh
sudo chown root:root /usr/local/bin/notify_ssh_success.sh /usr/local/bin/notify_ssh_success
sudo chmod 711 /usr/local/bin/notify_ssh_success.sh
sudo chmod 755 /usr/local/bin/notify_ssh_success
```

You can test the hook without SSH by setting `PAM_TYPE` manually:

```sh
PAM_TYPE=open_session /usr/local/bin/notify_ssh_success.sh
```

Finally, subscribe to your topic in the ntfy app to receive the notifications.

### Environment variables

| Variable     | Description                                   |
| ------------ | --------------------------------------------- |
| `NTFY_URL`   | Base URL of your ntfy instance                |
| `NTFY_TOKEN` | ntfy access token (_Account → Access tokens_) |
| `NTFY_TOPIC` | Topic to publish to                           |

### Exit codes

| Code | Meaning                                                         |
| ---- | --------------------------------------------------------------- |
| `0`  | notification sent                                               |
| `1`  | invalid `PAM_TYPE` (neither `open_session` nor `close_session`) |
| `2`  | ntfy request failed (network, auth, …)                          |

## Build

Requires [Deno](https://deno.com). Cross-compile for your server architecture:

```sh
make        # builds output/aarch64-notify_ssh_success and output/x86_64-notify_ssh_success
make clean  # remove the output directory
```

Binaries are compiled with the smallest permission set possible: `--allow-net`
(access to your ntfy instance), `--allow-env` and `--allow-sys` (hostname).
