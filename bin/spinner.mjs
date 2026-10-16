export class Spinner {
  constructor(initialText = "", options = {}) {
    this.text = initialText;
    this.compact = options.compact || false;

    this.isUnicode =
      process.platform !== "win32" ||
      Boolean(
        process.env.WT_SESSION ||
        process.env.TERM_PROGRAM ||
        process.env.TERM === "xterm-256color" ||
        process.env.TERM === "alacritty" ||
        process.env.ConEmuTask ||
        (process.stdout.encoding && process.stdout.encoding.toLowerCase().includes("utf"))
      );

    this.stream = process.stderr;
    this.isTTY = Boolean(this.stream.isTTY);
    this.timer = null;
    this.tick = 0;
    this.hasRendered = false;

    this.width = 44;
    this.height = 10;
    this.perimeter = [];
    this._initPerimeter();

    this.asciiUnicode = [
      "██╗  ██╗██╗██████╗  ██████╗ ",
      "██║  ██║██║██╔══██╗██╔═══██╗",
      "███████║██║██████╔╝██║   ██║",
      "██╔══██║██║██╔══██╗██║   ██║",
      "██║  ██║██║██║  ██║╚██████╔╝",
      "╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ "
    ];

    this.asciiPlain = [
      "  _    _  _____  _____    ____  ",
      " | |  | ||_   _||  __ \\  / __ \\ ",
      " | |__| |  | |  | |__) || |  | |",
      " |  __  |  | |  |  _  / | |  | |",
      " | |  | | _| |_ | | \\ \\ | |__| |",
      " |_|  |_||_____||_|  \\_\\ \\____/ "
    ];

    this.inlineFrames = this.isUnicode
      ? ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
      : ["|", "/", "-", "\\"];

    this._cleanupHandler = () => {
      this.stop();
    };
    process.once("exit", this._cleanupHandler);
  }

  _initPerimeter() {
    const w = this.width;
    const h = this.height;
    for (let x = 0; x < w; x++) this.perimeter.push({ x, y: 0 });
    for (let y = 1; y < h - 1; y++) this.perimeter.push({ x: w - 1, y });
    for (let x = w - 1; x >= 0; x--) this.perimeter.push({ x, y: h - 1 });
    for (let y = h - 2; y >= 1; y--) this.perimeter.push({ x: 0, y });
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
      this.tick++;
      this.render();
    }, 45);
    return this;
  }

  render() {
    if (!this.isTTY) return;
    if (this.compact) {
      const frame = this.inlineFrames[this.tick % this.inlineFrames.length];
      this.stream.write(`\r\x1b[2K\x1b[36m${frame}\x1b[0m ${this.text}`);
      return;
    }

    const frameStr = this._buildBoxFrame(this.tick, this.text);
    if (!this.hasRendered) {
      this.stream.write(frameStr + "\n");
      this.hasRendered = true;
    } else {
      this.stream.write(`\x1b[${this.height}A\r` + frameStr + "\n");
    }
  }

  _buildBoxFrame(tick, statusText, state = "running") {
    const w = this.width;
    const h = this.height;
    const P = this.perimeter.length;
    const isU = this.isUnicode;

    const tracerMap = new Map();
    if (state === "running") {
      const trail = isU
        ? [
            "\x1b[1;97m█\x1b[0m",
            "\x1b[1;36m█\x1b[0m",
            "\x1b[1;36m█\x1b[0m",
            "\x1b[1;36m█\x1b[0m",
            "\x1b[36m▓\x1b[0m",
            "\x1b[36m▓\x1b[0m",
            "\x1b[36m░\x1b[0m",
            "\x1b[36m░\x1b[0m"
          ]
        : [
            "\x1b[1;97m#\x1b[0m",
            "\x1b[1;36m#\x1b[0m",
            "\x1b[1;36m#\x1b[0m",
            "\x1b[1;36m#\x1b[0m",
            "\x1b[36m=\x1b[0m",
            "\x1b[36m=\x1b[0m",
            "\x1b[36m-\x1b[0m",
            "\x1b[36m-\x1b[0m"
          ];
      for (let i = 0; i < trail.length; i++) {
        tracerMap.set((tick - i + P) % P, trail[i]);
      }
    }

    const borderChar = (y, x, p) => {
      if (tracerMap.has(p)) return tracerMap.get(p);
      let color = "\x1b[90m";
      if (state === "success") color = "\x1b[32m";
      if (state === "fail") color = "\x1b[31m";
      if (state === "warn") color = "\x1b[33m";

      if (isU) {
        if (y === 0 && x === 0) return `${color}╔\x1b[0m`;
        if (y === 0 && x === w - 1) return `${color}╗\x1b[0m`;
        if (y === h - 1 && x === w - 1) return `${color}╝\x1b[0m`;
        if (y === h - 1 && x === 0) return `${color}╚\x1b[0m`;
        if (y === 0 || y === h - 1) return `${color}═\x1b[0m`;
        return `${color}║\x1b[0m`;
      } else {
        if ((y === 0 || y === h - 1) && (x === 0 || x === w - 1)) return `${color}+\x1b[0m`;
        if (y === 0 || y === h - 1) return `${color}-\x1b[0m`;
        return `${color}|\x1b[0m`;
      }
    };

    const grid = Array.from({ length: h }, () => Array(w).fill(" "));

    for (let p = 0; p < this.perimeter.length; p++) {
      const { x, y } = this.perimeter[p];
      grid[y][x] = borderChar(y, x, p);
    }

    // Logo
    const ascii = isU ? this.asciiUnicode : this.asciiPlain;
    const pad = Math.max(1, Math.floor((w - 2 - ascii[0].length) / 2));
    for (let i = 0; i < 6; i++) {
      const line = ascii[i];
      for (let c = 0; c < line.length; c++) {
        grid[1 + i][1 + pad + c] = "\x1b[1;36m" + line[c] + "\x1b[0m";
      }
    }

    // Status line
    let iconBracketL = "\x1b[33m[\x1b[0m";
    let iconDot = "\x1b[33m●\x1b[0m";
    let iconBracketR = "\x1b[33m]\x1b[0m";

    if (state === "success") {
      iconBracketL = "\x1b[32m[\x1b[0m";
      iconDot = isU ? "\x1b[32m✔\x1b[0m" : "\x1b[32mOK\x1b[0m";
      iconBracketR = "\x1b[32m]\x1b[0m";
    } else if (state === "fail") {
      iconBracketL = "\x1b[31m[\x1b[0m";
      iconDot = isU ? "\x1b[31m✖\x1b[0m" : "\x1b[31mXX\x1b[0m";
      iconBracketR = "\x1b[31m]\x1b[0m";
    } else if (state === "warn") {
      iconBracketL = "\x1b[33m[\x1b[0m";
      iconDot = isU ? "\x1b[33m⚠\x1b[0m" : "\x1b[33m!!\x1b[0m";
      iconBracketR = "\x1b[33m]\x1b[0m";
    }

    const maxStatusLen = w - 9;
    const cleanStatus = statusText.length > maxStatusLen ? statusText.slice(0, maxStatusLen - 3) + "..." : statusText;

    grid[h - 2][1] = " ";
    grid[h - 2][2] = iconBracketL;
    grid[h - 2][3] = iconDot;
    grid[h - 2][4] = iconBracketR;
    grid[h - 2][5] = " ";
    for (let c = 0; c < cleanStatus.length; c++) {
      grid[h - 2][6 + c] = "\x1b[37m" + cleanStatus[c] + "\x1b[0m";
    }
    for (let c = 6 + cleanStatus.length; c < w - 1; c++) {
      grid[h - 2][c] = " ";
    }

    return grid.map((row) => row.join("")).join("\n");
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
    if (!this.isTTY) {
      this.stream.write(`[Hiro] ✔ ${text}\n`);
      return this;
    }
    if (this.compact) {
      this.stream.write(`\r\x1b[2K\x1b[32m✔\x1b[0m ${text}\n`);
      return this;
    }
    const finalFrame = this._buildBoxFrame(this.tick, text, "success");
    if (this.hasRendered) {
      this.stream.write(`\x1b[${this.height}A\r` + finalFrame + "\n");
    } else {
      this.stream.write(finalFrame + "\n");
    }
    return this;
  }

  fail(text = this.text) {
    this.stop();
    if (!this.isTTY) {
      this.stream.write(`[Hiro] ✖ ${text}\n`);
      return this;
    }
    if (this.compact) {
      this.stream.write(`\r\x1b[2K\x1b[31m✖\x1b[0m ${text}\n`);
      return this;
    }
    const finalFrame = this._buildBoxFrame(this.tick, text, "fail");
    if (this.hasRendered) {
      this.stream.write(`\x1b[${this.height}A\r` + finalFrame + "\n");
    } else {
      this.stream.write(finalFrame + "\n");
    }
    return this;
  }

  warn(text = this.text) {
    this.stop();
    if (!this.isTTY) {
      this.stream.write(`[Hiro] ⚠ ${text}\n`);
      return this;
    }
    if (this.compact) {
      this.stream.write(`\r\x1b[2K\x1b[33m⚠\x1b[0m ${text}\n`);
      return this;
    }
    const finalFrame = this._buildBoxFrame(this.tick, text, "warn");
    if (this.hasRendered) {
      this.stream.write(`\x1b[${this.height}A\r` + finalFrame + "\n");
    } else {
      this.stream.write(finalFrame + "\n");
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
