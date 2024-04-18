import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { bytesToHex } from '@noble/hashes/utils';
import { Relay } from 'nostr-tools/relay';


export let vibeCountDict = {
  "clickbait": [],
  "positive": []
};

export function createNostrUser() {
    let sk = generateSecretKey() // `sk` is a Uint8Array
    let skHex = bytesToHex(sk) 
    localStorage.setItem('nostrUserSecret', skHex);
}

export async function sendVibeEvent(vibeSubject, vibeSubjectType, vibeTag) {
    let sk = localStorage.getItem('nostrUserSecret');
    const relay = await Relay.connect('wss://relay.damus.io');
    let eventTemplate = {
        kind: 5183,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["subject", vibeSubject, vibeSubjectType],
            ["tag", vibeTag]
        ],
        content: 'vibe tag',
    }

    // this assigns the pubkey, calculates the event id and signs the event in a single step
    const signedEvent = finalizeEvent(eventTemplate, sk)
    await relay.publish(signedEvent)
    setVibeTagCount(vibeSubject, vibeTag)
    relay.close()

}

export async function getVibeTagCount(vibeTag) {
  return vibeCountDict[vibeTag];
}

export async function setVibeTagCount(vibeSubject, vibeTag) {
  const relay = await Relay.connect('wss://relay.damus.io');

  relay.subscribe([
    {
      kinds: [5183]
    },
    ], {
      onevent(event) {
        if (event.tags[0][1] === vibeSubject && event.tags[1][1] === vibeTag && vibeCountDict[vibeTag].indexOf(event.id) === -1) {
          vibeCountDict[vibeTag].push(event.id);
        }
      }
    });
}