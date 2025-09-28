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
  "syfm.mp3",
  "you-stupid-n.mp3"
];

const allAudios = [];

function formatLabel(filename) {
  const base = decodeURIComponent(filename).replace(/\.[^/.]+$/, "");
  return base.replace(/[-_]+/g, " ").split(" ")
    .map(w => w ? w[0].toUpperCase() + w.slice(1) : w)
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

function assignSoundByIndex(containerId, index, fullUrl, label) {
  const cols = getComputedStyle(document.getElementById(containerId)).gridTemplateColumns.split(" ").length || 3;
  const r = Math.floor(index / cols);
  const c = index % cols;
  const id = `${containerId}-btn-${r}-${c}`;
  const btn = document.getElementById(id);
  if (!btn) return;
  if (label) btn.textContent = label;
  const audio = new Audio(fullUrl);
  allAudios.push(audio);
  btn.onclick = () => {
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

// stop all sounds when space is pressed
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault(); // prevent page scroll
    allAudios.forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  }
});

buildBoardFromList("soundboard-stp", "stp", STP_FILES, 3);
buildBoardFromList("soundboard-nstp", "nstp", NSTP_FILES, 3);
