import { useSettings, type Language } from './settings'

const en = {
  tagline: 'Cross the fire, cash out in time',
  balance: 'Balance',
  fairness: 'Fairness',
  rules: 'Rules',
  sound: 'Sound',
  language: 'Language',
  close: 'Close',

  betAmount: 'Bet Amount',
  min: 'MIN',
  max: 'MAX',
  difficulty: 'Difficulty',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  hardcore: 'Hardcore',
  maxWin: 'Max Win',
  play: 'Play',
  go: 'GO',
  cashOut: 'Cash Out',
  topUp: 'Top up demo balance',
  betInvalid: 'Enter an amount like 3 or 2.50',
  betBelowMin: 'Minimum Bet is {amount}',
  betAboveMax: 'Maximum Bet is {amount}',
  betAboveBalance: 'Not enough Balance',
  hitAnnouncement: 'Hit on Lane {lane}. Bet lost.',
  stepAnnouncement: 'Lane {lane} crossed. Multiplier {multiplier}.',
  cashOutAnnouncement: 'Cashed out {amount}.',
  finishAnnouncement: 'Finish! Won {amount}.',
  maxWinAnnouncement: 'Max Win! Cashed out {amount}.',

  youWin: 'You win!',
  finish: 'Finish!',
  maxWinReached: 'Max Win!',
  chicken: 'Chicken',
  roastedChicken: 'Roasted chicken',
  goldenCase: 'Golden case',

  recentGames: 'Recent Games',
  recentEmpty: 'Your finished Rounds will show up here.',
  payout: 'Payout',
  multiplier: 'Multiplier',
  bet: 'Bet',
  verify: 'Verify',
  roundFairness: 'Round fairness',

  provablyFair: 'Provably fair',
  fairIntro:
    "Each Round's Hit Lane is HMAC-SHA256(Server Seed, Client Seed:nonce). The Server Seed's hash is shown before you play and the seed itself after, so you can check nothing changed.",
  nextRound: 'Next Round',
  currentRound: 'Current Round',
  lastRound: 'Last Round',
  serverSeedHashSha: 'Server Seed hash (SHA-256)',
  serverSeedHash: 'Server Seed hash',
  serverSeed: 'Server Seed',
  revealedLater: 'Revealed when the Round ends',
  yourClientSeed: 'Your Client Seed',
  clientSeed: 'Client Seed',
  nonce: 'Nonce',
  save: 'Save',
  changeAfterRound: 'You can change it after this Round.',
  recomputed: 'Recomputed: {result}',
  played: 'Played: {result}',
  noHit: 'no Hit on any Lane',
  hitOnLane: 'Hit on Lane {lane}',
  cashedOutOnLane: 'cashed out on Lane {lane}',
  maxWinOnLane: 'Max Win on Lane {lane}',
  reachedFinish: 'reached the Finish',
  verified: '✓ Verified',
  mismatch: '✗ Does not match',
  copy: 'Copy',
  copied: 'Copied',
  copyLabel: 'Copy {label}',

  rulesHowTo: 'How to play',
  rulesStep1:
    'Pick a Bet and a Difficulty, then press Play: the Bet is taken and the chicken makes its first Step.',
  rulesStep2:
    'Each Step the chicken throws a smoke grenade at the next Lane. If the Smoke puts the fire out, it crosses and the Multiplier grows; if not, it is caught by the fire (a Hit) and the Bet is lost.',
  rulesStep3:
    'Press Cash Out at any time after a safe Step to take Bet × Multiplier. Crossing the last Lane cashes out automatically.',
  rulesOdds: 'Odds',
  rulesRtp:
    'RTP is 98%: whichever Lane you cash out on, the average return is 98% of the Bet. Harder Difficulties have fewer Lanes and higher Multipliers, with a bigger chance of a Hit on each Step.',
  rulesMaxWin:
    'A single Round pays at most {amount}. When Bet × Multiplier reaches it, the Round ends with an automatic Cash Out, so on large Bets the effective RTP is slightly below 98%.',
  rulesTables: 'Multipliers by Lane',
  lanes: '{count} Lanes',
  rulesDemo: 'Demo note',
  rulesDemoText:
    "This demo has no backend: the Server Seed is generated and kept in your browser, so someone with DevTools could read a Round's outcome early. The fairness proof shows how the real mechanism works; a real deployment keeps the seed on a server. All funds are mock coins.",
}

export type MessageKey = keyof typeof en

