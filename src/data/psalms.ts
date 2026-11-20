export type TranslationKey = 'WEB' | 'KJV';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Challenge';

export type GameModeId = 'word_vault' | 'verse_builder' | 'first_letter' | 'fade_recite';

export interface PsalmVerse {
  verse: number;
  WEB: string;
  KJV: string;
}

export interface PsalmData {
  number: number;
  title: string;
  theme: string;
  difficulty: DifficultyLevel;
  image: 'pasture' | 'stars' | 'manuscript';
  summary: string;
  verses: PsalmVerse[];
}

export const GAME_MODES: {
  id: GameModeId;
  name: string;
  shortDesc: string;
  howToPlay: string;
}[] = [
  {
    id: 'word_vault',
    name: 'Word Vault',
    shortDesc: 'Fill missing key words from the bank.',
    howToPlay: 'Select a missing word from the word bank to fill each numbered blank in order.',
  },
  {
    id: 'verse_builder',
    name: 'Verse Builder',
    shortDesc: 'Arrange scrambled phrase tiles in order.',
    howToPlay: 'Tap word tiles from the tray to reconstruct the full verse in the exact sequence.',
  },
  {
    id: 'first_letter',
    name: 'First-Letter Recall',
    shortDesc: 'Type the opening letter of each word.',
    howToPlay: 'Use your keyboard or the letter bar to type the first letter of each highlighted word.',
  },
  {
    id: 'fade_recite',
    name: 'Fade & Recite',
    shortDesc: 'Gradually hide words until full recall.',
    howToPlay: 'Step through fading stages, tap hidden words to peek if needed, then verify your recall.',
  },
];

