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

export let commonwords = [
  {
    "rank": "1",
    "word": "the"
  },
  {
    "rank": "2",
    "word": "be"
  },
  {
    "rank": "3",
    "word": "to"
  },
  {
    "rank": "4",
    "word": "of"
  },
  {
    "rank": "5",
    "word": "and"
  },
  {
    "rank": "6",
    "word": "a"
  },
  {
    "rank": "7",
    "word": "in"
  },
  {
    "rank": "8",
    "word": "that"
  },
  {
    "rank": "9",
    "word": "have"
  },
  {
    "rank": "10",
    "word": "I"
  },
  {
    "rank": "11",
    "word": "it"
  },
  {
    "rank": "12",
    "word": "for"
  },
  {
    "rank": "13",
    "word": "not"
  },
  {
    "rank": "14",
    "word": "on"
  },
  {
    "rank": "15",
    "word": "with"
  },
  {
    "rank": "16",
    "word": "he"
  },
  {
    "rank": "17",
    "word": "as"
  },
  {
    "rank": "18",
    "word": "you"
  },
  {
    "rank": "19",
    "word": "do"
  },
  {
    "rank": "20",
    "word": "at"
  },
  {
    "rank": "21",
    "word": "this"
  },
  {
    "rank": "22",
    "word": "but"
  },
  {
    "rank": "23",
    "word": "his"
  },
  {
    "rank": "24",
    "word": "by"
  },
  {
    "rank": "25",
    "word": "from"
  },
  {
    "rank": "26",
    "word": "they"
  },
  {
    "rank": "27",
    "word": "we"
  },
  {
    "rank": "28",
    "word": "say"
  },
  {
    "rank": "29",
    "word": "her"
  },
  {
    "rank": "30",
    "word": "she"
  },
  {
    "rank": "31",
    "word": "or"
  },
  {
    "rank": "32",
    "word": "an"
  },
  {
    "rank": "33",
    "word": "will"
  },
  {
    "rank": "34",
    "word": "my"
  },
  {
    "rank": "35",
    "word": "one"
  },
  {
    "rank": "36",
    "word": "all"
  },
  {
    "rank": "37",
    "word": "would"
  },
  {
    "rank": "38",
    "word": "there"
  },
  {
    "rank": "39",
    "word": "their"
  },
  {
    "rank": "40",
    "word": "what"
  },
  {
    "rank": "41",
    "word": "so"
  },
  {
    "rank": "42",
    "word": "up"
  },
  {
    "rank": "43",
    "word": "out"
  },
  {
    "rank": "44",
    "word": "if"
  },
  {
    "rank": "45",
    "word": "about"
  },
  {
    "rank": "46",
    "word": "who"
  },
  {
    "rank": "47",
    "word": "get"
  },
  {
    "rank": "48",
    "word": "which"
  },
  {
    "rank": "49",
    "word": "go"
  },
  {
    "rank": "50",
    "word": "me"
  },
  {
    "rank": "51",
    "word": "when"
  },
  {
    "rank": "52",
    "word": "make"
  },
  {
    "rank": "53",
    "word": "can"
  },
  {
    "rank": "54",
    "word": "like"
  },
  {
    "rank": "55",
    "word": "time"
  },
  {
    "rank": "56",
    "word": "no"
  },
  {
    "rank": "57",
    "word": "just"
  },
  {
    "rank": "58",
    "word": "him"
  },
  {
    "rank": "59",
    "word": "know"
  },
  {
    "rank": "60",
    "word": "take"
  },
  {
    "rank": "61",
    "word": "people"
  },
  {
    "rank": "62",
    "word": "into"
  },
  {
    "rank": "63",
    "word": "year"
  },
  {
    "rank": "64",
    "word": "your"
  },
  {
    "rank": "65",
    "word": "good"
  },
  {
    "rank": "66",
    "word": "some"
  },
  {
    "rank": "67",
    "word": "could"
  },
  {
    "rank": "68",
    "word": "them"
  },
  {
    "rank": "69",
    "word": "see"
  },
  {
    "rank": "70",
    "word": "other"
  },
  {
    "rank": "71",
    "word": "than"
  },
  {
    "rank": "72",
    "word": "then"
  },
  {
    "rank": "73",
    "word": "now"
  },
  {
    "rank": "74",
    "word": "look"
  },
  {
    "rank": "75",
    "word": "only"
  },
  {
    "rank": "76",
    "word": "come"
  },
  {
    "rank": "77",
    "word": "its"
  },
  {
    "rank": "78",
    "word": "over"
  },
  {
    "rank": "79",
    "word": "think"
  },
  {
    "rank": "80",
    "word": "also"
  },
  {
    "rank": "81",
    "word": "back"
  },
  {
    "rank": "82",
    "word": "after"
  },
  {
    "rank": "83",
    "word": "use"
  },
  {
    "rank": "84",
    "word": "two"
  },
  {
    "rank": "85",
    "word": "how"
  },
  {
    "rank": "86",
    "word": "our"
  },
  {
    "rank": "87",
    "word": "work"
  },
  {
    "rank": "88",
    "word": "first"
  },
  {
    "rank": "89",
    "word": "well"
  },
  {
    "rank": "90",
    "word": "way"
  },
  {
    "rank": "91",
    "word": "even"
  },
  {
    "rank": "92",
    "word": "new"
  },
  {
    "rank": "93",
    "word": "want"
  },
  {
    "rank": "94",
    "word": "because"
  },
  {
    "rank": "95",
    "word": "any"
  },
  {
    "rank": "96",
    "word": "these"
  },
  {
    "rank": "97",
    "word": "give"
  },
  {
    "rank": "98",
    "word": "day"
  },
  {
    "rank": "99",
    "word": "most"
  },
  {
    "rank": "100",
    "word": "us"
  }
]

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
    if (vibeTag === "positive") {
      iteratePositiveWordTracker(vibeSubjectContent)
    } else if (vibeTag === "provocative") {
      iterateProvocativeWordTracker(vibeSubjectContent);
    }
}

