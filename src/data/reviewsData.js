// Realistic Indian casual English reviews
// STRICT RULES: NO hyphens (-), NO commas (,), NO periods (.)
// Includes positive reviews and 1 to 5 critical/bad reviews

export const REVIEWS_POOL = {
  // Common positive Indian casual reviews
  positive: [
    { name: "Pooja Sharma", text: "silver shine is genuinely top tier looks so royal and feels like real 925 sterling silver" },
    { name: "Rhea Nair", text: "rhodium finish is crazy clean sparkles 10x better than pictures" },
    { name: "Ananya Verma", text: "received in 3 days packaging was luxury velvet box sister loved it" },
    { name: "Aditya Patel", text: "proper solid silver feel not that cheap coated metal totally worth the price" },
    { name: "Sneha Rao", text: "looks unreal in person everyone at party was asking where i got it" },
    { name: "Meera Malhotra", text: "insane detailing on the silver setting proper premium weight" },
    { name: "Priyanka Iyer", text: "super happy with the purchase looks stunning for daily wear" },
    { name: "Tanvi Deshmukh", text: "next level craftsmanship polish is mirror finish" },
    { name: "Divya Joshi", text: "mast product hai worth every single rupee" },
    { name: "Ishaan Sen", text: "fast delivery and solid build quality gifted to my fiance" },
    { name: "Nandini Kulkarni", text: "anti tarnish coating is legit wearing it daily without any discoloration" },
    { name: "Kavya Mehta", text: "gifted to my mom she went emotional seeing the velvet box" },
    { name: "Shreya Yadav", text: "solid weight to it looks very classy and elegant" },
    { name: "Rohan Reddy", text: "clean edges and high polish feels very luxurious in hand" },
    { name: "Ritu Choudhary", text: "proper luxury brand aesthetic loving the timeless silver vibe" },
  ],

  // Specific positive reviews per category
  genreSpecific: {
    NECKLACES: [
      { name: "Natasha Roy", text: "pendant sparkle is so dazzling catches light from every angle" },
      { name: "Simran Bansal", text: "chain length is perfect and clasp is solid sterling silver" },
      { name: "Aarushi Pandey", text: "choker sits so gracefully on the neckline got tons of compliments" },
      { name: "Riddhima Saxena", text: "layered chain looks high fashion and feels lightweight" },
    ],
    BRACELETS: [
      { name: "Tara Singhania", text: "tennis bracelet clasp has double safety lock cz stones look like real diamonds" },
      { name: "Kritika Johar", text: "silver cuff fits perfectly on the wrist very chic minimal look" },
      { name: "Avani Kapoor", text: "cuban link is bold and shining premium weight on wrist" },
    ],
    EARRINGS: [
      { name: "Suhani Bhatnagar", text: "figure 8 double pearl design is so elegant and classy shines like real gold" },
      { name: "Pooja Singhania", text: "criss cross gold setting with the triangular iridescent pearl is unreal looks so expensive" },
      { name: "Diya Malik", text: "studs are hypoallergenic no irritation even after wearing 14 hours" },
      { name: "Anushka Mittal", text: "crystal drops have royal sway perfect for wedding functions" },
      { name: "Sanya Singhal", text: "hoops are lightweight and easy to wear all day" },
    ],
    RINGS: [
      { name: "Mansi Bhatt", text: "solitaire setting is flawless stone looks massive and brilliant" },
      { name: "Palak Khurana", text: "wave band is so comfortable smooth inner finish" },
    ],
    SCARFS: [
      { name: "Bhavna Gill", text: "pure silk touch is buttery smooth rich sheen and drape" },
      { name: "Sunita Bhatia", text: "monogram print is sophisticated pairs with formal and casual outfits" },
    ],
    COMBOS: [
      { name: "Ragini Agrawal", text: "gift combo packaging is breathtaking velvet box with certificate" },
      { name: "Radhika Chauhan", text: "best anniversary gift set both necklace and earrings match seamlessly" },
    ],
  },

  // Realistic bad / critical reviews (NO hyphens, commas, periods)
  critical: [
    { name: "Deepak Mehra", rating: 2, text: "courier executive took 4 days to deliver in pune" },
    { name: "Saurabh Tiwari", rating: 3, text: "gift bag handle had slight wrinkle inside shipping carton" },
    { name: "Mayank Mishra", rating: 3, text: "chain size is delicate needs gentle handling otherwise shine is top" },
    { name: "Chetan Bhagat", rating: 3, text: "outer brown cardboard had small corner press gift box inside was safe" },
    { name: "Anand Ahuja", rating: 2, text: "took nearly 5 days to reach hyderabad delivery speed could be faster" },
    { name: "Pankaj Tripathi", rating: 3, text: "wish there was a silver polishing cloth included in standard box" },
  ],
}
