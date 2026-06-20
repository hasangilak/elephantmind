/**
 * The Major System — the game's core encoding content.
 *
 * The Elephantam design shipped 14 sample pegs; the product is built around the full
 * 100-image system ("x/100 mastery"). This is the complete 00–99 peg table.
 * Each word's consonant sounds spell its number per the Major System mapping
 * (0=s/z 1=t/d 2=n 3=m 4=r 5=l 6=j/sh/ch 7=k/g 8=f/v 9=p/b); vowels are free.
 * The 14 pegs the design defined keep the design's exact words, hints and sounds.
 */

export interface Peg {
  n: string;
  word: string;
  sound: string;
  hint: string;
}

/** Digit → consonant-sound reference (design: digitMap). */
export const DIGIT_MAP: [string, string, string][] = [
  ['0', 's · z', '“z” starts Zero'],
  ['1', 't · d', 'one downstroke'],
  ['2', 'n', 'two legs down'],
  ['3', 'm', 'three humps'],
  ['4', 'r', 'fou-R ends in R'],
  ['5', 'l', 'Roman L = 50'],
  ['6', 'j · sh · ch', 'flipped 6 ≈ J'],
  ['7', 'k · g', 'K is two 7s'],
  ['8', 'f · v', 'script f ≈ 8'],
  ['9', 'p · b', '9 mirrors P'],
];

/** Representative consonant letter per digit, for auto-derived sound labels. */
const SOUND_LETTER = ['s', 't', 'n', 'm', 'r', 'l', 'sh', 'k', 'f', 'p'];

function soundFor(n: string): string {
  return `${SOUND_LETTER[+n[0]]} + ${SOUND_LETTER[+n[1]]}`;
}

