/**
 * Knockout bracket capture width (px). Must match the fixed width of the
 * capture root in `BracketSimulator` / share PNG clone so html-to-image
 * does not clip. Inner tree (columns + connectors + final) must fit inside
 * horizontal padding of that box (e.g. p-5 → 40px per side).
 */
export const BRACKET_CAPTURE_WIDTH_PX = 1040;
