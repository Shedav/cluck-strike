# Cluck Strike

A browser mini-game of chance: a chicken crosses burning lanes one step at a time, each step raises the payout multiplier, and the player decides when to cash out before getting caught by fire.

## Language

### Round

**Round**:
One play from placing a Bet until it ends in a Cash Out or a Hit.
_Avoid_: Game, session, run

**Bet**:
The amount the player stakes on one Round, taken from the Balance when the Round starts.
_Avoid_: Stake, wager

**Balance**:
The player's mock funds available for Bets.
_Avoid_: Wallet, money, coins

**Max Win**:
The largest payout a single Round can pay, whatever the Multiplier.
_Avoid_: Cap, limit, max payout

**Difficulty**:
The risk level chosen before a Round; it sets how many Lanes the road has and how likely each Step is to survive.
_Avoid_: Mode, level, risk

**Recent Games**:
The list of the player's own finished Rounds with their Bet, Multiplier and payout.
_Avoid_: History, log, bets feed

### Crossing

**Lane**:
One strip of road the character must cross; each Lane has its own Multiplier.
_Avoid_: Line, row, strip, level

**Step**:
The player's action of moving the character onto the next Lane.
_Avoid_: Move, jump, go

**Multiplier**:
The payout factor for reaching a given Lane; the Bet times the current Multiplier is what a Cash Out pays.
_Avoid_: Coefficient, odds, x

**Smoke**:
The visual sign that a Lane was crossed safely: a smoke cloud puts out the fire on that Lane.
_Avoid_: Barrier, gate, shield

### Outcomes

**Cash Out**:
The player ending the Round voluntarily and receiving Bet × current Multiplier.
_Avoid_: Collect, take, withdraw

**Hit**:
The Round ending because the character was caught by fire on a Lane; the Bet is lost.
_Avoid_: Crash, burn, lose, death, bust

**Finish**:
Safely crossing the last Lane, which ends the Round with an automatic Cash Out.
_Avoid_: Win, goal, end

### Fairness

**Hit Lane**:
The Lane on which the character will be hit, fixed before the Round starts.
_Avoid_: Crash point, death lane, bomb

**Server Seed**:
The secret random value that, together with the Client Seed, decides the Hit Lane; its hash is shown before the Round and the value itself after.
_Avoid_: Secret, key

**Client Seed**:
The player's own value mixed into the outcome so the game cannot pick the result alone.
_Avoid_: Player seed, salt
