export function bridgifySearchQuery(instance, query, params) {
  if (instance === "gleasonator.dev") {
    let convertedQuery = query;
    if (query.indexOf("bsky.social") > -1 || query.indexOf("bsky.team") > -1) {
      if (query.indexOf("@") === 0) {
        convertedQuery = query.replace("@", "")
      }
      convertedQuery += "_at_bsky.brid.gy@momostr.pink";
      params.q = convertedQuery;
      return params.q;
    } else if (query.indexOf("@") > 0) {
      let replacedString = params.q.replace("@", "_at_");
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
      //     const dittoProfileCall = await fetch(`https://gleasonator.dev/api/v1/accounts/${matchedMostrHex}`, {method: "get"});
      //     const dittoProfileCallResponse = await dittoProfileCall.json();
      //     location.hash = `/${instance}/a/${dittoProfileCallResponse.id}`;
      //   }
      // })();
      // console.log(`instance === "gleasonator.dev"`)
    } else if (instance === "skybridge.fly.dev") {
      if (query.indexOf("@") === 0) {
        let replacedString = params.q.replace("@", "");
        replacedString = replacedString.replace("@", ".");
        replacedString += ".ap.brid.gy";
        params.q = replacedString
        return params.q;
      } else if (query.indexOf("@") > 0) {
        let replacedString = params.q.replace("@", ".");
        replacedString += ".ap.brid.gy";
        params.q = replacedString
        return params.q;
      }
    } else {
      if (query.indexOf("@") === -1) {
        if (query.indexOf("bsky.social") > -1 || query.indexOf("bsky.team") > -1) {
          params.q += "@bsky.brid.gy";
          return params.q;
        } else if (query.match(/^[0-9a-fA-F]{64}$/)) {
          params.q += "@mostr.pub";
          return params.q;
        } else if (query.includes("npub")) {
          params.q += "@momostr.pink";
          return params.q;
        }
      } else if (query.indexOf("@twitter.com") > -1) {
        const replacedString = params.q.replace("twitter.com", "bird.makeup")
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

export function canAutoLoadThisInstance(myCurrentInstance, heroStatus) {
    // Automatically switch to users instance to allow interacting with a status
    return myCurrentInstance != 'gleasonator.dev' && myCurrentInstance != 'skybridge.fly.dev' && heroStatus.account.acct.indexOf("mostr.pub") === -1 && heroStatus.account.acct.indexOf("threads.net") === -1;
}

export function translateNostrTrendingArrayStructure(nostrTrendingArray) {
    return true;
}