// Typed against the English keys: a missing or misspelled Russian key is a compile error.
const ru: Record<MessageKey, string> = {
  tagline: 'Пройди сквозь огонь и забери вовремя',
  balance: 'Баланс',
  fairness: 'Честность',
  rules: 'Правила',
  sound: 'Звук',
  language: 'Язык',
  close: 'Закрыть',

  betAmount: 'Ставка',
  min: 'МИН',
  max: 'МАКС',
  difficulty: 'Сложность',
  easy: 'Лёгкая',
  medium: 'Средняя',
  hard: 'Сложная',
  hardcore: 'Хардкор',
  maxWin: 'Макс. выигрыш',
  play: 'Играть',
  go: 'Вперёд',
  cashOut: 'Забрать',
  topUp: 'Пополнить демо-баланс',
  betInvalid: 'Введите сумму, например 3 или 2.50',
  betBelowMin: 'Минимальная ставка {amount}',
  betAboveMax: 'Максимальная ставка {amount}',
  betAboveBalance: 'Недостаточно средств',
  hitAnnouncement: 'Курица сгорела на полосе {lane}. Ставка проиграна.',
  stepAnnouncement: 'Полоса {lane} пройдена. Множитель {multiplier}.',
  cashOutAnnouncement: 'Выигрыш {amount} забран.',
  finishAnnouncement: 'Финиш! Выигрыш {amount}.',
  maxWinAnnouncement: 'Максимальный выигрыш! Забрано {amount}.',

  youWin: 'Выигрыш!',
  finish: 'Финиш!',
  maxWinReached: 'Максимальный выигрыш!',
  chicken: 'Курица',
  roastedChicken: 'Жареная курица',
  goldenCase: 'Золотой кейс',

  recentGames: 'Последние игры',
  recentEmpty: 'Здесь появятся ваши сыгранные раунды.',
  payout: 'Выплата',
  multiplier: 'Множитель',
  bet: 'Ставка',
  verify: 'Проверить',
  roundFairness: 'Проверка раунда',

  provablyFair: 'Доказуемая честность',
  fairIntro:
    'Полоса, на которой курица сгорит, — это HMAC-SHA256(Server Seed, Client Seed:nonce). Хэш Server Seed показан до игры, а сам seed — после, поэтому можно проверить, что ничего не менялось.',
  nextRound: 'Следующий раунд',
  currentRound: 'Текущий раунд',
  lastRound: 'Прошлый раунд',
  serverSeedHashSha: 'Хэш Server Seed (SHA-256)',
  serverSeedHash: 'Хэш Server Seed',
  serverSeed: 'Server Seed',
  revealedLater: 'Будет раскрыт после раунда',
  yourClientSeed: 'Ваш Client Seed',
  clientSeed: 'Client Seed',
  nonce: 'Nonce',
  save: 'Сохранить',
  changeAfterRound: 'Его можно поменять после этого раунда.',
  recomputed: 'Пересчёт: {result}',
  played: 'В игре: {result}',
  noHit: 'курица проходит все полосы',
  hitOnLane: 'сгорает на полосе {lane}',
  cashedOutOnLane: 'забрали на полосе {lane}',
  maxWinOnLane: 'макс. выигрыш на полосе {lane}',
  reachedFinish: 'дошла до финиша',
  verified: '✓ Проверено',
  mismatch: '✗ Не совпадает',
  copy: 'Копировать',
  copied: 'Скопировано',
  copyLabel: 'Копировать: {label}',

  rulesHowTo: 'Как играть',
  rulesStep1:
    'Выберите ставку и сложность и нажмите «Играть»: ставка списывается, курица делает первый шаг.',
  rulesStep2:
    'На каждом шаге курица бросает дымовую гранату на следующую полосу. Если дым тушит огонь, она проходит и множитель растёт; если нет — курица сгорает, ставка проиграна.',
  rulesStep3:
    'После любого успешного шага можно нажать «Забрать» и получить ставку × множитель. Пройдя последнюю полосу, вы забираете выигрыш автоматически.',
  rulesOdds: 'Шансы',
  rulesRtp:
    'RTP 98%: на какой бы полосе вы ни забрали, в среднем возвращается 98% ставки. На сложных уровнях полос меньше и множители выше, но и шанс сгореть на каждом шаге больше.',
  rulesMaxWin:
    'Один раунд платит не больше {amount}. Когда ставка × множитель достигает этой суммы, раунд заканчивается автоматическим выигрышем, поэтому на крупных ставках реальный RTP чуть ниже 98%.',
  rulesTables: 'Множители по полосам',
  lanes: 'Полос: {count}',
  rulesDemo: 'О демо',
  rulesDemoText:
    'У этого демо нет сервера: Server Seed создаётся и хранится в вашем браузере, поэтому через DevTools можно заранее узнать исход. Проверка честности показывает, как работает настоящий механизм; в реальной игре seed хранится на сервере. Все деньги игровые.',
}

const DICTIONARIES: Record<Language, Record<MessageKey, string>> = { en, ru }

export function translate(
  language: Language,
  key: MessageKey,
  vars: Record<string, string | number> = {},
) {
  return DICTIONARIES[language][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(vars[name] ?? `{${name}}`),
  )
}

/** `t('betBelowMin', { amount })` in the player's language. */
export function useT() {
  const language = useSettings((s) => s.language)
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(language, key, vars)
}
