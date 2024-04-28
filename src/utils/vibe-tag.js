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

export function createNostrUser() {
    let sk = generateSecretKey() // `sk` is a Uint8Array
    let skHex = bytesToHex(sk) 
    let pk = getPublicKey(sk)
    localStorage.setItem('nostrUserSecret', skHex);
    localStorage.setItem('nostrUserPubkey', pk);
}

export function relayPicker() {
  let relayList = ['wss://relay.damus.io', 'wss://a.nos.lol/', 'wss://e.nos.lol/', 'wss://nostr.mom/', 'wss://offchain.pub/']
  const selectedRelay = relayList[Math.floor(Math.random()*relayList.length)];
  return selectedRelay;
}

export async function sendVibeEvent(vibeSubject, vibeSubjectType, vibeTag, vibeSubjectContent) {
    let sk = localStorage.getItem('nostrUserSecret');
    const relay = await Relay.connect(relayPicker());
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
    iterateProvocativeWordTracker(vibeSubjectContent)
}

export function stripHtmlTags(content) {
  const regex = /<[^>]+(>|$)/g; // Matches any HTML tag
  return content.replace(regex, '');
}

export async function iterateProvocativeWordTracker(content) {
  let sk = localStorage.getItem('nostrUserSecret');
  const relay = await Relay.connect(relayPicker());
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
  subscribeToPositiveVibesWordDict();
  relay.close()
}

export async function subscribeToProvocWordDict() {
  const relay = await Relay.connect(relayPicker());
  relay.subscribe([
    {
      kinds: [1967]
    },
    ], {
      onevent(event) {
        let provocContentWordDictCheck = localStorage.getItem("provocContentWordDict");
        if (!provocContentWordDictCheck) {
          let placeholder = JSON.stringify({"": 0});
          localStorage.setItem("provocContentWordDict", placeholder);
        }
        let provocContentWordDict = JSON.parse(localStorage.getItem("provocContentWordDict"));
        if (event.tags[0][0] === "provoc_content") {
          const regex = /<([a-z]+)([^>]*?)>/gi;
          let provocContentWordArray = event.tags[0][1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(" ");
          provocContentWordArray.forEach((word) => {
            if (!word.match(regex)) {
              if (Object.keys(provocContentWordDict).includes(word)){
                provocContentWordDict[word] += 1;
              } else {
                provocContentWordDict[word] = 0;
              }
            }
          });
          localStorage.setItem("provocContentWordDict", JSON.stringify(provocContentWordDict));
          let provocContentWordDictTest = JSON.parse(localStorage.getItem("provocContentWordDict"));
          console.log(`provocContentWordDictTest: ${provocContentWordDictTest}`)
        }
      }
    });
}

export async function subscribeToPositiveVibesWordDict() {
  const relay = await Relay.connect(relayPicker());
  relay.subscribe([
    {
      kinds: [1967]
    },
    ], {
      onevent(event) {
        let provocContentWordDictCheck = localStorage.getItem("provocContentWordDict");
        if (!provocContentWordDictCheck) {
          let placeholder = JSON.stringify({"": 0});
          localStorage.setItem("provocContentWordDict", placeholder);
        }
        let provocContentWordDict = JSON.parse(localStorage.getItem("provocContentWordDict"));
        if (event.tags[0][0] === "positive") {
          const regex = /<([a-z]+)([^>]*?)>/gi;
          let positiveContentWordArray = event.tags[0][1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(" ");
          positiveContentWordArray.forEach((word) => {
            if (!word.match(regex)) {
              if (Object.keys(provocContentWordDict).includes(word)){
                provocContentWordDict[word] -= 1;
              }
            }
          });
          localStorage.setItem("provocContentWordDict", JSON.stringify(provocContentWordDict));
          let provocContentWordDictTest = JSON.parse(localStorage.getItem("provocContentWordDict"));
          console.log(`provocContentWordDictTest: ${provocContentWordDictTest}`)
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