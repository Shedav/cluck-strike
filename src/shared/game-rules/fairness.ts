import { hitLaneFor, MULTIPLIERS, RTP, type Difficulty } from './odds'

const encoder = new TextEncoder()

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('')

export function randomSeed(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)).buffer)
}

export async function sha256(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)))
}

export async function hmacSha256(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message)))
}

/** The Round's uniform number in [0, 1): the first 52 bits of the HMAC, which a double holds exactly. */
export async function roundNumber(serverSeed: string, clientSeed: string, nonce: number) {
  const hmac = await hmacSha256(serverSeed, `${clientSeed}:${nonce}`)
  return parseInt(hmac.slice(0, 13), 16) / 2 ** 52
}

/** Recomputes a Round's Hit Lane from its revealed seeds; null means the Round could reach the Finish. */
export async function verifyRound(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  difficulty: Difficulty,
): Promise<number | null> {
  return hitLaneFor(difficulty, await roundNumber(serverSeed, clientSeed, nonce))
}

/**
 * The same check as `verifyRound`, as JavaScript that runs on its own in any browser console, so
 * a player can recompute a Round without trusting this page's code.
 */
export function verifierSnippet(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  difficulty: Difficulty,
): string {
  return `// Cluck Strike: recompute a Round's Hit Lane. Paste into any browser console (F12).
const serverSeed = ${JSON.stringify(serverSeed)}
const clientSeed = ${JSON.stringify(clientSeed)}
const nonce = ${nonce}
// ${difficulty} Lane Multipliers; surviving up to a Lane has the chance ${RTP} / its Multiplier.
const multipliers = [${MULTIPLIERS[difficulty].join(', ')}]

const enc = new TextEncoder()
const key = await crypto.subtle.importKey('raw', enc.encode(serverSeed), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(\`\${clientSeed}:\${nonce}\`)))
const hex = Array.from(hmac, (b) => b.toString(16).padStart(2, '0')).join('')
// A uniform number in [0, 1) from the first 52 bits of the HMAC.
const u = parseInt(hex.slice(0, 13), 16) / 2 ** 52
const lane = multipliers.findIndex((m) => u >= ${RTP} / m) + 1
console.log(lane ? \`Hit on Lane \${lane}\` : 'No Hit: the chicken reaches the Finish')`
}
