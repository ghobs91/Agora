<div align="center">
  <img src="public/logo-192.png" width="128" height="128" alt="">

Agora
===

**Follow your interests across social networks!**
</div>



## Features
- You can log in to a Mastodon, Bluesky, or Nostr account on Agora and it'll pull in your following/followers list from that account, while still allowing you to view/interact with posts from the other 2 protocols using bridges behind the scenes.
- Intelligently loads your instance's version of a post so that you can like/boost/comment on it without having to think about what instance it's on.
- I've integrated those bridges into the search, so that if you search for a Bluesky handle like [aoc.bsky.social](https://agorasocial.app/#/fosstodon.org/a/111133786401697678) or a nostr users hex code like [Jack Dorsey's](https://agorasocial.app/#/fosstodon.org/a/109934331230225572), and it'll automatically know to use the bridges for those protocols and search for the bridged profile. You can even search for [elonmusk@twitter.com](https://agorasocial.app/#/fosstodon.org/a/109418526633386531) and it'll treat Twitter like another instance, and load up the bridged version of the account!
- When you follow a hashtag like #linux, it'll automatically follow the corresponding [Lemmy community](https://agorasocial.app/#/fosstodon.org/a/107294672647205675) for that topic in your feed.
- 👪 Multiple accounts
- 🪟 Compose window pop-out/in
- 🌗 Light/dark/auto theme
- 🔔 Grouped notifications
- 🪺 Nested comments thread
- 📬 Unsent draft recovery
- 🎠 Boosts Carousel™️
- #️⃣ Multi-hashtag timeline

## Subtle UI implementations

### User name display

![User name display](readme-assets/user-name-display.jpg)

- On the timeline, the user name is displayed as `[NAME] @[username]`.
- For the `@[username]`, always exclude the instance domain name.
- If the `[NAME]` *looks the same* as the `@[username]`, then the `@[username]` is excluded as well.

### Boosts Carousel

![Boosts Carousel](readme-assets/boosts-carousel.jpg)

- From the fetched posts (e.g. 20 posts per fetch), if number of boosts are more than quarter of total posts or more than 3 consecutive boosts, boosts carousel UI will be triggered.
- If number of boosts are more than 3 quarters of total posts, boosts carousel UI will be slotted at the end of total posts fetched (per "page").
- Else, boosts carousel UI will be slotted in between the posts.

### Thread number badge (e.g. Thread 1/X)

![Thread number badge](readme-assets/thread-number-badge.jpg)

- Check every post for `inReplyToId` from cache or additional API requests, until the root post is found.
- If root post is found, badge will show the index number of the post in the thread.
- Limit up to 3 API requests as the root post may be very old or the thread is super long.
- If index number couldn't be found, badge will fallback to showing `Thread` without the number.

### Hashtag stuffing collapsing

![Hashtag stuffing collapsing](readme-assets/hashtag-stuffing-collapsing.jpg)

- First paragraph of post content with more than 3 hashtags will be collapsed to max 3 lines.
- Subsequent paragraphs after first paragraph with more than 3 hashtags will be collapsed to 1 line.
- Adjacent paragraphs with more than 1 hashtag after collapsed paragraphs will be collapsed to 1 line.
- If there are text around or between the hashtags, they will not be collapsed.
- Collapsed hashtags will be appended with `...` at the end.
- They are also slightly faded out to reduce visual noise.
- Opening the post view will reveal the hashtags uncollapsed.

### Filtered posts

- "Hide completely"-filtered posts will be hidden, with no UI to reveal it.
- "Hide with a warning"-filtered posts will be partially hidden, showing the filter name and author name.
  - Content can be partially revealed by hovering over the post, with tooltip showing the post text.
  - Clicking it will open the Post page.
  - Long-pressing or right-clicking it will "peek" the post with a bottom sheet UI.
  - On boosts carousel, they are sorted to the end of the carousel.

## Development

Prerequisites: Node.js 18+

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run fetch-instances` - Fetch instances list from [instances.social](https://instances.social/), save it to `src/data/instances.json`
  - requires `.env.dev` file with `INSTANCES_SOCIAL_SECRET_TOKEN` variable set
- `npm run sourcemap` - Run `source-map-explorer` on the production build

## Self-hosting

This is a **pure static web app**. You can host it anywhere you want. Build it by running `npm run build` (after `npm install`) and serve the `dist` folder.

I personally use Vercel to host Agora.

## Tech stack

- [Vite](https://vitejs.dev/) - Build tool
- [Preact](https://preactjs.com/) - UI library
- [Valtio](https://valtio.pmnd.rs/) - State management
- [React Router](https://reactrouter.com/) - Routing
- [masto.js](https://github.com/neet/masto.js/) - Mastodon API client
- [Iconify](https://iconify.design/) - Icon library
  - [MingCute icons](https://www.mingcute.com/)
- Vanilla CSS - *Yes, I'm old school.*

Some of these may change in the future. The front-end world is ever-changing.

## Alternative web clients

- [Pinafore](https://pinafore.social/) ([retired](https://nolanlawson.com/2023/01/09/retiring-pinafore/)) - forks ↓
  - [Semaphore](https://semaphore.social/)
  - [Enafore](https://enafore.social/)
- [Cuckoo+](https://www.cuckoo.social/)
- [Sengi](https://nicolasconstant.github.io/sengi/)
- [Soapbox](https://fe.soapbox.pub/)
- [Elk](https://elk.zone/) - forks ↓
  - [elk.fedified.com](https://elk.fedified.com/)
- [Mastodeck](https://mastodeck.com/)
- [Trunks](https://trunks.social/)
- [Tooty](https://github.com/n1k0/tooty)
- [Litterbox](https://litterbox.koyu.space/)
- [Statuzer](https://statuzer.com/)
- [Tusked](https://tusked.app/)
- [More...](https://github.com/hueyy/awesome-mastodon/#clients)

## 💁‍♂️ Notice to all other social media client developers

Please, please copy the UI ideas and experiments from this app. I think some of them are pretty good and it would be great if more apps have them.

If you're not a developer, please tell your favourite social media client developers about this app and ask them to copy the UI ideas and experiments.

## License

[MIT](https://cheeaun.mit-license.org/).
