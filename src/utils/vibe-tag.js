import { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { bytesToHex } from '@noble/hashes/utils';
import { Relay } from 'nostr-tools/relay';


if (!localStorage.getItem('nostrUserSecret')) {
  createNostrUser();
}

export let vibeCountDict = {
  "provocative": [],
  "positive": []
};

export let provocContentWordDict = {};

export function createNostrUser() {
    let sk = generateSecretKey() // `sk` is a Uint8Array
    let skHex = bytesToHex(sk) 
    let pk = getPublicKey(sk)
    localStorage.setItem('nostrUserSecret', skHex);
    localStorage.setItem('nostrUserPubkey', pk);
}

export async function sendVibeEvent(vibeSubject, vibeSubjectType, vibeTag, vibeSubjectContent) {
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
    localStorage.setItem(vibeSubject, vibeTag);
    relay.close()
    if (vibeTag === "provocative") {
      iterateProvocativeWordTracker(vibeSubjectContent)
    }
}

export async function iterateProvocativeWordTracker(content) {
  let sk = localStorage.getItem('nostrUserSecret');
  const relay = await Relay.connect('wss://relay.damus.io');
  let eventTemplate = {
      kind: 1967,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
          ["provoc_content", content]
      ],
      content: 'provoc_content',
  }

  // this assigns the pubkey, calculates the event id and signs the event in a single step
  const signedEvent = finalizeEvent(eventTemplate, sk)
  await relay.publish(signedEvent)
  subscribeToProvocWordDict();
  relay.close()
}

export async function subscribeToProvocWordDict() {
  const relay = await Relay.connect('wss://relay.damus.io');
  relay.subscribe([
    {
      kinds: [1967]
    },
    ], {
      onevent(event) {
        if (event.tags[0][0] === "provoc_content") {
          
          let provocContentWordArray = event.tags[0][1].split(" ");
          provocContentWordDict[event.id] = provocContentWordArray;
        }
      }
    });
}

export async function getVibeTagCount(vibeTag) {
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