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
  "youre-fu.mp3",
  "get-out-of-my-car-now.mp3",
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
const masterGain = audioCtx.createGain();
masterGain.gain.value = 1;
bassFilter.connect(masterGain);
masterGain.connect(audioCtx.destination);

(function injectControls() {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.alignItems = "center";
  wrap.style.gap = "16px";
  wrap.style.margin = "10px 0 20px";

  function addSlider(labelText, min, max, step, value, onInput) {
    const group = document.createElement("div");
    group.style.display = "flex";
    group.style.alignItems = "center";
    group.style.gap = "10px";
    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.minWidth = "95px";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(value);
    slider.style.width = "220px";
    const val = document.createElement("span");
    val.style.minWidth = "60px";
    val.textContent = labelText === "Bass Boost" ? value + " dB" : value + "%";
    slider.addEventListener("input", () => {
      onInput(slider.value);
      val.textContent = labelText === "Bass Boost" ? slider.value + " dB" : slider.value + "%";
    });
    group.appendChild(label);
    group.appendChild(slider);
    group.appendChild(val);
    wrap.appendChild(group);
  }

  addSlider("Bass Boost", -10, 24, 1, 0, v => { bassFilter.gain.value = parseInt(v, 10) || 0; });
  addSlider("Volume", 0, 100, 1, 100, v => { masterGain.gain.value = (parseInt(v, 10) || 0) / 100; });

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
    if (audioCtx.state !== "running") await audioCtx.resume();
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