// [n, word, hint, sound?] — sound auto-derived unless overridden (design pegs).
const RAW: [string, string, string, string?][] = [
  ['00', 'Sauce', 'a pot of bubbling SAUCE'],
  ['01', 'Suit', 'a sharp pinstripe SUIT'],
  ['02', 'Sun', 'the blazing SUN'],
  ['03', 'Sumo', 'a stomping SUMO wrestler'],
  ['04', 'Zero', 'a giant red ZERO balloon', 'z + r'],
  ['05', 'Seal', 'a clapping SEAL'],
  ['06', 'Sash', 'a beauty-queen SASH'],
  ['07', 'Sock', 'a soggy SOCK on the line', 's + k'],
  ['08', 'Safe', 'a heavy steel SAFE'],
  ['09', 'Soap', 'a bar of SOAP, slippery', 's + p'],
  ['10', 'Toes', 'ten wiggling TOES'],
  ['11', 'Tot', 'a babbling TOT'],
  ['12', 'Tin', 'a dented TIN can', 't + n'],
  ['13', 'Dime', 'a shiny DIME spinning', 'd + m'],
  ['14', 'Tire', 'a flaming TIRE rolling'],
  ['15', 'Towel', 'a damp beach TOWEL'],
  ['16', 'Dish', 'a stacked DISH wobbling'],
  ['17', 'Duck', 'a quacking DUCK'],
  ['18', 'Dove', 'a white DOVE bursting up'],
  ['19', 'Tub', 'an overflowing bath TUB'],
  ['20', 'Nose', 'a runny red NOSE'],
  ['21', 'Net', 'a tangled fishing NET'],
  ['22', 'Nun', 'a stern NUN'],
  ['23', 'Name', 'a glowing NAME tag'],
  ['24', 'Nero', 'emperor NERO fiddling'],
  ['25', 'Nail', 'a bent NAIL in wood', 'n + l'],
  ['26', 'Notch', 'a deep NOTCH cut'],
  ['27', 'Neck', 'a stretched giraffe NECK'],
  ['28', 'Knife', 'a flashing KNIFE'],
  ['29', 'Knob', 'a brass door KNOB'],
  ['30', 'Mouse', 'a darting MOUSE'],
  ['31', 'Mat', 'a muddy door MAT', 'm + t'],
  ['32', 'Moon', 'a full MOON'],
  ['33', 'Mummy', 'a wrapped MUMMY', 'm + m'],
  ['34', 'Hammer', 'a swinging HAMMER'],
  ['35', 'Mule', 'a stubborn MULE'],
  ['36', 'Match', 'a struck MATCH'],
  ['37', 'Mug', 'a steaming MUG'],
  ['38', 'Movie', 'a flickering MOVIE'],
  ['39', 'Map', 'a crinkled treasure MAP'],
  ['40', 'Rose', 'a red ROSE'],
  ['41', 'Rat', 'a scurrying RAT'],
  ['42', 'Rhino', 'a charging RHINO', 'r + n'],
  ['43', 'Ram', 'a butting RAM'],
  ['44', 'Rower', 'a straining ROWER'],
  ['45', 'Rail', 'a steel RAIL'],
  ['46', 'Roach', 'a scuttling ROACH'],
  ['47', 'Rock', 'a tumbling ROCK'],
  ['48', 'Roof', 'a steep ROOF'],
  ['49', 'Rope', 'a coiled ROPE'],
  ['50', 'Lasso', 'a twirling LASSO', 'l + s'],
  ['51', 'Light', 'a blinding LIGHT'],
  ['52', 'Lion', 'a roaring LION'],
  ['53', 'Lime', 'a zesty LIME'],
  ['54', 'Lure', 'a glinting fishing LURE'],
  ['55', 'Lily', 'a floating LILY'],
  ['56', 'Leash', 'a taut dog LEASH'],
  ['57', 'Log', 'a rolling LOG'],
  ['58', 'Leaf', 'a falling LEAF'],
  ['59', 'Lab', 'a bubbling LAB'],
  ['60', 'Cheese', 'a wedge of CHEESE'],
  ['61', 'Jet', 'a screaming JET'],
  ['62', 'Chain', 'a heavy CHAIN'],
  ['63', 'Jam', 'a jar of JAM'],
  ['64', 'Cherry', 'a glossy CHERRY'],
  ['65', 'Jail', 'iron JAIL bars'],
  ['66', 'Judge', "a banging JUDGE's gavel"],
  ['67', 'Cheek', 'a pinched CHEEK'],
  ['68', 'Chef', 'a tossing CHEF'],
  ['69', 'Ship', 'a sailing SHIP'],
  ['70', 'Goose', 'a honking GOOSE'],
  ['71', 'Cat', 'a hissing CAT'],
  ['72', 'Can', 'a rattling CAN'],
  ['73', 'Comb', 'a wide COMB'],
  ['74', 'Car', 'a revving CAR', 'c + r'],
  ['75', 'Coal', 'a glowing COAL'],
  ['76', 'Cash', 'a wad of CASH'],
  ['77', 'Cake', 'a towering CAKE'],
  ['78', 'Cave', 'a dark CAVE'],
  ['79', 'Cap', 'a backwards CAP'],
  ['80', 'Face', 'a grinning FACE'],
  ['81', 'Foot', 'a stomping FOOT'],
  ['82', 'Phone', 'a buzzing PHONE'],
  ['83', 'Foam', 'bubbling FOAM'],
  ['84', 'Fire', 'a roaring FIRE'],
  ['85', 'File', 'a bulging FILE'],
  ['86', 'Fish', 'a flapping FISH', 'f + sh'],
  ['87', 'Fog', 'a creeping FOG'],
  ['88', 'Fife', 'a shrill FIFE'],
  ['89', 'Fob', 'a jingling key FOB'],
  ['90', 'Bus', 'a red double-decker BUS', 'b + s'],
  ['91', 'Bat', 'a swooping BAT'],
  ['92', 'Pin', 'a sharp PIN'],
  ['93', 'Bomb', 'a hissing BOMB'],
  ['94', 'Bear', 'a growling BEAR'],
  ['95', 'Bell', 'a clanging BELL'],
  ['96', 'Beach', 'a sunny BEACH'],
  ['97', 'Book', 'a thick BOOK'],
  ['98', 'Beef', 'a slab of BEEF'],
  ['99', 'Puppy', 'a wagging PUPPY', 'p + p'],
];

export const PEGS: Peg[] = RAW.map(([n, word, hint, sound]) => ({
  n,
  word,
  hint,
  sound: sound ?? soundFor(n),
}));

const _byN: Record<string, Peg> = {};
PEGS.forEach((p) => {
  _byN[p.n] = p;
});

/** Look up a peg by its 2-digit string, e.g. pegByN("07"). */
export function pegByN(n: string): Peg | undefined {
  return _byN[n];
}
