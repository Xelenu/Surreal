const soundDirs = {
  stp: "/static/stuff/soundboard/stp/",
  nstp: "/static/stuff/soundboard/nstp/"
};

const STP_FILES = [
  "mcdonalds-beeping-sound.mp3",
  "adrian-explain-our-friend-group.mp3",
  "ding-sound-effect_1.mp3",
  "discord-notification.mp3",
  "do-not-redeem.mp3",
  "extremely-loud-incorrect-buzzer.mp3",
  "five-nights-at-freddys-2-full-scream-sound.mp3",
  "im-spongebob.mp3",
  "metal-pipe-clang.mp3",
  "notification.mp3",
  "smoke-detector-beep.mp3",
  "tuco-get-out.mp3"
];

const NSTP_FILES = [
  "s-y-f-m.mp3",
  "you-stupid.mp3"
];

const allAudios = [];

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
const bassFilter = audioCtx.createBiquadFilter();
bassFilter.type = "lowshelf";
bassFilter.frequency.value = 150;
bassFilter.gain.value = 0;
bassFilter.connect(audioCtx.destination);

(function injectBassUI() {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "10px";
  wrap.style.margin = "10px 0 20px";

  const label = document.createElement("label");
  label.textContent = "Bass Boost";
  label.style.minWidth = "90px";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "-10";
  slider.max = "48";
  slider.step = "1";
  slider.value = "0";
  slider.style.width = "220px";
  slider.setAttribute("aria-label", "Bass Boost (dB)");

  const val = document.createElement("span");
  val.textContent = "0 dB";
  val.style.minWidth = "48px";

  slider.addEventListener("input", () => {
    const db = parseInt(slider.value, 10) || 0;
    bassFilter.gain.value = db;
    val.textContent = db + " dB";
  });

  wrap.appendChild(label);
  wrap.appendChild(slider);
  wrap.appendChild(val);
  document.body.insertBefore(wrap, document.body.firstChild);
})();

function formatLabel(filename) {
  const base = decodeURIComponent(filename).replace(/\.[^/.]+$/, "");
  return base.replace(/[-_]+/g, " ")
             .split(" ")
             .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))
             .join(" ");
}

function createSoundGrid(containerId, cols, count) {
  const container = document.getElementById(containerId);
  container.style.gridTemplateColumns = `repeat(${cols}, var(--btn-w))`;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const id = `${containerId}-btn-${r}-${c}`;
    const btn = document.createElement("button");
    btn.id = id;
    btn.className = "button";
    btn.textContent = `Button ${i + 1}`;
    container.appendChild(btn);
  }
}

function attachAudioToGraph(mediaEl) {
  const src = audioCtx.createMediaElementSource(mediaEl);
  src.connect(bassFilter);
  return src;
}

function assignSoundByIndex(containerId, index, fullUrl, label) {
  const cols = getComputedStyle(document.getElementById(containerId)).gridTemplateColumns.split(" ").length || 3;
  const r = Math.floor(index / cols);
  const c = index % cols;
  const id = `${containerId}-btn-${r}-${c}`;
  const btn = document.getElementById(id);
  if (!btn) return;
  if (label) btn.textContent = label;
  const audio = new Audio(fullUrl);
  audio.preload = "auto";
  allAudios.push(audio);
  attachAudioToGraph(audio);
  btn.onclick = async () => {
    if (audioCtx.state !== "running") {
      await audioCtx.resume();
    }
    audio.currentTime = 0;
    audio.play();
  };
}

function buildBoardFromList(containerId, folderKey, files, cols = 3) {
  const base = soundDirs[folderKey];
  createSoundGrid(containerId, cols, files.length);
  files.forEach((fname, i) => {
    assignSoundByIndex(containerId, i, base + fname, formatLabel(fname));
  });
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    allAudios.forEach(a => { a.pause(); a.currentTime = 0; });
  }
});

buildBoardFromList("soundboard-stp", "stp", STP_FILES, 3);
buildBoardFromList("soundboard-nstp", "nstp", NSTP_FILES, 3);
