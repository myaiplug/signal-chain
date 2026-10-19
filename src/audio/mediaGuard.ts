// Safety net under the audio bus: if ANY <audio>/<video> element starts
// (even one a component forgot to register), every other media element on the
// page is paused first. Web Audio buffer players and embeds go through the bus.
export function installMediaGuard() {
  const proto = HTMLMediaElement.prototype as HTMLMediaElement & { __tbmGuard?: boolean };
  if (proto.__tbmGuard) return;
  proto.__tbmGuard = true;

  const originalPlay = HTMLMediaElement.prototype.play;
  const active = new Set<HTMLMediaElement>();
  const tracked = new WeakSet<HTMLMediaElement>();

  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (!tracked.has(this)) {
      tracked.add(this);
      const drop = () => active.delete(this);
      this.addEventListener("pause", drop);
      this.addEventListener("ended", drop);
      this.addEventListener("emptied", drop);
    }
    active.forEach((el) => {
      if (el !== this && !el.paused) el.pause();
    });
    active.add(this);
    return originalPlay.call(this);
  };
}
