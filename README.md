# ❤ Birthday Website

A romantic, mobile-first birthday website. Everything you need to change is in **`config.js`**.

## What's inside

| Section | What she experiences |
|---|---|
| **Countdown** | Before her birthday, a live countdown to midnight (her phone's local time), with an optional skip button |
| **Lock screen** | A heart draws itself; she picks your anniversary date (Day / Month / Year): 7 September, any year from 2024. Picking another special day gets a sweet reaction, and a hint appears after a wrong try |
| **Our Dates** | A scrapbook of every date (Museum, Art museum, Movie, Dinner, Zoo…), with a tally by category and a tap-through photo strip |
| **Little Names I Call You** | Beluga (a swimming beluga that blows heart bubbles), Kaju Katli (a box of 9 sweets to bite) and Little Donkey (hops and says something sweet). A little beluga also swims across the page now and then |
| **Opening** | Hearts drift down, "Happy 22nd Birthday" writes itself in, her name fades in, and a gold **🎁 Scratch to reveal your gift** button appears |
| **Your gift** | A gold **🎁 Your gift** button waits in the bottom corner on every screen. It opens a scratch card; rubbing it reveals your song ("Kaju — You Feel Like Home"), which starts playing, and the ♫ button takes the gift's place |
| **Our Story** | A live "days together" counter and a timeline of your milestones |
| **Gallery** | Polaroid-style photos; tap one to view it full screen (swipe between them) |
| **Reasons I Love You** | A card deck she taps through, one reason at a time |
| **How Well Do You Know Us?** | A 5-question quiz with cute reactions and a final score |
| **Play With Me** | 8 mini games: Scratch to Reveal Your Gift (first, in gold), Cupid's Arrow, Match Our Moments, Catch My Love, Connect Our Stars, Pop the Balloons, Love Meter, and Heart Hunt (7 hearts hidden around the whole page) |
| **Make a Wish** | A cake whose candles she blows out by tapping, or by blowing into her mic |
| **Love Coupons** | Tickets she can redeem (a stamp lands on them; her phone remembers) |
| **Open When…** | Little letters for different moments: when she misses you, can't sleep, and more |
| **Love Letter** | An envelope that opens, then your letter types itself out |
| **Final Surprise** | A gift box that bursts open to reveal her real present or plan |

Rose petals drift across the whole site, and tapping anywhere releases a little heart. Two original animated teddy bears (Kajal's pink bear with a bow, and Anush's brown bear) blink, wave, snooze, hold hearts and dance in different places (drawn in `bears.js`).

The countdown's skip button disappears by itself at `skipUntil` (2 PM India time on 29 Nov).

## 1. Personalise it (edit `config.js`)

Open `config.js` in any text editor (VS Code, Notepad, TextEdit) and change:

- `herName`, `yourName`, `age`
- `birthday`: **midnight at the start of her birthday**, e.g. `"2026-11-30T00:00:00"`
- `allowSkip`: `false` hides the countdown's skip button, so she has to wait until midnight
- `togetherSince`: the day you got together
- `lock`: the date question, the answer (`YYYY-MM-DD`), the years in the picker, a hint, and reactions for other special days
- `dates`: one entry per date (add new ones at the end; `photos: [...]` gives a card several photos)
- `nicknames`: the lines Beluga, Kaju Katli and Little Donkey say

**Privacy:** your photos and song are listed in `.gitignore`, so they're never uploaded to the public GitHub copy. They only go to the live site.
- `story`, `gallery`, `reasons`, `letter`, `surprise`: the words
- `quiz`: questions about you two (and which option is the right answer)
- `coupons`, `openWhen`: the coupons and the little letters
- `games`: the messages each game reveals (in game text, `{her}` becomes her name and `{me}` yours)

**Rewrite the letter in your own words.** The sample is only a starting point.

## 2. Add photos

Put them in the `photos/` folder using these exact names (or change the names in `config.js`):

| File | Where it appears |
|---|---|
| `us.jpg` | Round photo on the opening screen |
| `story-1.jpg` … `story-5.jpg` | Timeline, one per milestone |
| `gallery-1.jpg` … `gallery-12.jpg` | Polaroid gallery |
| `surprise.jpg` (optional) | Final surprise; also set `photo: "photos/surprise.jpg"` in config |

Tips:
- **iPhone photos are often `.HEIC`**, which most browsers can't show. Convert them to `.jpg` first.
- Keep each photo under about **300 KB** (resize to about 1600px wide and compress with squoosh.app or tinypng.com) so the site loads fast on mobile data.
- If a photo is missing, the site shows a pretty heart placeholder instead of a broken image.

## 3. Add your song

Put the song in the `music/` folder as **`our-song.m4a`** and/or **`our-song.mp3`**. With `music.reveal: "scratch"` (the default here) it stays a surprise: it starts when she scratches her gift card (or opens the love letter), then plays every time she comes back. Use `reveal: "unlock"` to play it right after unlocking instead. No file means no music button, and the scratch card shows the `games.scratch.secret` text instead.

## 4. Preview it yourself

### Open it on your phone and other devices (same Wi-Fi)

1. **Windows:** double-click **`start-site.bat`**. **Mac/Linux:** run `python3 serve.py` in this folder.
2. A window shows two addresses:
   - `http://localhost:1130` for this computer
   - `http://192.168.x.x:1130` for phones and other devices on the same Wi-Fi
3. Type the second address into your phone's browser. Keep the window open while you're using it. **Ctrl+C** stops it.

Only this folder is shared, wherever you start it from. Your other files stay private.

**If your phone can't connect:**
- **Windows Firewall:** the first time, Windows asks whether to allow Python. Tick **Private networks** and click **Allow**. If you missed it, open *Allow an app through Windows Firewall* and tick **Private** for Python.
- **Network type:** your Wi-Fi must be a *Private* network on the PC. Go to Settings → Network & internet → Wi-Fi → your network → set **Network profile type** to **Private**.
- **Guest Wi-Fi** (or "AP isolation" on the router) blocks devices from seeing each other. Use the main Wi-Fi.
- **Port already in use:** run `python serve.py 8080` and use `:8080` instead.

Over a local network, blowing into the mic doesn't work, because phones only allow the mic on secure `https` sites. Tapping the flames works everywhere, and the mic works once the site is on Netlify.

### Preview mode

Add `?preview` to the address (e.g. `http://localhost:1130/?preview`). It skips the countdown, and each empty photo slot shows the file name it's waiting for. The **Skip the countdown** button also works without it.

## 5. Put it online (free, about 2 minutes)

**Easiest: Netlify Drop**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page
3. You get a link like `https://something-random.netlify.app`. In *Site settings → Change site name* you can rename it, e.g. `happy-birthday-<her-name>.netlify.app`.

**Optional:** buy a custom domain (about $10/year) and connect it in Netlify's *Domain settings*.

Alternatives: Vercel, or GitHub Pages.

## 6. Final checklist before the big day

- [ ] `birthday` date and time are correct (set to 30 Nov 2026)
- [ ] Decide on the countdown skip button: `allowSkip: false` makes her wait until midnight
- [ ] The lock answer works; try a few spellings she might type and add them to `answers`
- [ ] All photos show up (open `?preview` and look for any file names still visible)
- [ ] Tap **🎁 Your gift**, scratch the card, and the song plays
- [ ] Tested on a phone like hers (iPhone vs Android)
- [ ] Send her the link **without** `?preview` so she gets the countdown and lock screen

## Good to know

- The lock screen is a sweet gate, not real security: the answer is visible in the page source. The site is also hidden from search engines.
- Once she has unlocked it, her phone remembers, and she just taps "Open" on later visits.
- The mic "blow out the candles" feature needs the site to be on **https** (Netlify gives you this automatically). Tapping the flames always works.
- Colours are defined at the top of `style.css` if you want a different palette.