export function cleanContentString(content) {
  let cleanedContent = stripHtmlTags(content);
  cleanedContent = cleanedContent.split(" ").filter((word) => {
    return word.length >= 4 && isNaN(word);
  })
  return cleanedContent;
}

export function stripHtmlTags(content) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = content;
  // console.log(`cleaned up text: ${tempElement.textContent || tempElement.innerText}`)
  return tempElement.textContent || tempElement.innerText;
}

export async function iteratePositiveWordTracker(content) {
  let sk = localStorage.getItem('nostrUserSecret');
  const relay = await Relay.connect(relayPicker());
  let eventTemplate = {
      kind: 1967,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
          ["provoc_content", JSON.stringify(content)]
      ],
      content: 'provoc_content',
  }

  // this assigns the pubkey, calculates the event id and signs the event in a single step
  const signedEvent = finalizeEvent(eventTemplate, sk)
  await relay.publish(signedEvent)
  subscribeToPositiveVibesWordDict();
  relay.close()
}

export async function iterateProvocativeWordTracker(content) {
  let sk = localStorage.getItem('nostrUserSecret');
  const relay = await Relay.connect(relayPicker());
  let eventTemplate = {
      kind: 1967,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
          ["provoc_content", JSON.stringify(content)]
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
          let provocContentWordArray = cleanContentString(event.tags[0][1]);
          provocContentWordArray.forEach((word) => {
            if (!word.match(regex)) {
              if (Object.keys(provocContentWordDict).includes(word)){
                provocContentWordDict[word] += 1;
              } else {
                provocContentWordDict[word] = 1;
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
          let positiveContentWordArray = cleanContentString(event.tags[0][1]);
          positiveContentWordArray.forEach((word) => {
            if (!word.match(regex)) {
              if (Object.keys(provocContentWordDict).includes(word)){
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