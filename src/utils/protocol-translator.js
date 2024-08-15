export function isNostrAccount(instance) {
  let nostrAccountLoginBridges = ["gleasonator.dev", "ditto.pub"];
  return nostrAccountLoginBridges.indexOf(instance) > -1;
}

export function bridgifySearchQuery(instance, query, params) {
  if (isNostrAccount(instance)) {
      // // // // // // // // // // // // // 
      // Searching from a Nostr Account //
    let convertedQuery = query;
    if (isSearchingBlueskyAccount(query)) {
      if (query.indexOf("@") === 0) {
        convertedQuery = query.replace("@", "")
      }
      convertedQuery += "_at_bsky.brid.gy@momostr.pink";
      params.q = convertedQuery;
      return params.q;
    } else if (isSearchingTwitterAccount(query)) {
      params.q.replace("@twitter.com", "_at_bird.makeup@momostr.pink");
      return params.q;
    } else if (isSearchingMastodonAccount(query)) {
      if (query.indexOf("@") === 0) {
        convertedQuery = query.replace("@", "")
      }
      let replacedString = convertedQuery.replace("@", "_at_");
      replacedString += "@momostr.pink";
      params.q = replacedString
      return params.q;
    } 
      // (async () => {
      //   convertedQuery = query.replace("@", "_at_");
      //   const matchedMostrHexPing = await fetch(`https://mostr.pub/.well-known/nostr.json?name=${convertedQuery}`, {method: "get"});
      //   const matchedMostrHexPingResponse = await matchedMostrHexPing.json();
      //   if (matchedMostrHexPingResponse && matchedMostrHexPingResponse["names"]) {
      //     const matchedMostrHex = matchedMostrHexPingResponse["names"][convertedQuery]
      //     const dittoProfileCall = await fetch(`https://ditto.pub/api/v1/accounts/${matchedMostrHex}`, {method: "get"});
      //     const dittoProfileCallResponse = await dittoProfileCall.json();
      //     location.hash = `/${instance}/a/${dittoProfileCallResponse.id}`;
      //   }
      // })();
      // console.log(`instance === "ditto.pub"`)
    } else if (instance === "skybridge-rpoo.onrender.com") {
       // // // // // // // // // // // // // 
      // Searching from a Bluesky Account //
      if (isSearchingMastodonAccount(query)) {
        let replacedString; 
        if (query.indexOf('@') === 0) {
          replacedString = params.q.replace("@", "");
        }
        replacedString = replacedString.replace("@", ".");
        replacedString += ".ap.brid.gy";
        params.q = replacedString
        return params.q;
      } else if (isSearchingNostrAccount(query)) {
        params.q = query += ".momostr.pink.ap.brid.gy";
      }
    } else {
      // // // // // // // // // // // // // 
      // Searching from a Mastodon Account //
      if (isSearchingBlueskyAccount(query)) {
        params.q += "@bsky.brid.gy";
        return params.q;
      } else if (isSearchingNostrAccount(query)) {
        params.q += "@momostr.pink"
      }
      // if (query.indexOf("@") === -1) {
      //   if (query.indexOf("bsky.social") > -1 || query.indexOf("bsky.team") > -1) {
      //     params.q += "@bsky.brid.gy";
      //     return params.q;
      //   } else if (query.match(/^[0-9a-fA-F]{64}$/)) {
      //     params.q += "@mostr.pub";
      //     return params.q;
      //   } else if (query.includes("npub")) {
      //     params.q += "@momostr.pink";
      //     return params.q;
      //   }
      // } 
      else if (isSearchingTwitterAccount(query)) {
        const replacedString = params.q.replace("twitter.com", "bird.makeup");
        params.q = replacedString;
        return params.q;
      }
      if (query.indexOf("/" === 0)) {
        let replacedString = params.q.replace("/", "");
        params.q = replacedString;
        return params.q;
      }
    }
}

export function isSearchingBlueskyAccount(query) {
  return query.indexOf(".") > -1 && (query.slice(1).indexOf("@") === -1);
}

export function isSearchingMastodonAccount(query) {
  return (query.slice(1).indexOf("@") > -1) && (query.indexOf("twitter.com" < 0));
}

export function isSearchingNostrAccount(query) {
  return query.indexOf("npub") > -1;
}

export function isSearchingTwitterAccount(query) {
  return query.indexOf("@twitter.com") > -1;
}

export function canAutoLoadThisInstance(myCurrentInstance, heroStatus) {
    // Automatically switch to users instance to allow interacting with a status
    return myCurrentInstance != 'ditto.pub' && myCurrentInstance != 'skybridge-rpoo.onrender.com' && heroStatus.account.acct.indexOf("mostr.pub") === -1 && heroStatus.account.acct.indexOf("threads.net") === -1;
}

export function translateNostrTrendingArrayStructure(nostrTrendingArray) {
    return true;
}