export const PSALMS_DATA: PsalmData[] = [
  {
    number: 23,
    title: 'The Lord Is My Shepherd',
    theme: 'Comfort & Guidance',
    difficulty: 'Beginner',
    image: 'pasture',
    summary: 'Six quiet verses of trust in God’s care, provision, and presence through every valley.',
    verses: [
      {
        verse: 1,
        WEB: 'The Lord is my shepherd; I shall lack nothing.',
        KJV: 'The Lord is my shepherd; I shall not want.',
      },
      {
        verse: 2,
        WEB: 'He makes me lie down in green pastures. He leads me beside still waters.',
        KJV: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
      },
      {
        verse: 3,
        WEB: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.',
        KJV: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.',
      },
      {
        verse: 4,
        WEB: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.',
        KJV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
      },
      {
        verse: 5,
        WEB: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.',
        KJV: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
      },
      {
        verse: 6,
        WEB: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in the Lord’s house forever.',
        KJV: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.',
      },
    ],
  },
  {
    number: 1,
    title: 'The Way of the Righteous',
    theme: 'Wisdom & Rootedness',
    difficulty: 'Beginner',
    image: 'pasture',
    summary: 'The opening song of the Psalter contrasting a life rooted by streams of water with drifting chaff.',
    verses: [
      {
        verse: 1,
        WEB: 'Blessed is the man who doesn’t walk in the counsel of the wicked, nor stand on the path of sinners, nor sit in the seat of scoffers;',
        KJV: 'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.',
      },
      {
        verse: 2,
        WEB: 'but his delight is in the Lord’s law. On his law he meditates day and night.',
        KJV: 'But his delight is in the law of the Lord; and in his law doth he meditate day and night.',
      },
      {
        verse: 3,
        WEB: 'He will be like a tree planted by the streams of water, that produces its fruit in its season, whose leaf also does not wither. Whatever he does shall prosper.',
        KJV: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.',
      },
      {
        verse: 4,
        WEB: 'The wicked are not so, but are like the chaff which the wind drives away.',
        KJV: 'The ungodly are not so: but are like the chaff which the wind driveth away.',
      },
      {
        verse: 5,
        WEB: 'Therefore the wicked shall not stand in the judgment, nor sinners in the congregation of the righteous.',
        KJV: 'Therefore the ungodly shall not stand in the judgment, nor sinners in the congregation of the righteous.',
      },
      {
        verse: 6,
        WEB: 'For the Lord knows the way of the righteous, but the way of the wicked shall perish.',
        KJV: 'For the Lord knoweth the way of the righteous: but the way of the ungodly shall perish.',
      },
    ],
  },
  {
    number: 121,
    title: 'My Help Comes from the Lord',
    theme: 'Travel & Protection',
    difficulty: 'Beginner',
    image: 'stars',
    summary: 'A Song of Ascents lifting weary eyes toward the Maker of heaven and earth.',
    verses: [
      {
        verse: 1,
        WEB: 'I will lift up my eyes to the hills. Where does my help come from?',
        KJV: 'I will lift up mine eyes unto the hills, from whence cometh my help.',
      },
      {
        verse: 2,
        WEB: 'My help comes from the Lord, who made heaven and earth.',
        KJV: 'My help cometh from the Lord, which made heaven and earth.',
      },
      {
        verse: 3,
        WEB: 'He will not allow your foot to be moved. He who keeps you will not slumber.',
        KJV: 'He will not suffer thy foot to be moved: he that keepeth thee will not slumber.',
      },
      {
        verse: 4,
        WEB: 'Behold, he who keeps Israel will neither slumber nor sleep.',
        KJV: 'Behold, he that keepeth Israel shall neither slumber nor sleep.',
      },
      {
        verse: 5,
        WEB: 'The Lord is your keeper. The Lord is your shade on your right hand.',
        KJV: 'The Lord is thy keeper: the Lord is thy shade upon thy right hand.',
      },
      {
        verse: 6,
        WEB: 'The sun will not harm you by day, nor the moon by night.',
        KJV: 'The sun shall not smite thee by day, nor the moon by night.',
      },
      {
        verse: 7,
        WEB: 'The Lord will keep you from all evil. He will keep your soul.',
        KJV: 'The Lord shall preserve thee from all evil: he shall preserve thy soul.',
      },
      {
        verse: 8,
        WEB: 'The Lord will keep your going out and your coming in, from this time forward, and forevermore.',
        KJV: 'The Lord shall preserve thy going out and thy coming in from this time forth, and even for evermore.',
      },
    ],
  },
  {
    number: 100,
    title: 'A Psalm of Thanksgiving',
    theme: 'Gratitude & Joy',
    difficulty: 'Beginner',
    image: 'manuscript',
    summary: 'Five joyful verses inviting every nation to enter His gates with thanksgiving.',
    verses: [
      {
        verse: 1,
        WEB: 'Shout for joy to the Lord, all you lands!',
        KJV: 'Make a joyful noise unto the Lord, all ye lands.',
      },
      {
        verse: 2,
        WEB: 'Serve the Lord with gladness. Come before his presence with singing.',
        KJV: 'Serve the Lord with gladness: come before his presence with singing.',
      },
      {
        verse: 3,
        WEB: 'Know that the Lord, he is God. It is he who has made us, and we are his. We are his people, and the sheep of his pasture.',
        KJV: 'Know ye that the Lord he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture.',
      },
      {
        verse: 4,
        WEB: 'Enter into his gates with thanksgiving, and into his courts with praise. Give thanks to him, and bless his name.',
        KJV: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.',
      },
      {
        verse: 5,
        WEB: 'For the Lord is good. His loving kindness endures forever, his faithfulness to all generations.',
        KJV: 'For the Lord is good; his mercy is everlasting; and his truth endureth to all generations.',
      },
    ],
  },
  {
    number: 150,
    title: 'Let Everything Praise the Lord',
    theme: 'Praise & Music',
    difficulty: 'Beginner',
    image: 'manuscript',
    summary: 'The resounding finale of the Book of Psalms calling every breathing creature to praise.',
    verses: [
      {
        verse: 1,
        WEB: 'Praise the Lord! Praise God in his sanctuary! Praise him in his heavens for his acts of power!',
        KJV: 'Praise ye the Lord. Praise God in his sanctuary: praise him in the firmament of his power.',
      },
      {
        verse: 2,
        WEB: 'Praise him for his mighty acts! Praise him according to his excellent greatness!',
        KJV: 'Praise him for his mighty acts: praise him according to his excellent greatness.',
      },
      {
        verse: 3,
        WEB: 'Praise him with the sounding of the trumpet! Praise him with harp and lyre!',
        KJV: 'Praise him with the sound of the trumpet: praise him with the psaltery and harp.',
      },
      {
        verse: 4,
        WEB: 'Praise him with tambourine and dancing! Praise him with stringed instruments and flute!',
        KJV: 'Praise him with the timbrel and dance: praise him with stringed instruments and organs.',
      },
      {
        verse: 5,
        WEB: 'Praise him with loud cymbals! Praise him with resounding cymbals!',
        KJV: 'Praise him upon the loud cymbals: praise him upon the high sounding cymbals.',
      },
      {
        verse: 6,
        WEB: 'Let everything that has breath praise the Lord! Praise the Lord!',
        KJV: 'Let every thing that hath breath praise the Lord. Praise ye the Lord.',
      },
    ],
  },
  {
    number: 46,
    title: 'God Is Our Refuge and Strength',
    theme: 'Courage & Stillness',
    difficulty: 'Intermediate',
    image: 'stars',
    summary: 'An anchor of stillness in turbulent times: "Be still, and know that I am God."',
    verses: [
      {
        verse: 1,
        WEB: 'God is our refuge and strength, a very present help in trouble.',
        KJV: 'God is our refuge and strength, a very present help in trouble.',
      },
      {
        verse: 2,
        WEB: 'Therefore we won’t be afraid, though the earth changes, though the mountains are shaken into the heart of the seas;',
        KJV: 'Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea;',
      },
      {
        verse: 3,
        WEB: 'though its waters roar and are troubled, though the mountains tremble with their swelling.',
        KJV: 'Though the waters thereof roar and be troubled, though the mountains shake with the swelling thereof.',
      },
      {
        verse: 4,
        WEB: 'There is a river, the streams of which make the city of God glad, the holy place of the tents of the Most High.',
        KJV: 'There is a river, the streams whereof shall make glad the city of God, the holy place of the tabernacles of the most High.',
      },
      {
        verse: 5,
        WEB: 'God is within her. She shall not be moved. God will help her at dawn.',
        KJV: 'God is in the midst of her; she shall not be moved: God shall help her, and that right early.',
      },
      {
        verse: 10,
        WEB: 'Be still, and know that I am God. I will be exalted among the nations. I will be exalted in the earth.',
        KJV: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
      },
      {
        verse: 11,
        WEB: 'The Lord of Armies is with us. The God of Jacob is our refuge.',
        KJV: 'The Lord of hosts is with us; the God of Jacob is our refuge.',
      },
    ],
  },
  {
    number: 91,
    title: 'Dwelling in the Shelter',
    theme: 'Shelter & Faithfulness',
    difficulty: 'Intermediate',
    image: 'stars',
    summary: 'Promises of protection beneath the shadow of the Almighty.',
    verses: [
      {
        verse: 1,
        WEB: 'He who dwells in the secret place of the Most High will rest in the shadow of the Almighty.',
        KJV: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.',
      },
      {
        verse: 2,
        WEB: 'I will say of the Lord, “He is my refuge and my fortress; my God, in whom I trust.”',
        KJV: 'I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust.',
      },
      {
        verse: 4,
        WEB: 'He will cover you with his feathers. Under his wings you will take refuge. His faithfulness is your shield and rampart.',
        KJV: 'He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.',
      },
      {
        verse: 5,
        WEB: 'You shall not be afraid of the terror by night, nor of the arrow that flies by day;',
        KJV: 'Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day;',
      },
      {
        verse: 11,
        WEB: 'For he will put his angels in charge of you, to guard you in all your ways.',
        KJV: 'For he shall give his angels charge over thee, to keep thee in all thy ways.',
      },
      {
        verse: 14,
        WEB: '“Because he has set his love on me, therefore I will deliver him. I will set him on high, because he has known my name.”',
        KJV: 'Because he hath set his love upon me, therefore will I deliver him: I will set him on high, because he hath known my name.',
      },
    ],
  },
  {
    number: 139,
    title: 'Searched and Known',
    theme: 'Presence & Wonder',
    difficulty: 'Intermediate',
    image: 'stars',
    summary: 'A meditation on being completely known, loved, and fearfully and wonderfully made.',
    verses: [
      {
        verse: 1,
        WEB: 'Lord, you have searched me, and you know me.',
        KJV: 'O Lord, thou hast searched me, and known me.',
      },
      {
        verse: 2,
        WEB: 'You know my sitting down and my rising up. You perceive my thoughts from afar.',
        KJV: 'Thou knowest my downsitting and mine uprising, thou understandest my thought afar off.',
      },
      {
        verse: 7,
        WEB: 'Where could I go from your Spirit? Or where could I flee from your presence?',
        KJV: 'Whither shall I go from thy spirit? or whither shall I flee from thy presence?',
      },
      {
        verse: 9,
        WEB: 'If I take the wings of the dawn, and settle in the uttermost parts of the sea,',
        KJV: 'If I take the wings of the morning, and dwell in the uttermost parts of the sea;',
      },
      {
        verse: 10,
        WEB: 'even there your hand will lead me, and your right hand will hold me.',
        KJV: 'Even there shall thy hand lead me, and thy right hand shall hold me.',
      },
      {
        verse: 14,
        WEB: 'I will give thanks to you, for I am fearfully and wonderfully made. Your works are wonderful. My soul knows that very well.',
        KJV: 'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.',
      },
      {
        verse: 23,
        WEB: 'Search me, God, and know my heart. Try me, and know my thoughts.',
        KJV: 'Search me, O God, and know my heart: try me, and know my thoughts:',
      },
      {
        verse: 24,
        WEB: 'See if there is any wicked way in me, and lead me in the everlasting way.',
        KJV: 'And see if there be any wicked way in me, and lead me in the way everlasting.',
      },
    ],
  },
  {
    number: 19,
    title: 'The Heavens Declare',
    theme: 'Creation & Scripture',
    difficulty: 'Challenge',
    image: 'stars',
    summary: 'From the silent speech of the starry heavens to the sweetness of God’s word.',
    verses: [
      {
        verse: 1,
        WEB: 'The heavens declare the glory of God. The expanse shows his handiwork.',
        KJV: 'The heavens declare the glory of God; and the firmament sheweth his handywork.',
      },
      {
        verse: 2,
        WEB: 'Day after day they pour out speech, and night after night they display knowledge.',
        KJV: 'Day unto day uttereth speech, and night unto night sheweth knowledge.',
      },
      {
        verse: 7,
        WEB: 'The Lord’s law is perfect, restoring the soul. The Lord’s covenant is sure, making wise the simple.',
        KJV: 'The law of the Lord is perfect, converting the soul: the testimony of the Lord is sure, making wise the simple.',
      },
      {
        verse: 8,
        WEB: 'The Lord’s precepts are right, rejoicing the heart. The Lord’s commandment is pure, enlightening the eyes.',
        KJV: 'The statutes of the Lord are right, rejoicing the heart: the commandment of the Lord is pure, enlightening the eyes.',
      },
      {
        verse: 10,
        WEB: 'More to be desired are they than gold, yes, than much fine gold, sweeter also than honey and the extract of the honeycomb.',
        KJV: 'More to be desired are they than gold, yea, than much fine gold: sweeter also than honey and the honeycomb.',
      },
      {
        verse: 14,
        WEB: 'Let the words of my mouth and the meditation of my heart be acceptable in your sight, Lord, my rock, and my redeemer.',
        KJV: 'Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O Lord, my strength, and my redeemer.',
      },
    ],
  },
  {
    number: 51,
    title: 'Create in Me a Clean Heart',
    theme: 'Renewal & Mercy',
    difficulty: 'Challenge',
    image: 'manuscript',
    summary: 'David’s prayer for mercy, cleansing, and a steadfast spirit renewed within.',
    verses: [
      {
        verse: 1,
        WEB: 'Have mercy on me, God, according to your loving kindness. According to the multitude of your tender mercies, blot out my transgressions.',
        KJV: 'Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions.',
      },
      {
        verse: 2,
        WEB: 'Wash me thoroughly from my iniquity, and cleanse me from my sin.',
        KJV: 'Wash me throughly from mine iniquity, and cleanse me from my sin.',
      },
      {
        verse: 7,
        WEB: 'Purify me with hyssop, and I will be clean. Wash me, and I will be whiter than snow.',
        KJV: 'Purge me with hyssop, and I shall be clean: wash me, and I shall be whiter than snow.',
      },
      {
        verse: 10,
        WEB: 'Create in me a clean heart, O God. Renew a right spirit within me.',
        KJV: 'Create in me a clean heart, O God; and renew a right spirit within me.',
      },
      {
        verse: 11,
        WEB: 'Don’t throw me from your presence, and don’t take your Holy Spirit from me.',
        KJV: 'Cast me not away from thy presence; and take not thy holy spirit from me.',
      },
      {
        verse: 12,
        WEB: 'Restore to me the joy of your salvation. Uphold me with a willing spirit.',
        KJV: 'Restore unto me the joy of thy salvation; and uphold me with thy free spirit.',
      },
      {
        verse: 17,
        WEB: 'The sacrifices of God are a broken spirit. O God, you will not despise a broken and contrite heart.',
        KJV: 'The sacrifices of God are a broken spirit: a broken and a contrite heart, O God, thou wilt not despise.',
      },
    ],
  },
];

export const PSALM_IMAGE_PATHS: Record<PsalmData['image'], string> = {
  manuscript: '/src/assets/images/hero_psalms_manuscript_1795015515980.jpg',
  pasture: '/src/assets/images/psalm_shepherd_pasture_1795015515711.jpg',
  stars: '/src/assets/images/psalm_night_stars_1795015517481.jpg',
};

export interface WordToken {
  index: number;
  raw: string;       // e.g. "shepherd;"
  clean: string;     // e.g. "shepherd"
  leadingPunct: string;
  trailingPunct: string;
  firstLetter: string;
}

export function tokenizeVerse(text: string): WordToken[] {
  const parts = text.trim().split(/\s+/);
  return parts.map((raw, index) => {
    const match = raw.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
    const leadingPunct = match?.[1] ?? '';
    const clean = match?.[2] ?? raw;
    const trailingPunct = match?.[3] ?? '';
    const firstLetterMatch = clean.match(/[A-Za-z0-9]/);
    const firstLetter = (firstLetterMatch?.[0] ?? clean[0] ?? '').toLowerCase();

    return {
      index,
      raw,
      clean,
      leadingPunct,
      trailingPunct,
      firstLetter,
    };
  });
}
