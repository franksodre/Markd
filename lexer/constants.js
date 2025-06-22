export const a = "a".charCodeAt(0);  
export const z = "z".charCodeAt(0);

export const A = "A".charCodeAt(0);
export const Z = "Z".charCodeAt(0);

export const _under = "_".charCodeAt(0);

export function isLetter(char) {
  const ch = char.charCodeAt(0);
  return a <= ch && z >= ch || A <= ch && Z >= ch || ch === _under || ch === ",".charCodeAt(0);
}

// return ch >= a && z >= ch || A <= ch && Z >= ch || ch === _under;
//
export function isUpperCaseLetter (char) {
 if (A <= char.charCodeAt(0) && Z >= char.charCodeAt(0) || char.charCodeAt(0) === _under) {
   return true;
 }
  return false;
}


