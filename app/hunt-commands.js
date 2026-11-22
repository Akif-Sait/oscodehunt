export const HUNT_COMMANDS = {
  round1: 'move to round1',
  round2: 'move to round2',
  round3: 'move to round3',
  capture: 'round1jumanji',
  release: 'round1jumanji:reverse',
  captureRound2: 'round2jumanji',
  releaseRound2: 'round2jumanji:reverse',
  captureRound3: 'round3jumanji',
  releaseRound3: 'round3jumanji:reverse',
};

export function dispatchHuntCommand(command) {
  if (!Object.values(HUNT_COMMANDS).includes(command)) return false;
  window.dispatchEvent(new Event(command));
  return true;
}
