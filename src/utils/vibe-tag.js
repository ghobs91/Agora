import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { bytesToHex } from '@noble/hashes/utils';
import { Relay } from 'nostr-tools/relay';

export function createNostrUser() {
    let sk = generateSecretKey() // `sk` is a Uint8Array
    let skHex = bytesToHex(sk) 
    localStorage.setItem('nostrUserSecret', skHex);
}

export async function sendVibeEvent(vibeSubject, vibeTag) {
    let sk = localStorage.getItem('nostrUserSecret');

    const relay = await Relay.connect('wss://relay.damus.io');

    relay.subscribe([
        {
          kinds: [5183]
        },
      ], {
        onevent(event) {
          console.log('got event:', event)
        }
      })

    let eventTemplate = {
        kind: 5183,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["subject", vibeSubject],
            ["tag", vibeTag]
        ],
        content: 'vibe tag',
    }

    // this assigns the pubkey, calculates the event id and signs the event in a single step
    const signedEvent = finalizeEvent(eventTemplate, sk)
    await relay.publish(signedEvent)

    relay.close()

}