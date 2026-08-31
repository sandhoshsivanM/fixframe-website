# Media assets

Drop real files in here and the site picks them up — no layout changes.

Every media slot in `src/content/` has a `src` field that is currently
omitted. Add a filename and the `Frame` component renders the real asset
instead of the designed placeholder.

```ts
// before — designed placeholder
cover: { ratio: "21/9", seed: "ananya-vikram-cover" }

// after — real file at /public/media/work/ananya-vikram-cover.jpg
cover: { ratio: "21/9", seed: "ananya-vikram-cover",
         src: "work/ananya-vikram-cover.jpg",
         alt: "Ananya and Vikram during the evening ceremony" }
```

`alt` becomes required once `src` is set — a public image without alt text
cannot be published (spec RULE-O9-9 / AC-O9-9).

## Expected files

Suggested paths. Anything under `public/media/` works; these just keep it tidy.

| Slot seed | Suggested path | Ratio | Used on |
|---|---|---|---|
| `hero-showreel` | `hero/showreel-poster.jpg` | 21/9 | Home hero |
| `ananya-vikram-cover` | `work/ananya-vikram-cover.jpg` | 21/9 | Home, Work, case study |
| `kestrel-cover` | `work/kestrel-cover.jpg` | 4/5 | Home, Work, case study |
| `harbour-cover` | `work/harbour-cover.jpg` | 4/5 | Home, Work, case study |
| `meera-cover` | `work/meera-cover.jpg` | 3/2 | Work, case study |
| `northline-cover` | `work/northline-cover.jpg` | 16/9 | Work, case study |
| `long-room-cover` | `work/long-room-cover.jpg` | 4/5 | Work, case study |
| `av-still-1..3` | `work/ananya-vikram/still-1.jpg` … | 4/5 | Case study gallery |
| `av-raw` / `av-graded` | `work/ananya-vikram/raw.jpg`, `graded.jpg` | 16/9 | Before/after, Editing page |
| `kestrel-master` | `work/kestrel/master-poster.jpg` | 16/9 | Case study video block |
| `kestrel-still-1..2` | `work/kestrel/still-1.jpg` … | 3/2 | Case study gallery |
| `harbour-still-1..2` | `work/harbour/still-1.jpg` … | 16/9 | Case study gallery |
| `northline-cropped` / `northline-framed` | `work/northline/cropped.jpg`, `framed.jpg` | 9/16 | Before/after |
| `reel-*` (6) | `reels/<name>.jpg` | 9/16 | Reels grid |
| `team-founder` / `team-dop` / `team-colour` | `team/<name>.jpg` | 4/5 | Studio page |
| `bts-1..3` | `studio/bts-1.jpg` … | 4/5, 3/2 | Studio page |

## Video

`Frame` also takes a `video` field. Set `src` to the poster and `video` to
the file — the poster paints first and the video attaches after, which is
the load order V1 C01 requires.

Keep web deliverables here, not camera masters. Under 8 MB per file for
stills; H.264 MP4 for video.
