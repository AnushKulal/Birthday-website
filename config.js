/* =====================================================================
   ❤  EDIT THIS FILE  ❤
   ---------------------------------------------------------------------
   Everything on the website comes from here: names, dates, your story,
   photos, reasons, the letter and the final surprise.
   You don't need to touch any other file.

   Rules for editing:
   - Keep text inside the quotes:  "like this"
   - If your text contains a double quote, write it as \"  (or use ’ ‘ “ ”)
   - Keep the commas at the end of each line/item
   - Lines starting with // are notes for you and are ignored
   ===================================================================== */

window.SITE = {

  /* ---------- 1. The basics ---------- */
  herName: "My Love",          // ← her name or your nickname for her
  yourName: "Your Name",       // ← signs the letter and the footer
  age: null,                   // ← e.g. 24 shows "Happy 24th Birthday". Leave null to hide it.

  // Midnight at the start of her birthday. The countdown uses HER phone's clock,
  // so this is midnight wherever she is. Format: "YYYY-MM-DDTHH:MM:SS"
  birthday: "2026-11-30T00:00:00",

  // Show a "Skip the countdown" button on the countdown screen.
  // Set to false before sending her the link if she should wait until midnight!
  allowSkip: true,

  // The day you got together, for the live "days together" counter. Use null to hide it.
  togetherSince: "2023-02-14",


  /* ---------- 2. The lock screen ---------- */
  // A question only she can answer. (It's a sweet gate, not real security:
  // anyone who knows how to view page source could find the answer.)
  lock: {
    enabled: true,                            // false = just a "Tap to open" button
    question: "Where did we go on our first date?",
    answers: ["coffee shop", "cafe", "starbucks"],  // any of these unlock it (capitals don't matter)
    hint: "Think warm drinks and nervous smiles ☕",
  },


  /* ---------- 3. Music ---------- */
  // Put your song in the "music" folder with exactly this file name.
  // It starts when she unlocks the site and loops softly. Use src: null to turn music off.
  music: {
    src: "music/our-song.mp3",
    title: "Our Song",
  },


  /* ---------- 4. Opening screen ---------- */
  hero: {
    photo: "photos/us.jpg",    // a photo of the two of you (shown in a circle)
    message: "Today the world got a little more beautiful, because it’s the day you came into it. " +
             "This little corner of the internet is my gift to you: our story, our memories, " +
             "and all the reasons I love you.",
  },


  /* ---------- 5. Our story (timeline) ---------- */
  // Add or remove items freely. Photos are optional: use photo: null for none.
  story: [
    {
      date: "March 2023",
      title: "The Day We Met",
      text: "I didn’t know it yet, but my whole life was about to change. You smiled, and somehow everything felt a little brighter.",
      photo: "photos/story-1.jpg",
    },
    {
      date: "April 2023",
      title: "Our First Date",
      text: "I was so nervous I barely touched my food. You laughed at my terrible jokes anyway, and that’s when I knew you were special.",
      photo: "photos/story-2.jpg",
    },
    {
      date: "August 2023",
      title: "Our First Trip",
      text: "New places, late nights and getting a little lost together. Every adventure is better with you beside me.",
      photo: "photos/story-3.jpg",
    },
    {
      date: "Some ordinary Tuesday",
      title: "The Day I Knew",
      text: "There was no big moment. Just you, being you. And I realised I never want to be anywhere else.",
      photo: "photos/story-4.jpg",
    },
    {
      date: "Today",
      title: "Your Birthday",
      text: "Another year of you in this world, and another year of me getting to love you. Lucky, lucky me.",
      photo: "photos/story-5.jpg",
    },
  ],


  /* ---------- 6. Photo gallery ---------- */
  // Add as many as you like. Tapping a photo opens it full screen.
  gallery: [
    { photo: "photos/gallery-1.jpg",  caption: "That smile ❤" },
    { photo: "photos/gallery-2.jpg",  caption: "Our first selfie" },
    { photo: "photos/gallery-3.jpg",  caption: "Best trip ever" },
    { photo: "photos/gallery-4.jpg",  caption: "My favourite view" },
    { photo: "photos/gallery-5.jpg",  caption: "Being silly" },
    { photo: "photos/gallery-6.jpg",  caption: "Lazy Sundays" },
    { photo: "photos/gallery-7.jpg",  caption: "Date night" },
    { photo: "photos/gallery-8.jpg",  caption: "You, being adorable" },
    { photo: "photos/gallery-9.jpg",  caption: "Little adventures" },
    { photo: "photos/gallery-10.jpg", caption: "Golden hour" },
    { photo: "photos/gallery-11.jpg", caption: "Always laughing" },
    { photo: "photos/gallery-12.jpg", caption: "Us, forever" },
  ],


  /* ---------- 7. Reasons I love you ---------- */
  // She taps through these one by one. Tip: write as many as her age!
  reasons: [
    "The way your eyes light up when you laugh.",
    "You make even the most ordinary days feel like an adventure.",
    "You believe in me, even on the days I don’t believe in myself.",
    "Your kindness, to everyone, even strangers.",
    "The way you say my name.",
    "You’re my favourite person to do absolutely nothing with.",
    "Your hugs fix everything. Every single time.",
    "You remember the little things that nobody else notices.",
    "You’re beautiful, inside and out, and I never get tired of looking at you.",
    "You make me want to be a better person.",
    "Your terrible singing in the car. Please never stop.",
    "The way you hold my hand without even thinking about it.",
    "You’re my best friend.",
    "You’re so strong, even when life gets hard.",
    "Every inside joke that only we understand.",
    "You always know exactly how to make me smile.",
    "Your patience with me (I know I test it).",
    "The way you take care of the people you love.",
    "With you, I feel at home anywhere.",
    "The future looks brighter because you’re in it.",
    "Simply because you’re you.",
  ],


  /* ---------- 8. Make a wish (birthday cake) ---------- */
  wish: {
    candles: 5,                                   // 1 to 10
    message: "I hope every single one of your wishes comes true. (Mine already did: it’s you.)",
  },


  /* ---------- 9. The love letter ---------- */
  // ✍️ This is a starting point. Rewrite it in your own words;
  // that’s what will make her cry (in a good way).
  letter: {
    greeting: "My dearest love,",
    paragraphs: [
      "Happy birthday. I’ve tried to write this letter a hundred times, and every time I realise there aren’t enough words for what you mean to me. But I’m going to try anyway.",
      "From the day you walked into my life, everything has been brighter. You’ve seen me at my best and at my worst, and somehow you’ve loved me through all of it. I don’t think you’ll ever know how much that means to me.",
      "Thank you for every laugh, every late-night conversation, every hug that made a bad day disappear, and every moment you chose to stay by my side. You make me want to be better, every single day.",
      "Today is all about you: the most beautiful, kind, funny, wonderful person I know. I hope this year brings you everything you’ve ever wished for, and I promise to be right next to you for all of it.",
    ],
    closing: "Forever and always yours,",
    // the signature uses yourName from the top of this file
  },


  /* ---------- 10. The final surprise (gift box) ---------- */
  // Reveal her real present, a date plan, a trip... anything.
  surprise: {
    teaser: "One more thing…",
    title: "Get Ready by 7 PM",
    message: "Your real present isn’t on this website. Dress up, birthday girl, because tonight I’m taking you somewhere special. ❤",
    photo: null,            // optional, e.g. "photos/surprise.jpg"
  },
};
