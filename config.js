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
  herName: "Kajal",            // ← her name or your nickname for her
  yourName: "Anush",           // ← signs the letter and the footer
  bornOn: "2004-11-30",        // her date of birth: the site works out her age (22 on 30 Nov 2026)
  age: null,                   // ← or type an age to override it; null = work it out from bornOn

  // Midnight at the start of her birthday. The countdown uses HER phone's clock,
  // so this is midnight wherever she is. Format: "YYYY-MM-DDTHH:MM:SS"
  birthday: "2026-11-30T00:00:00",

  // Show a "Skip the countdown" button on the countdown screen.
  // Set to false before sending her the link if she should wait until midnight!
  allowSkip: true,

  // The skip button disappears by itself at this moment (2 PM India time, 29 Nov).
  // After that she has to wait for the countdown. Use null to keep the button forever.
  skipUntil: "2026-11-29T14:00:00+05:30",

  // Your anniversary (the day you proposed), for the live "days together" counter. Use null to hide it.
  togetherSince: "2024-09-07",


  /* ---------- 2. The lock screen ---------- */
  // She picks a date (Day / Month / Year). It's a sweet gate, not real security:
  // anyone who knows how to view page source could find the answer.
  lock: {
    enabled: true,                            // false = just a "Tap to open" button
    type: "date",                             // "date" = date picker, "text" = typed answer
    question: "When is our anniversary?",
    answer: "2024-09-07",                     // YYYY-MM-DD: the day I proposed (7 September 2024)
    anyYear: true,                            // 7 Sep 2025 / 2026 also count (every anniversary is that day)
    years: [2023, 2024, 2025, 2026],          // years shown in the picker
    hint: "The day I asked you to be mine 💍 (think September…)",
    // sweet reactions when she picks one of your other special days
    nearMisses: {
      "2023-09-07": "Right day, but we weren’t together yet back then! 😄 Try a later year.",
      "2024-09-16": "That’s our first date at the museum 🏛️ So close! The anniversary is nine days earlier…",
      "2023-10-03": "That’s when we first chatted 💬 Our anniversary came almost a year later!",
      "2023-10-13": "That’s the day we became besties 💕 Keep going…",
      "2025-07-01": "That’s our art museum date at MAP 🎨 Lovely day, but not the one!",
      "2026-08-18": "Movie date! 🎬 Close, but not quite our anniversary.",
      "2026-09-06": "So close! That’s our dinner at Hellen’s, the night before our anniversary 🕯️",
      "2026-10-04": "That’s our zoo date 🐒 Go back a little…",
    },
    // used only when type is "text"
    answers: ["museum"],
  },


  /* ---------- 3. Music ---------- */
  // Your song: "Kaju — You Feel Like Home" (Take 2). It starts when she unlocks the site and loops softly.
  // Two copies: the original (m4a) and an MP3 backup; each browser plays the first one it supports.
  // Use src: null to turn music off.
  music: {
    src: ["music/our-song.m4a", "music/our-song.mp3"],
    title: "Kaju — You Feel Like Home",
    reveal: "scratch",   // keep the song a surprise until she scratches the card (or opens the letter); "unlock" = play right away
  },


  /* ---------- 4. Opening screen ---------- */
  hero: {
    photo: "photos/kajal.jpg",        // Kajal's photo, shown in the circle (already cropped square)
    photoFocus: "50% 50%",            // which part of the photo to centre on (x% y%)
    photoZoom: 1,                     // 1 = no extra zoom
    message: "Today the world got a little more beautiful, because it’s the day you came into it. " +
             "This little corner of the internet is my gift to you: our story, our memories, " +
             "and all the reasons I love you.",
  },


  /* ---------- 5. Our story (timeline) ---------- */
  // Add or remove items freely. Photos are optional: use photo: null for none.
  story: [
    {
      date: "3 October 2023",
      title: "Our First Chat",
      text: "One message, and somehow I couldn’t stop smiling at my phone. I had no idea how much it would change.",
      photo: null,                     // ← add a photo later if you like
    },
    {
      date: "13 October 2023",
      title: "Besties",
      text: "Just ten days later, you were my bestie. My favourite person to talk to, about everything and nothing.",
      photo: null,
    },
    {
      date: "7 September 2024",
      title: "The Day I Asked",
      text: "I asked you to be mine, and you said yes. The best yes of my life, and the day our anniversary begins.",
      photo: null,
    },
    {
      date: "16 September 2024",
      title: "Our First Date",
      text: "Flowers, nervous smiles and a whole science museum to explore at Visvesvaraya. I don’t remember a single invention. I only remember you.",
      photo: "photos/first-date.jpg",
      photoFocus: "52% 40%",
    },
    {
      date: "Today",
      title: "Your Birthday",
      text: "Another year of you in this world, and another year of me getting to love you. Lucky, lucky me.",
      photo: "photos/zoo-4.jpg",
      photoFocus: "50% 40%",
    },
  ],


  /* ---------- 6. Photo gallery ---------- */
  // Add as many as you like. Tapping a photo opens it full screen.
  gallery: [
    { photo: "photos/first-date.jpg",  caption: "Our first date 💐",          focus: "52% 40%" },
    { photo: "photos/first-date-2.jpg", caption: "That smile, that day 🌸",   focus: "50% 45%" },
    { photo: "photos/map-date.jpg",    caption: "Art lovers at MAP 🎨",        focus: "50% 30%" },
    { photo: "photos/map-date-2.jpg",  caption: "Our own masterpiece 🖼️",      focus: "50% 55%" },
    { photo: "photos/movie-date.jpg",  caption: "Movie night glow 🎬" },
    { photo: "photos/movie-date-2.jpg", caption: "Peace, love & popcorn ✌️",  focus: "40% 50%" },
    { photo: "photos/dinner-date.jpg", caption: "Candlelight at Hellen’s 🕯️" },
    { photo: "photos/zoo-1.jpg",       caption: "That look ❤" },
    { photo: "photos/zoo-2.jpg",       caption: "Found a bigger teddy 🐻",     focus: "50% 70%" },
    { photo: "photos/zoo-3.jpg",       caption: "Monkeying around 🐒" },
    { photo: "photos/zoo-4.jpg",       caption: "Cool kids 😎" },
    { photo: "photos/zoo-5.jpg",       caption: "Adventure mode 🌿" },
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
    "And reason #22: you’re turning 22, and somehow you get more beautiful every single year.",
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


  /* ---------- 9b. Our dates (a little scrapbook of every date) ---------- */
  // Add each date you go on. "category" groups them (Museum, Movie, Café, Beach…).
  dates: [
    {
      title: "The Museum Date",
      date: "16 September 2024",
      category: "Museum",
      emoji: "🏛️",
      place: "Visvesvaraya Industrial & Technological Museum",
      photos: [
        { src: "photos/first-date.jpg", focus: "52% 38%" },
        { src: "photos/first-date-2.jpg", focus: "50% 45%" },
      ],
      note: "Our very first date. A whole museum of engines, inventions and science, and the best chemistry in the building was ours. My greatest discovery that day? You. 🔬",
      first: true,
    },
    {
      title: "The Art Museum Date",
      date: "1 July 2025",
      category: "Museum",
      emoji: "🎨",
      place: "Museum of Art & Photography (MAP)",
      photos: [
        { src: "photos/map-date.jpg", focus: "50% 40%" },
        { src: "photos/map-date-2.jpg", focus: "50% 55%" },
      ],
      note: "Walls full of paintings and photographs, and I still couldn’t stop looking at you. My favourite work of art was standing right beside me.",
    },
    {
      title: "The Movie Date",
      date: "18 August 2026",
      category: "Movie",
      emoji: "🎬",
      place: "Watching Awarapan 2",
      photos: [
        { src: "photos/movie-date.jpg", focus: "50% 46%" },
        { src: "photos/movie-date-2.jpg", focus: "40% 50%" },
      ],
      note: "Blue cinema lights, a love story on the big screen, and my favourite love story sitting right next to me.",
    },
    {
      title: "Date Night",
      date: "6 September 2026",
      category: "Dinner",
      emoji: "🕯️",
      place: "Hellen’s Place",
      photo: "photos/dinner-date.jpg",
      photoFocus: "50% 45%",
      note: "The night before our second anniversary: candlelight, flowers on the table and you across from me. Two years in, and you still give me butterflies.",
    },
    {
      title: "The Zoo Date",
      date: "4 October 2026",
      category: "Zoo",
      emoji: "🐒",
      place: "Bannerghatta Zoo",
      // several photos: she can tap through them on the card
      photos: [
        { src: "photos/zoo-2.jpg", focus: "50% 70%" },
        { src: "photos/zoo-1.jpg", focus: "55% 45%" },
        { src: "photos/zoo-3.jpg", focus: "50% 45%" },
        { src: "photos/zoo-4.jpg", focus: "50% 40%" },
        { src: "photos/zoo-5.jpg", focus: "50% 50%" },
      ],
      note: "Bears, monkeys and a whole zoo full of animals, and you were still the cutest one there. We even found a teddy bigger than ours. 🐻",
    },
  ],
  // {next} becomes the next date's number
  nextDate: "Date No. {next} is loading… I’m already planning it 😉",


  /* ---------- 9c. Little names I call you ---------- */
  // ✍️ {her} becomes her name and {me} yours.
  nicknames: {
    title: "Little Names I Call You",
    sound: true,                       // cute little sounds when she taps them (false = silent)
    beluga: {
      name: "Beluga",
      caption: "Once upon a time, you were my Beluga, and you’ll always be my favourite one in the whole ocean.",
      messages: [
        "Hi, my Beluga! 💙",
        "Of all the fish in the sea (yes, I know belugas are whales), I’d still pick you.",
        "Belugas are the happiest whales. You make me the happiest human.",
        "Blub blub! That’s beluga for ‘I missed you’.",
        "Once upon a time you were my Beluga. You still are, and you always will be.",
        "The whole ocean isn’t as deep as how much I love you.",
      ],
      // what the little beluga says when she catches it swimming across the page
      buddyMessages: [
        "Blub blub! Found you, Beluga 💙",
        "Just swimming by to say I love you 🫧",
        "Happy birthday from the whole ocean! 🌊",
        "Keep exploring, there’s more love ahead 💕",
      ],
      swimAcross: true,
    },
    sweet: {
      name: "Kaju Katli",
      caption: "My favourite sweet in any box, and the sweetest thing in my life. Take a bite of each piece.",
      messages: [
        "You’re sweeter than every mithai in the shop.",
        "Silver on the outside, softest heart on the inside. Just like you.",
        "One smile from you is sweeter than a whole box of these.",
        "If you were a sweet, I’d never share you. Not even at Diwali.",
        "Birthdays, Diwali, ordinary Tuesdays: you make every day a celebration.",
        "I’d give you the last piece of kaju katli. That’s how I know it’s true love.",
        "Rare, precious and impossible to resist: my Kaju Katli.",
        "Nothing in any sweet shop comes close to you.",
      ],
      final: "Even a whole box of kaju katli isn’t as sweet as you, my Kaju Katli. ❤",
    },
    donkey: {
      name: "Little Donkey",
      caption: "And sometimes, my silly little donkey: the cutest, kindest, smartest little donkey in the whole world.",
      messages: [
        "Hee-haw! (That’s donkey for ‘I love you’.)",
        "Hee-haw-ppy Birthday, {her}! 🎂",
        "Stubborn? A little. Adorable? Always.",
        "The cutest little donkey in the world, and she’s all mine.",
        "Every donkey deserves carrots and cuddles. You get both. 🥕",
        "Silly sometimes, sweet always. My favourite little donkey.",
      ],
    },
  },


  /* ---------- 10. "How well do you know us?" quiz ---------- */
  // ✍️ These are examples: change the questions and answers to real ones about you two.
  // "answer" is the position of the right option: 0 = first, 1 = second, 2 = third, 3 = fourth.
  quiz: {
    questions: [
      { question: "When did we first chat?",
        options: ["3 October 2023", "13 October 2023", "7 September 2024", "16 September 2024"], answer: 0 },
      { question: "What do I love most about you?",
        options: ["Your smile", "Your laugh", "Your kindness", "Everything. Obviously."], answer: 3 },
      { question: "Who fell in love first?",
        options: ["You", "Me", "Same moment", "Still debating"], answer: 1 },
      { question: "How many days after I proposed did we go on our first date?",
        options: ["3 days", "9 days", "16 days", "A month"], answer: 1 },
      { question: "How much do I love you?",
        options: ["A little", "A lot", "More than food", "More than all the stars"], answer: 3 },
    ],
    right: ["Correct! You know me so well ❤", "Yes! 😍", "Of course you knew that.", "Right again, clever girl."],
    wrong: ["Nope! But I still love you 😄", "Not quite, love.", "Hmm… we need more dates to revise 😉"],
    results: {
      perfect: "Perfect score! You know us by heart. ❤",
      good: "So close! You clearly pay attention to us. 😍",
      low: "Ha! Looks like we need a lot more dates to study. 😉",
    },
  },


  /* ---------- 11. Love coupons ---------- */
  // She taps "Redeem" and gets a stamp. Her phone remembers which ones she has used.
  coupons: [
    { title: "One Endless Hug", text: "Valid anytime, anywhere. No time limit." },
    { title: "Breakfast in Bed", text: "Made by me, served with a kiss." },
    { title: "Movie Night", text: "You pick the movie. I won't complain. Promise." },
    { title: "A Day of Yes", text: "For one whole day, I say yes to everything you ask." },
    { title: "Win Any Argument", text: "Use it wisely. You are automatically right." },
    { title: "Surprise Date", text: "I plan everything. You just show up looking beautiful." },
  ],


  /* ---------- 12. "Open when…" letters ---------- */
  // ✍️ Little letters for different moments. Rewrite them in your own words.
  openWhen: [
    { when: "you miss me",
      message: [
        "Close your eyes for a second and remember the last time I hugged you. I'm still holding on, even from here.",
        "You're the first thing on my mind every morning and the last thing every night. Now call me. I promise I'm already smiling.",
      ] },
    { when: "you can't sleep",
      message: [
        "Hey, sleepyhead. Breathe in slowly… and out. Imagine me next to you, playing with your hair and telling you about my boring day until your eyes get heavy.",
        "Tomorrow is a new day, and I'll be right there in it. Goodnight, my love.",
      ] },
    { when: "you've had a bad day",
      message: [
        "I'm sorry today was hard. You don't have to be strong right now. Come here, let me hold you for a while.",
        "Whatever happened, it doesn't change how amazing you are. Tomorrow your favourite food is on me, no arguments.",
      ] },
    { when: "you need a laugh",
      message: [
        "Remember the time we laughed so hard we couldn't breathe? You know the one. I still laugh about it at random moments.",
        "Also, a reminder: I once tried very hard to impress you, failed completely, and you stayed anyway. Now go smile. You look prettiest when you do.",
      ] },
    { when: "you doubt yourself",
      message: [
        "Listen to me: you are smart, brave, kind and so much stronger than you think. I've watched you handle things that would break most people.",
        "Whatever you're facing, you've got this. And on the days you don't, you've got me.",
      ] },
    { when: "you want to know how much I love you",
      message: [
        "More than yesterday and less than tomorrow. More than all the stars you can count.",
        "If you ever forget, open this again. The answer will always be the same: endlessly.",
      ] },
  ],


  /* ---------- 13. Mini games ("Play With Me") ---------- */
  // ✍️ Change any of the messages. {her} becomes her name, {me} becomes yours.
  // To hide a game, add  enabled: false  to it.
  games: {
    arrow: {
      goal: 10,                                             // hearts to hit
      message: "Right through the heart! Don’t worry, it was already yours. ❤",
    },
    memory: {
      symbols: ["❤️", "🌹", "💍", "🧸", "🍫", "💌"],      // 3 to 8 pairs
      message: "Every piece of you matches every piece of me. ❤",
    },
    catch: {
      goal: 20,                                             // hearts needed to win
      message: "You caught every bit of my love. Don’t worry, there’s plenty more where that came from.",
    },
    scratch: {
      revealSong: true,                                            // the secret is your song
      songIntro: "I made you a song",
      songMessage: "That’s your song, my Kaju. Made just for you, because you feel like home. 💗",
      // used only if revealSong is false (or there's no song):
      secret: "Your next date is on me: anywhere you choose. ❤",
      message: "Now you know my secret. Pick the place! 😉",
    },
    stars: {
      message: "Out of all the stars in the sky, you’re the one I’d wish on.",
    },
    balloons: {
      sentence: "Happy birthday {her}, you make every day of my life brighter",
      message: "Read that again, slowly. I mean every word. ❤",
    },
    meter: {
      message: "Error: love level too high to measure. ❤",
    },
    hunt: {
      count: 7,                                              // hidden hearts (3 to 8)
      message: "You found every heart I hid for you, just like you found your way into mine. ❤ {me}",
      video: {                                               // the reward for finding every heart (remove this block for none)
        src: "videos/celeb-wish.mp4",
        poster: "videos/celeb-wish.jpg",                     // shown blurred until she taps play, so it stays a surprise
        title: "And someone special has a birthday wish for you… 🎬",
      },
    },
  },


  /* ---------- 14. The final surprise (gift box) ---------- */
  // Reveal her real present, a date plan, a trip... anything.
  surprise: {
    teaser: "One more thing…",
    title: "Get Ready by 7 PM",
    message: "Your real present isn’t on this website. Dress up, birthday girl, because tonight I’m taking you somewhere special. ❤",
    photo: null,            // optional, e.g. "photos/surprise.jpg"
  },
};
