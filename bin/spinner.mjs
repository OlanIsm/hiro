export class Spinner {
  constructor(initialText = "") {
    this.text = initialText;
    const isUnicode =
      process.platform !== "win32" ||
      Boolean(
        process.env.WT_SESSION ||
        process.env.TERM_PROGRAM ||
        process.env.TERM === "xterm-256color" ||
        process.env.TERM === "alacritty" ||
        process.env.ConEmuTask ||
        (process.stdout.encoding && process.stdout.encoding.toLowerCase().includes("utf"))
      );

    this.frames = isUnicode
      ? ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
      : ["-", "\\", "|", "/"];
    this.successIcon = isUnicode ? "✔" : "[OK]";
    this.errorIcon = isUnicode ? "✖" : "[FAIL]";
    this.warnIcon = isUnicode ? "⚠" : "[WARN]";
    this.frameIndex = 0;
    this.timer = null;
    this.stream = process.stderr;
    this.isTTY = Boolean(this.stream.isTTY);

    this._cleanupHandler = () => {
      this.stop();
    };
    process.once("exit", this._cleanupHandler);
  }

  start(text) {
    if (text) this.text = text;
    if (!this.isTTY) {
      if (this.text) this.stream.write(`[Hiro] ${this.text}...\n`);
      return this;
    }
    if (this.timer) clearInterval(this.timer);
    this.stream.write("\x1B[?25l");
    this.render();
    this.timer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.render();
    }, 80);
    return this;
  }

  render() {
    if (!this.isTTY) return;
    const frame = this.frames[this.frameIndex];
    this.stream.write(`\r\x1b[2K\x1b[36m${frame}\x1b[0m ${this.text}`);
  }

  update(text) {
    this.text = text;
    if (!this.isTTY) {
      this.stream.write(`[Hiro] ${this.text}...\n`);
    } else {
      this.render();
    }
    return this;
  }

  succeed(text = this.text) {
    this.stop();
    if (this.isTTY) {
      this.stream.write(`\r\x1b[2K\x1b[32m${this.successIcon}\x1b[0m ${text}\n`);
    } else {
      this.stream.write(`[Hiro] ${this.successIcon} ${text}\n`);
    }
    return this;
  }

  fail(text = this.text) {
    this.stop();
    if (this.isTTY) {
      this.stream.write(`\r\x1b[2K\x1b[31m${this.errorIcon}\x1b[0m ${text}\n`);
    } else {
      this.stream.write(`[Hiro] ${this.errorIcon} ${text}\n`);
    }
    return this;
  }

  warn(text = this.text) {
    this.stop();
    if (this.isTTY) {
      this.stream.write(`\r\x1b[2K\x1b[33m${this.warnIcon}\x1b[0m ${text}\n`);
    } else {
      this.stream.write(`[Hiro] ${this.warnIcon} ${text}\n`);
    }
    return this;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.isTTY) {
      this.stream.write("\x1B[?25h");
    }
    return this;
  }
}
