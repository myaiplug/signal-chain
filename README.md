# The Beat Mob × bTHIRTYthreezy

The personal site of Brian Jutz: The Beat Mob catalog, the bTHIRTYthreezy solo project, and the people around them (Green Thumbz, Ceasa Matic), plus the audio tools he builds.

**Live:** https://myaiplug.github.io/signal-chain/
**Store:** https://beat-mob-store.vercel.app/

## How playback works

- **One track at a time.** Every player on the page (the Spotify decks, Vault, AI Bay, the beat store previews, the rack demos, the FanTune iframe and the house soundtrack) goes through `src/audio/bus.ts`. Starting one stops all the others. `src/audio/mediaGuard.ts` is a backstop: any `<audio>` element that starts pauses every other one.
- **Random opener.** `src/data/intro.ts` picks one of the four artists on each visit and never repeats the previous visit's pick. Add `?opener=beatmob|b33|greenthumbz|ceasa` to the URL to force one. The pick's Spotify player is loaded in the hero behind the entry screen. **Enter & Play** is the user gesture that starts it through the Spotify iFrame API. If the browser still holds the audio back, the deck asks for one tap.

## Develop

```bash
npm ci
npm run dev      # http://localhost:5173/signal-chain/
npm run build    # outputs dist/, published to the gh-pages branch
```

Audio and images are stored in Git LFS (`git lfs pull`).
