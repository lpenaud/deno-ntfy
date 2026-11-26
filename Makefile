CC=deno compile
CFLAGS=--no-prompt --allow-net --allow-env --allow-sys
SRCDIR=src
OUTDIR=output
MAIN=notify_ssh_success

all: $(OUTDIR) $(OUTDIR)/aarch64-$(MAIN) $(OUTDIR)/x86_64-$(MAIN)

$(OUTDIR):
	mkdir -p $(OUTDIR)

$(OUTDIR)/aarch64-$(MAIN): $(SRCDIR)/$(MAIN).ts $(SRCDIR)/ntfy.ts
	$(CC) --target aarch64-unknown-linux-gnu --output $@ $(CFLAGS) $<

$(OUTDIR)/x86_64-$(MAIN): $(SRCDIR)/$(MAIN).ts $(SRCDIR)/ntfy.ts
	$(CC) --target x86_64-unknown-linux-gnu --output $@ $(CFLAGS) $<

clean:
	rm -rf $(OUTDIR)
