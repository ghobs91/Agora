import './lists.css';

import { Menu, MenuItem } from '@szhsin/react-menu';
import { useEffect, useRef, useState } from 'preact/hooks';
import { InView } from 'react-intersection-observer';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnapshot } from 'valtio';

import AccountBlock from '../components/account-block';
import Icon from '../components/icon';
import Link from '../components/link';
import ListAddEdit from '../components/list-add-edit';
import Menu2 from '../components/menu2';
import MenuConfirm from '../components/menu-confirm';
import Modal from '../components/modal';
import Timeline from '../components/timeline';
import { api } from '../utils/api';
import { filteredItems } from '../utils/filters';
import states, { saveStatus } from '../utils/states';
import useTitle from '../utils/useTitle';

const LIMIT = 20;

function SuggestedFollows(props) {
  const snapStates = useSnapshot(states);
  const { masto, instance } = api();
  const id = props?.id || useParams()?.id;
  // const navigate = useNavigate();
  const latestItem = useRef();
  // const [reloadCount, reload] = useReducer((c) => c + 1, 0);

  const listIterator = useRef();
  async function fetchList(firstLoad) {
    if (firstLoad || !listIterator.current) {
      listIterator.current = masto.v1.timelines.list.$select(id).list({
        limit: LIMIT,
      });
    }
    const results = await listIterator.current.next();
    let { value } = results;
    if (value?.length) {
      if (firstLoad) {
        latestItem.current = value[0].id;
      }

      value = filteredItems(value, 'home');
      value.forEach((item) => {
        saveStatus(item, instance);
      });
    }
    return {
      ...results,
      value,
    };
  }

  async function checkForUpdates() {
    try {
      const results = await masto.v1.timelines.list.$select(id).list({
        limit: 1,
        since_id: latestItem.current,
      });
      let { value } = results;
      value = filteredItems(value, 'home');
      if (value?.length) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  const [list, setList] = useState({ title: 'List' });
  // const [title, setTitle] = useState(`List`);
  useTitle(list.title, `/l/:id`);
  useEffect(() => {
    (async () => {
      try {
        const list = await masto.v1.lists.$select(id).fetch();
        setList(list);
        // setTitle(list.title);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const [showListAddEditModal, setShowListAddEditModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);

  return (
    <Modal
    class="light"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowManageMembersModal(false);
      }
    }}
  >
    <ListManageMembers
      listID={id}
      onClose={() => setShowManageMembersModal(false)}
    />
  </Modal>
  );
}

const MEMBERS_LIMIT = 40;
function ListManageMembers({ listID, onClose }) {
  // Show list of members with [Remove] button
  // API only returns 40 members at a time, so this need to be paginated with infinite scroll
  // Show [Add] button after removing a member
  const { masto, instance } = api();
  const [members, setMembers] = useState([]);
  const [uiState, setUIState] = useState('default');
  const [showMore, setShowMore] = useState(false);

  const membersIterator = useRef();

  async function fetchMembers(firstLoad) {
    setShowMore(false);
    setUIState('loading');
    (async () => {
      try {
        // if (firstLoad || !membersIterator.current) {
        //   membersIterator.current = masto.v1.lists
        //     .$select(listID)
        //     .accounts.list({
        //       limit: MEMBERS_LIMIT,
        //     });
        // }
        const results = [
            {
              "id": "111607013033950263",
              "created_at": "2023-12-19T12:11:07.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": "en",
              "uri": "https://mastodon.online/users/9to5Mac/statuses/111607012885654703",
              "url": "https://mastodon.online/@9to5Mac/111607012885654703",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Apple <a href=\"https://mastodon.online/tags/News\" class=\"mention hashtag\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">#<span>News</span></a>+ now includes sports coverage from The Athletic, Wirecutter coming soon <a href=\"https://9to5mac.com/2023/12/19/apple-news-sports-coverage-from-the-athletic-wirecutter/?utm_source=dlvr.it&amp;utm_medium=mastodon\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">9to5mac.com/2023/12/19/apple-n</span><span class=\"invisible\">ews-sports-coverage-from-the-athletic-wirecutter/?utm_source=dlvr.it&amp;utm_medium=mastodon</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109299914799663464",
                "username": "9to5Mac",
                "acct": "9to5Mac@mastodon.online",
                "display_name": "9to5Mac",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2022-11-04T00:00:00.000Z",
                "note": "<p>We break Apple news. Follow for the latest leaks, rumors, reviews, tips, and more</p>",
                "url": "https://mastodon.online/@9to5Mac",
                "uri": "https://mastodon.online/users/9to5Mac",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/299/914/799/663/464/original/ea608f55114edb47.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/299/914/799/663/464/original/ea608f55114edb47.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/299/914/799/663/464/original/27c362e2ad44ddd5.jpg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/299/914/799/663/464/original/27c362e2ad44ddd5.jpg",
                "followers_count": 24103,
                "following_count": 10,
                "statuses_count": 6363,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Website",
                    "value": "<a href=\"https://9to5mac.com\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">9to5mac.com</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Instagram",
                    "value": "<a href=\"https://instagram.com/9to5mac\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">instagram.com/9to5mac</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Youtube",
                    "value": "<a href=\"https://youtube.com/9to5mac\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">youtube.com/9to5mac</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Got a tip for us?",
                    "value": "tips@9to5mac.com",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111607012941921599",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/607/012/941/921/599/original/63961036673e5466.jpeg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/607/012/941/921/599/small/63961036673e5466.jpeg",
                  "remote_url": "https://files.mastodon.online/media_attachments/files/111/607/012/824/723/541/original/56ac3844568363fb.jpeg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 628,
                      "size": "1200x628",
                      "aspect": 1.910828025477707
                    },
                    "small": {
                      "width": 663,
                      "height": 347,
                      "size": "663x347",
                      "aspect": 1.9106628242074928
                    }
                  },
                  "description": null,
                  "blurhash": "UYRC[6j[~qj]M{fQxuj[t7fkRjayoffQafj["
                }
              ],
              "mentions": [],
              "tags": [
                {
                  "name": "news",
                  "url": "https://fosstodon.org/tags/news"
                }
              ],
              "emojis": [],
              "card": {
                "url": "https://9to5mac.com/2023/12/19/apple-news-sports-coverage-from-the-athletic-wirecutter/",
                "title": "Apple News+ now includes sports coverage from The Athletic, Wirecutter coming soon - 9to5Mac",
                "description": "Apple today announced a new partnership with The Athletic and Wirecutter, which will see their content included in the Apple...",
                "language": "en",
                "type": "link",
                "author_name": "",
                "author_url": "",
                "provider_name": "9to5Mac",
                "provider_url": "",
                "html": "",
                "width": 1200,
                "height": 628,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/980/726/original/d79458a29f57fd33.jpeg",
                "image_description": "",
                "embed_url": "",
                "blurhash": "UYRMb#j[~qj[M{fQxuj[t7fkRjayoffQWBj[",
                "published_at": "2023-12-19T12:10:06.000Z"
              },
              "poll": null
            },
            {
              "id": "111607005737137852",
              "created_at": "2023-12-19T12:09:16.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": null,
              "uri": "https://mastodon.social/users/Gargron/statuses/111607005632999001/activity",
              "url": null,
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "",
              "filtered": [],
              "reblog": {
                "id": "111606942552063027",
                "created_at": "2023-12-19T11:53:10.000Z",
                "in_reply_to_id": null,
                "in_reply_to_account_id": null,
                "sensitive": false,
                "spoiler_text": "",
                "visibility": "public",
                "language": "en",
                "uri": "https://mastodon.social/users/ZachWeinersmith/statuses/111606942306759438",
                "url": "https://mastodon.social/@ZachWeinersmith/111606942306759438",
                "replies_count": 4,
                "reblogs_count": 6,
                "favourites_count": 1,
                "edited_at": null,
                "favourited": false,
                "reblogged": false,
                "muted": false,
                "bookmarked": false,
                "content": "<p>Everything after about 2020 will be suspect. What a strange future. <a href=\"https://www.reddit.com/r/midjourney/comments/18kx2gi/is_walmart_using_ai_art_for_these_christmas/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://www.</span><span class=\"ellipsis\">reddit.com/r/midjourney/commen</span><span class=\"invisible\">ts/18kx2gi/is_walmart_using_ai_art_for_these_christmas/</span></a></p>",
                "filtered": [],
                "reblog": null,
                "account": {
                  "id": "109523471641878330",
                  "username": "ZachWeinersmith",
                  "acct": "ZachWeinersmith@mastodon.social",
                  "display_name": "Zach Weinersmith",
                  "locked": false,
                  "bot": false,
                  "discoverable": true,
                  "group": false,
                  "created_at": "2022-12-16T00:00:00.000Z",
                  "note": "<p>The SMBC guy. <br>New book: A City on Mars (Nov 2)</p><p>Co-author of Soonish<br>Illustrator of Open Borders<br>Scop of Bea Wolf.</p>",
                  "url": "https://mastodon.social/@ZachWeinersmith",
                  "uri": "https://mastodon.social/users/ZachWeinersmith",
                  "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/523/471/641/878/330/original/0e4d1f2a30ca8a8f.png",
                  "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/523/471/641/878/330/original/0e4d1f2a30ca8a8f.png",
                  "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/523/471/641/878/330/original/15903a1c042bcf2c.jpg",
                  "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/523/471/641/878/330/original/15903a1c042bcf2c.jpg",
                  "followers_count": 14963,
                  "following_count": 517,
                  "statuses_count": 1391,
                  "last_status_at": "2023-12-19",
                  "emojis": [],
                  "fields": []
                },
                "media_attachments": [],
                "mentions": [],
                "tags": [],
                "emojis": [],
                "card": null,
                "poll": null
              },
              "account": {
                "id": "75",
                "username": "Gargron",
                "acct": "Gargron@mastodon.social",
                "display_name": "Eugen Rochko",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2016-03-16T00:00:00.000Z",
                "note": "<p>Founder of <span class=\"h-card\" translate=\"no\"><a href=\"https://mastodon.social/@Mastodon\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>Mastodon</span></a></span>. Film photography, prog metal, Dota 2.</p>",
                "url": "https://mastodon.social/@Gargron",
                "uri": "https://mastodon.social/users/Gargron",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/000/000/075/original/d6c505b333c5f0fe.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/000/000/075/original/d6c505b333c5f0fe.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/000/000/075/original/83251657277d5ccd.png",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/000/000/075/original/83251657277d5ccd.png",
                "followers_count": 341794,
                "following_count": 510,
                "statuses_count": 75663,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Patreon",
                    "value": "<a href=\"https://www.patreon.com/mastodon\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://www.</span><span class=\"\">patreon.com/mastodon</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "GitHub",
                    "value": "<a href=\"https://github.com/Gargron\" target=\"_blank\" rel=\"nofollow noopener noreferrer\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">github.com/Gargron</span><span class=\"invisible\"></span></a>",
                    "verified_at": "2023-12-18T14:45:07.208+00:00"
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606993120238503",
              "created_at": "2023-12-19T12:06:03.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": "en",
              "uri": "https://mas.to/users/alternativeto/statuses/111606992944106836",
              "url": "https://mas.to/@alternativeto/111606992944106836",
              "replies_count": 0,
              "reblogs_count": 5,
              "favourites_count": 2,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>The Thunderbird team has released its progress report in the rebranding of K-9 Mail as Thunderbird for Android. While the latest update improves many aspects of the email client, the rebranding has been delayed until all features are fully implemented.<br><a href=\"https://alternativeto.net/news/2023/12/thunderbird-for-android-faces-delays-as-developers-work-to-implement-all-needed-features/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">alternativeto.net/news/2023/12</span><span class=\"invisible\">/thunderbird-for-android-faces-delays-as-developers-work-to-implement-all-needed-features/</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109795771421793822",
                "username": "alternativeto",
                "acct": "alternativeto@mas.to",
                "display_name": "AlternativeTo",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2022-12-19T00:00:00.000Z",
                "note": "<p>🤖 AlternativeTo is the ultimate hub for discovering new and exciting software, no matter what platform you're on! Whether you're looking for apps for Windows, Mac, Linux, online services or mobile devices, we've got you covered!</p><p>🇸🇪 AlternativeTo was founded in 2009 in Sweden by Ola and Markus.</p>",
                "url": "https://mas.to/@alternativeto",
                "uri": "https://mas.to/users/alternativeto",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/795/771/421/793/822/original/038748dc21cda937.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/795/771/421/793/822/original/038748dc21cda937.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/795/771/421/793/822/original/2ddfdb90f6285181.webp",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/795/771/421/793/822/original/2ddfdb90f6285181.webp",
                "followers_count": 2602,
                "following_count": 342,
                "statuses_count": 2794,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "🌐 Website",
                    "value": "<a href=\"https://alternativeto.net\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">alternativeto.net</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "🗣️ Discord",
                    "value": "<a href=\"https://discord.gg/VS45yNS\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">discord.gg/VS45yNS</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "🐦 Twitter",
                    "value": "<a href=\"https://twitter.com/AlternativeTo/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">twitter.com/AlternativeTo/</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "📘 Facebook",
                    "value": "<a href=\"https://www.facebook.com/AlternativeTo/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://www.</span><span class=\"\">facebook.com/AlternativeTo/</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606992983296980",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/992/983/296/980/original/a0c2544d9614aca5.jpeg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/992/983/296/980/small/a0c2544d9614aca5.jpeg",
                  "remote_url": "https://media.mas.to/masto-public/media_attachments/files/111/606/992/832/995/640/original/b2232d30e384662a.jpeg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1024,
                      "height": 576,
                      "size": "1024x576",
                      "aspect": 1.7777777777777777
                    },
                    "small": {
                      "width": 640,
                      "height": 360,
                      "size": "640x360",
                      "aspect": 1.7777777777777777
                    }
                  },
                  "description": "A black background with the Thunderbird and K-9 Mail logos side by side in the middle.",
                  "blurhash": "UVB-=8FaEe=LxGSfWVsA1G#n$jFGJ7sAsoOD"
                }
              ],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606969942912568",
              "created_at": "2023-12-19T00:14:52.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/mkbhd/statuses/1736902882924941483",
              "url": "https://bird.makeup/users/mkbhd/statuses/1736902882924941483",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Editing... and there is a new trophy category this year 👀</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109723317718596184",
                "username": "mkbhd",
                "acct": "mkbhd@bird.makeup",
                "display_name": "Marques Brownlee",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-01-20T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/mkbhd",
                "uri": "https://bird.makeup/users/mkbhd",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/723/317/718/596/184/original/1467db54c7d1ae29.jpg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/723/317/718/596/184/original/1467db54c7d1ae29.jpg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/723/317/718/596/184/original/749fcb40b22fbd4c.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/723/317/718/596/184/original/749fcb40b22fbd4c.jpeg",
                "followers_count": 24,
                "following_count": 0,
                "statuses_count": 947,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "NYC",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/mkbhd\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/mkbhd</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606969830593688",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/969/830/593/688/original/678a2fba5689f182.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/969/830/593/688/small/678a2fba5689f182.jpg",
                  "remote_url": "https://pbs.twimg.com/media/GBq38-zXcAASh2d.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 900,
                      "height": 1200,
                      "size": "900x1200",
                      "aspect": 0.75
                    },
                    "small": {
                      "width": 416,
                      "height": 554,
                      "size": "416x554",
                      "aspect": 0.7509025270758123
                    }
                  },
                  "description": null,
                  "blurhash": "UHDuiZ-VxC-P0sOZI:NG?b=z-gxZEfNfS#tR"
                }
              ],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606955824844407",
              "created_at": "2023-12-19T11:56:35.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": "en",
              "uri": "https://mastodon.online/users/9to5Mac/statuses/111606955705385501",
              "url": "https://mastodon.online/@9to5Mac/111606955705385501",
              "replies_count": 0,
              "reblogs_count": 1,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Xfinity data breach revealed: Names, contact info, security Q&amp;As, and more at risk <a href=\"https://9to5mac.com/2023/12/19/xfinity-data-breach-hack/?utm_source=dlvr.it&amp;utm_medium=mastodon\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">9to5mac.com/2023/12/19/xfinity</span><span class=\"invisible\">-data-breach-hack/?utm_source=dlvr.it&amp;utm_medium=mastodon</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109299914799663464",
                "username": "9to5Mac",
                "acct": "9to5Mac@mastodon.online",
                "display_name": "9to5Mac",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2022-11-04T00:00:00.000Z",
                "note": "<p>We break Apple news. Follow for the latest leaks, rumors, reviews, tips, and more</p>",
                "url": "https://mastodon.online/@9to5Mac",
                "uri": "https://mastodon.online/users/9to5Mac",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/299/914/799/663/464/original/ea608f55114edb47.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/299/914/799/663/464/original/ea608f55114edb47.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/299/914/799/663/464/original/27c362e2ad44ddd5.jpg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/299/914/799/663/464/original/27c362e2ad44ddd5.jpg",
                "followers_count": 24103,
                "following_count": 10,
                "statuses_count": 6363,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Website",
                    "value": "<a href=\"https://9to5mac.com\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">9to5mac.com</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Instagram",
                    "value": "<a href=\"https://instagram.com/9to5mac\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">instagram.com/9to5mac</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Youtube",
                    "value": "<a href=\"https://youtube.com/9to5mac\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">youtube.com/9to5mac</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Got a tip for us?",
                    "value": "tips@9to5mac.com",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606955762682894",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/955/762/682/894/original/be8b8b75a8c281ec.jpeg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/955/762/682/894/small/be8b8b75a8c281ec.jpeg",
                  "remote_url": "https://files.mastodon.online/media_attachments/files/111/606/955/617/795/830/original/1ec6a3494455ebc2.jpeg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 628,
                      "size": "1200x628",
                      "aspect": 1.910828025477707
                    },
                    "small": {
                      "width": 663,
                      "height": 347,
                      "size": "663x347",
                      "aspect": 1.9106628242074928
                    }
                  },
                  "description": null,
                  "blurhash": "U78ooZ}Z5*I:9qI;bcf,7LSd,EWANEW=$jw|"
                }
              ],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": {
                "url": "https://9to5mac.com/2023/12/19/xfinity-data-breach-hack/",
                "title": "Xfinity data breach: Names, contact info, and much more at risk",
                "description": "An Xfinity data breach has been revealed by the company, in which hackers were able to obtain a wide range...",
                "language": "en",
                "type": "link",
                "author_name": "",
                "author_url": "",
                "provider_name": "9to5Mac",
                "provider_url": "",
                "html": "",
                "width": 1200,
                "height": 628,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/980/204/original/88939be4dcebd5b2.jpg",
                "image_description": "",
                "embed_url": "",
                "blurhash": "U78olS}Z5*I:9qI;bcf,2[Sd,EWANEW=$jw|",
                "published_at": "2023-12-19T11:54:58.000Z"
              },
              "poll": null
            },
            {
              "id": "111606708365388182",
              "created_at": "2023-12-19T10:53:38.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": "en",
              "uri": "https://mastodon.online/users/9to5Mac/statuses/111606708223968340",
              "url": "https://mastodon.online/@9to5Mac/111606708223968340",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Apple @ Work Podcast: Generative AI and your Apple fleet <a href=\"https://9to5mac.com/2023/12/19/apple-work-podcast-generative-ai-and-your-apple-fleet/?utm_source=dlvr.it&amp;utm_medium=mastodon\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">9to5mac.com/2023/12/19/apple-w</span><span class=\"invisible\">ork-podcast-generative-ai-and-your-apple-fleet/?utm_source=dlvr.it&amp;utm_medium=mastodon</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109299914799663464",
                "username": "9to5Mac",
                "acct": "9to5Mac@mastodon.online",
                "display_name": "9to5Mac",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2022-11-04T00:00:00.000Z",
                "note": "<p>We break Apple news. Follow for the latest leaks, rumors, reviews, tips, and more</p>",
                "url": "https://mastodon.online/@9to5Mac",
                "uri": "https://mastodon.online/users/9to5Mac",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/299/914/799/663/464/original/ea608f55114edb47.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/299/914/799/663/464/original/ea608f55114edb47.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/299/914/799/663/464/original/27c362e2ad44ddd5.jpg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/299/914/799/663/464/original/27c362e2ad44ddd5.jpg",
                "followers_count": 24103,
                "following_count": 10,
                "statuses_count": 6363,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Website",
                    "value": "<a href=\"https://9to5mac.com\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">9to5mac.com</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Instagram",
                    "value": "<a href=\"https://instagram.com/9to5mac\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">instagram.com/9to5mac</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Youtube",
                    "value": "<a href=\"https://youtube.com/9to5mac\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">youtube.com/9to5mac</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Got a tip for us?",
                    "value": "tips@9to5mac.com",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606708293140007",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/708/293/140/007/original/5af2a82090d70e32.png",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/708/293/140/007/small/5af2a82090d70e32.png",
                  "remote_url": "https://files.mastodon.online/media_attachments/files/111/606/708/166/835/001/original/e4337233b50af819.png",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 628,
                      "size": "1200x628",
                      "aspect": 1.910828025477707
                    },
                    "small": {
                      "width": 663,
                      "height": 347,
                      "size": "663x347",
                      "aspect": 1.9106628242074928
                    }
                  },
                  "description": null,
                  "blurhash": "US99N7G@p{Tv$wICxBRPPWXlx]kVRjtRRjt6"
                }
              ],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": {
                "url": "https://9to5mac.com/2023/12/19/apple-work-podcast-generative-ai-and-your-apple-fleet/",
                "title": "Apple @ Work Podcast: Generative AI and your Apple fleet - 9to5Mac",
                "description": "In this episode of Apple @ Work, I talk with Alcyr Araujo from Mosyle about Generative AI, how it'll impact IT, and what's already possible today.",
                "language": "en",
                "type": "link",
                "author_name": "",
                "author_url": "",
                "provider_name": "9to5Mac",
                "provider_url": "",
                "html": "",
                "width": 1200,
                "height": 628,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/978/321/original/cc6b5c20187af24b.png",
                "image_description": "",
                "embed_url": "",
                "blurhash": "US9I-%G@p{PS$wICxBRPPDXl%MkVRjtRRjt6",
                "published_at": "2023-12-19T10:00:00.000Z"
              },
              "poll": null
            },
            {
              "id": "111606619641209421",
              "created_at": "2023-12-19T10:31:04.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": "en",
              "uri": "https://mas.to/users/alternativeto/statuses/111606619488694644",
              "url": "https://mas.to/@alternativeto/111606619488694644",
              "replies_count": 0,
              "reblogs_count": 8,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p><a href=\"https://mas.to/tags/Flipboard\" class=\"mention hashtag\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">#<span>Flipboard</span></a>, the social media magazine, plans to transition user accounts to ActivityPub, a technology used by Fediverse services. This move will expand user engagement with a wider range of content creators and increase traffic for publishers and brands.<br><a href=\"https://alternativeto.net/news/2023/12/flipboard-to-transition-user-accounts-to-activitypub-expanding-reach-to-the-fediverse/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">alternativeto.net/news/2023/12</span><span class=\"invisible\">/flipboard-to-transition-user-accounts-to-activitypub-expanding-reach-to-the-fediverse/</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109795771421793822",
                "username": "alternativeto",
                "acct": "alternativeto@mas.to",
                "display_name": "AlternativeTo",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2022-12-19T00:00:00.000Z",
                "note": "<p>🤖 AlternativeTo is the ultimate hub for discovering new and exciting software, no matter what platform you're on! Whether you're looking for apps for Windows, Mac, Linux, online services or mobile devices, we've got you covered!</p><p>🇸🇪 AlternativeTo was founded in 2009 in Sweden by Ola and Markus.</p>",
                "url": "https://mas.to/@alternativeto",
                "uri": "https://mas.to/users/alternativeto",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/795/771/421/793/822/original/038748dc21cda937.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/795/771/421/793/822/original/038748dc21cda937.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/109/795/771/421/793/822/original/2ddfdb90f6285181.webp",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/109/795/771/421/793/822/original/2ddfdb90f6285181.webp",
                "followers_count": 2602,
                "following_count": 342,
                "statuses_count": 2794,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "🌐 Website",
                    "value": "<a href=\"https://alternativeto.net\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">alternativeto.net</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "🗣️ Discord",
                    "value": "<a href=\"https://discord.gg/VS45yNS\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">discord.gg/VS45yNS</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "🐦 Twitter",
                    "value": "<a href=\"https://twitter.com/AlternativeTo/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"\">twitter.com/AlternativeTo/</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "📘 Facebook",
                    "value": "<a href=\"https://www.facebook.com/AlternativeTo/\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://www.</span><span class=\"\">facebook.com/AlternativeTo/</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606619523101186",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/619/523/101/186/original/3b3c0c43c1239738.png",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/619/523/101/186/small/3b3c0c43c1239738.png",
                  "remote_url": "https://media.mas.to/masto-public/media_attachments/files/111/606/619/359/004/919/original/786aef0f981f23f7.png",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1024,
                      "height": 627,
                      "size": "1024x627",
                      "aspect": 1.6331738437001595
                    },
                    "small": {
                      "width": 613,
                      "height": 375,
                      "size": "613x375",
                      "aspect": 1.6346666666666667
                    }
                  },
                  "description": "A white background with the Flipboard logo in the middle, the cropped Pixelfed logo on the left, and the cropped Mastodon logo on the right.",
                  "blurhash": "UgRVkSo?B;oZw]nixan$?^V}#RWaNxS$NxS$"
                }
              ],
              "mentions": [],
              "tags": [
                {
                  "name": "flipboard",
                  "url": "https://fosstodon.org/tags/flipboard"
                }
              ],
              "emojis": [],
              "card": {
                "url": "https://alternativeto.net/news/2023/12/flipboard-to-transition-user-accounts-to-activitypub-expanding-reach-to-the-fediverse/",
                "title": "Flipboard to transition user accounts to ActivityPub, expanding reach to the Fediverse",
                "description": "[Flipboard](https://alternativeto.net/software/flipboard/about/), the social media magazine and...",
                "language": "en",
                "type": "link",
                "author_name": "POX",
                "author_url": "",
                "provider_name": "AlternativeTo",
                "provider_url": "",
                "html": "",
                "width": 760,
                "height": 380,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/977/694/original/31e01f0033eef9fa.png",
                "image_description": "Flipboard to transition user accounts to ActivityPub, expanding reach to the Fediverse",
                "embed_url": "",
                "blurhash": "UbQ]KRp87hs~$Lr=%1r??^V}#SWaNHS~O?S~",
                "published_at": "2023-12-19T10:30:35.833Z"
              },
              "poll": null
            },
            {
              "id": "111606584458761666",
              "created_at": "2023-12-19T10:22:07.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "public",
              "language": null,
              "uri": "https://mastodon.social/users/Gargron/statuses/111606584274880023/activity",
              "url": null,
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "",
              "filtered": [],
              "reblog": {
                "id": "111606412415940774",
                "created_at": "2023-12-19T09:38:23.000Z",
                "in_reply_to_id": null,
                "in_reply_to_account_id": null,
                "sensitive": false,
                "spoiler_text": "",
                "visibility": "public",
                "language": "en",
                "uri": "https://ecoevo.social/users/wormerama/statuses/111606412308703133",
                "url": "https://ecoevo.social/@wormerama/111606412308703133",
                "replies_count": 3,
                "reblogs_count": 12,
                "favourites_count": 2,
                "edited_at": null,
                "favourited": false,
                "reblogged": false,
                "muted": false,
                "bookmarked": false,
                "content": "<p>Entrapment <a href=\"https://ecoevo.social/tags/cat\" class=\"mention hashtag\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">#<span>cat</span></a></p>",
                "filtered": [],
                "reblog": null,
                "account": {
                  "id": "109666406752913310",
                  "username": "wormerama",
                  "acct": "wormerama@ecoevo.social",
                  "display_name": "Kimberley",
                  "locked": false,
                  "bot": false,
                  "discoverable": false,
                  "group": false,
                  "created_at": "2023-01-10T00:00:00.000Z",
                  "note": "<p>I own and run a tiny little coffee roastery in South Yorkshire, UK. Also studying environmental science and spend the rest of my time either tending my wildlife-friendly mini food forest or thinking about plants. Amateur worm-farmer. Owned by many cats. More questions than answers, always exploring</p>",
                  "url": "https://ecoevo.social/@wormerama",
                  "uri": "https://ecoevo.social/users/wormerama",
                  "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/666/406/752/913/310/original/464afd59c58bb81a.jpeg",
                  "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/666/406/752/913/310/original/464afd59c58bb81a.jpeg",
                  "header": "https://fosstodon.org/headers/original/missing.png",
                  "header_static": "https://fosstodon.org/headers/original/missing.png",
                  "followers_count": 589,
                  "following_count": 411,
                  "statuses_count": 2182,
                  "last_status_at": "2023-12-19",
                  "emojis": [],
                  "fields": [
                    {
                      "name": "Pronouns",
                      "value": "She/her/they/them",
                      "verified_at": null
                    },
                    {
                      "name": "Personal website",
                      "value": "<a href=\"https://wormerama.co.uk\" target=\"_blank\" rel=\"nofollow noopener noreferrer\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">wormerama.co.uk</span><span class=\"invisible\"></span></a>",
                      "verified_at": "2023-12-14T18:12:51.643+00:00"
                    },
                    {
                      "name": "Business website",
                      "value": "roastinghouse.co.uk",
                      "verified_at": null
                    }
                  ]
                },
                "media_attachments": [
                  {
                    "id": "111606412336208771",
                    "type": "image",
                    "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/412/336/208/771/original/89db38db95405877.jpeg",
                    "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/412/336/208/771/small/89db38db95405877.jpeg",
                    "remote_url": "https://cdn.masto.host/ecoevosocial/media_attachments/files/111/606/407/878/631/479/original/0eb3901c19366e17.jpeg",
                    "preview_remote_url": null,
                    "text_url": null,
                    "meta": {
                      "focus": {
                        "x": -0.030878859857482184,
                        "y": 0.20991253644314867
                      },
                      "original": {
                        "width": 960,
                        "height": 1280,
                        "size": "960x1280",
                        "aspect": 0.75
                      },
                      "small": {
                        "width": 416,
                        "height": 554,
                        "size": "416x554",
                        "aspect": 0.7509025270758123
                      }
                    },
                    "description": "A black and white cat lying back along outstretched legs. The cat is showing its mostly white belly. His eyes are open, he’s definitely planning violence",
                    "blurhash": "UUIhT$xu01Ri4;-pjXofE3D*oIR*IpRjt6oe"
                  }
                ],
                "mentions": [],
                "tags": [
                  {
                    "name": "cat",
                    "url": "https://fosstodon.org/tags/cat"
                  }
                ],
                "emojis": [],
                "card": null,
                "poll": null
              },
              "account": {
                "id": "75",
                "username": "Gargron",
                "acct": "Gargron@mastodon.social",
                "display_name": "Eugen Rochko",
                "locked": false,
                "bot": false,
                "discoverable": true,
                "group": false,
                "created_at": "2016-03-16T00:00:00.000Z",
                "note": "<p>Founder of <span class=\"h-card\" translate=\"no\"><a href=\"https://mastodon.social/@Mastodon\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>Mastodon</span></a></span>. Film photography, prog metal, Dota 2.</p>",
                "url": "https://mastodon.social/@Gargron",
                "uri": "https://mastodon.social/users/Gargron",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/000/000/075/original/d6c505b333c5f0fe.png",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/000/000/075/original/d6c505b333c5f0fe.png",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/000/000/075/original/83251657277d5ccd.png",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/000/000/075/original/83251657277d5ccd.png",
                "followers_count": 341794,
                "following_count": 510,
                "statuses_count": 75663,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Patreon",
                    "value": "<a href=\"https://www.patreon.com/mastodon\" rel=\"nofollow noopener noreferrer\" translate=\"no\" target=\"_blank\"><span class=\"invisible\">https://www.</span><span class=\"\">patreon.com/mastodon</span><span class=\"invisible\"></span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "GitHub",
                    "value": "<a href=\"https://github.com/Gargron\" target=\"_blank\" rel=\"nofollow noopener noreferrer\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">github.com/Gargron</span><span class=\"invisible\"></span></a>",
                    "verified_at": "2023-12-18T14:45:07.208+00:00"
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558793059512",
              "created_at": "2023-09-29T19:33:45.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1707841111455314122",
              "url": "https://bird.makeup/users/davidrisher/statuses/1707841111455314122",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Today I drove for <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span>  during morning commute. We're seeing good y/y commute growth as people return to the office... though Friday feels a little different b/c many folks work from home and use the day to take care of personal business.</p><p>Each ride was great. I first drove a restaurant worker to his job-- he takes Lyft nearly every weekday. Another was a post dog-walk pickup for someone going to her doctor who chose us thanks to our partnership with <span class=\"h-card\"><a href=\"https://bird.makeup/users/chase\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>chase</span></a></span> Sapphire. Next was another commuter headed to her job at <span class=\"h-card\"><a href=\"https://bird.makeup/users/oldnavy\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>oldnavy</span></a></span>. Another was a pick-up at an ex-boyfriend's house (he ordered the Lyft-- nice!) Long story on that one-- we had quite a chat about relationships.</p><p>But maybe the best was when I pulled up to a rider heading to.... Lyft's HQ! She works in our data science team, focused on driver earnings. \"Wait, David!!?\" she said as she got in the car-- a complete and very surprising coincidence. We had a very fun drive 😀.</p><p>As always, I drive to learn, not to earn, so I know my experience isn't typical. (Gross earnings were about $25/hour, if you're interested.) But once again I was blown away by how enjoyable it can be to understand drivers' experience and get to know our riders better.</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606557907368067",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/907/368/067/original/dd3a4f308e9a67d5.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/907/368/067/small/dd3a4f308e9a67d5.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F7N4XqiaMAM3jMt.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UEGuq0IUbWz:5j9}yDIVk?^%vyNb00j?E2%L"
                },
                {
                  "id": "111606558081047752",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/081/047/752/original/4d8facc92cf9c527.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/081/047/752/small/4d8facc92cf9c527.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F7N4XqgaMAA_eKz.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UMG+jv0zsR#RK1$if8XmKis9MdS~D%ens;bv"
                },
                {
                  "id": "111606558221785553",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/221/785/553/original/fa080a75fa0fbc32.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/221/785/553/small/fa080a75fa0fbc32.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F7N4XqiaMAEk4P0.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UKF65.01WBIqIStRxZRO%#r=M{kWE1xuM{x]"
                },
                {
                  "id": "111606558349636905",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/349/636/905/original/1cad2c8c23be3390.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/349/636/905/small/1cad2c8c23be3390.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F7N4XqiaMAIRwT5.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UIG+UI0zQ-EME1%gwbRjp_rqtR-Vj=xaD%R*"
                }
              ],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "109916006145230891",
                  "username": "chase",
                  "url": "https://bird.makeup/users/chase",
                  "acct": "chase@bird.makeup"
                },
                {
                  "id": "111606558640247633",
                  "username": "oldnavy",
                  "url": "https://bird.makeup/users/oldnavy",
                  "acct": "oldnavy@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558651509627",
              "created_at": "2023-04-04T17:25:53.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1643303892288159744",
              "url": "https://bird.makeup/users/davidrisher/statuses/1643303892288159744",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Hi! After a few days of being locked out of my account, I'm back. Two notes:</p><p>*Thrilled to be taking the wheel <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span>. I've heard from many happy &amp; some unhappy riders &amp; drivers. Am listening to both!</p><p>* <span class=\"h-card\"><a href=\"https://bird.makeup/users/worldreaders\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>worldreaders</span></a></span> is in great hands w/ <span class=\"h-card\"><a href=\"https://bird.makeup/users/rebeccaleege\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>rebeccaleege</span></a></span>. Excited to be Board Chair!</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606557554837913",
                  "type": "video",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/554/837/913/original/18f76eab19188752.mp4",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/554/837/913/small/18f76eab19188752.png",
                  "remote_url": "https://video.twimg.com/ext_tw_video/1643302897629921280/pu/vid/1280x720/hMk0HDUSkJK2e5SM.mp4?tag=12",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1280,
                      "height": 720,
                      "frame_rate": "60/1",
                      "duration": 63.505125,
                      "bitrate": 773737
                    },
                    "small": {
                      "width": 640,
                      "height": 360,
                      "size": "640x360",
                      "aspect": 1.7777777777777777
                    }
                  },
                  "description": null,
                  "blurhash": "UJHC1OD#NfE1I7ackEWB-=x]soaK9FMyjYRn"
                }
              ],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "111606557084814836",
                  "username": "worldreaders",
                  "url": "https://bird.makeup/users/worldreaders",
                  "acct": "worldreaders@bird.makeup"
                },
                {
                  "id": "111606558575746865",
                  "username": "rebeccaleege",
                  "url": "https://bird.makeup/users/rebeccaleege",
                  "acct": "rebeccaleege@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558530155725",
              "created_at": "2023-11-12T20:28:25.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1723799932786843958",
              "url": "https://bird.makeup/users/davidrisher/statuses/1723799932786843958",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Sunday morning is my favorite time of the week to drive for <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span> . Traffic is light, people are pretty chill, often in full brunch- or tourism mode.</p><p>Today's riders included a family from Alberta visiting their daughter, headed to Alcatraz and all suited up! Then a rider who loves our partnership with Chase Sapphire Preferred-- 10x points when you ride with us. And a guy who \"wasn't looking my best\": He'd been at some kind of all-night birthday bash and was making his way home.</p><p>Last ride was with a Lyft-loyalist who has never taken Ub*r. His words: \"Lyft has always been a nicer company.\" He's right!</p><p>As always, I drive to learn, not to earn. But today was extra-fun: SF is sparkling and folks are excited ahead of the <span class=\"h-card\"><a href=\"https://bird.makeup/users/apec\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>apec</span></a></span> conference. Should be a great week.</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606558088466704",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/088/466/704/original/039f8a570f10f537.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/088/466/704/small/039f8a570f10f537.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F-wqWyYbMAA9MhD.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UGEW8uGu$cDh~Ts+V[bc5P={R*%L9aWYIVs+"
                },
                {
                  "id": "111606558186489191",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/186/489/191/original/131c4c41fbb730b7.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/186/489/191/small/131c4c41fbb730b7.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F-wqWyTbgAAMOqW.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UAEo#,K*}S0#-N9bq[NGPV=wT0=|9[$*Ntsl"
                },
                {
                  "id": "111606558303504976",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/303/504/976/original/7d0d6705d567013b.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/303/504/976/small/7d0d6705d567013b.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F-wqWyTaIAAcLd9.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UEEfNQJ9=zJp~UoMRPx]2GrpIov#4:s.kWRO"
                },
                {
                  "id": "111606558415277170",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/415/277/170/original/b08a3dd2ee5a4fa2.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/415/277/170/small/b08a3dd2ee5a4fa2.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F-wqWyXa8AA8eb6.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UED0M=E*,,TK,*Rjxvoy10,BTJxaAInOITRj"
                }
              ],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "110391429300362731",
                  "username": "apec",
                  "url": "https://bird.makeup/users/apec",
                  "acct": "apec@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558171221828",
              "created_at": "2023-10-02T05:39:54.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1708718426779472057",
              "url": "https://bird.makeup/users/davidrisher/statuses/1708718426779472057",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Here’s what all riders and drivers in Austin will be seeing soon.  Several good tips have come in already thx to the <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span> community.</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606558054994709",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/054/994/709/original/2ee21585bb69be90.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/558/054/994/709/small/2ee21585bb69be90.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F7aWWnOa8AA4BAB.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 554,
                      "height": 1200,
                      "size": "554x1200",
                      "aspect": 0.46166666666666667
                    },
                    "small": {
                      "width": 326,
                      "height": 706,
                      "size": "326x706",
                      "aspect": 0.46175637393767704
                    }
                  },
                  "description": null,
                  "blurhash": "UWLN=IxaxuWF00V|R*oc_3t7jsV[D$V[t7k9"
                }
              ],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558085376004",
              "created_at": "2023-11-02T17:16:32.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1720127766509813832",
              "url": "https://bird.makeup/users/davidrisher/statuses/1720127766509813832",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Really excited to launch <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span>'s Women+Connect feature in 50 more cities, allowing women and nonbinary drivers and riders to request rides together. </p><p>Chicago Lyft driver Gabriella says it all: \"Since it launched, I’ve been telling every single one of my riders (even including men!) about Women+ Connect, and they’re all so excited about it.” </p><p>See if it's in your city here:</p><p><a href=\"https://t.co/LUXEEVTsYl\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">t.co/LUXEEVTsYl</span><span class=\"invisible\"></span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": {
                "url": "https://www.lyft.com/blog/posts/women+expands",
                "title": "Women+ Connect Feature Launches in More Cities",
                "description": "Prioritized matches between women and nonbinary drivers and riders now available in more than 50 additional cities.",
                "language": "en",
                "type": "link",
                "author_name": "",
                "author_url": "",
                "provider_name": "",
                "provider_url": "",
                "html": "",
                "width": 1200,
                "height": 480,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/977/224/original/ce1d6cd3ce553acb.jpeg",
                "image_description": "",
                "embed_url": "",
                "blurhash": "UQFgk81v4:kU9boy-or]g1V[WCoyjYa#Rkj?",
                "published_at": null
              },
              "poll": null
            },
            {
              "id": "111606558085081680",
              "created_at": "2023-10-03T01:59:47.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1709025420342087802",
              "url": "https://bird.makeup/users/davidrisher/statuses/1709025420342087802",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Very sorry this happened to you <span class=\"h-card\"><a href=\"https://bird.makeup/users/palashp40616755\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>palashp40616755</span></a></span>. And very glad to see you happily reunited! Hope <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span> can remain a part of your life.</p><p><a href=\"https://bird.makeup/@palashp40616755/1708940161310986695\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">bird.makeup/@palashp40616755/1</span><span class=\"invisible\">708940161310986695</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "111161051929093119",
                  "username": "palashp40616755",
                  "url": "https://bird.makeup/users/palashp40616755",
                  "acct": "palashp40616755@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": {
                "url": "https://bird.makeup/@palashp40616755/1708940161310986695",
                "title": "palash pandey",
                "description": "Just got back from the vet. Tux has clean bill of health. I'm quite sure she thinks she was just playing the game stray in VR 😂 Thank you everyone for helping.\nYou guys have restored my faith in the community.",
                "language": "en",
                "type": "link",
                "author_name": "",
                "author_url": "",
                "provider_name": "",
                "provider_url": "",
                "html": "",
                "width": 400,
                "height": 400,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/977/217/original/c7e76fd16b7cc85c.jpg",
                "image_description": "",
                "embed_url": "",
                "blurhash": "UHFE_xE1E{R*~VM{xvWB5SWB-AofW-fkxaof",
                "published_at": null
              },
              "poll": null
            },
            {
              "id": "111606558070752851",
              "created_at": "2023-10-02T14:19:49.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1708849270290538719",
              "url": "https://bird.makeup/users/davidrisher/statuses/1708849270290538719",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Very good news. Thanks to all who pitched in.</p><p><a href=\"https://bird.makeup/@lyft/1708825356910645591\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">bird.makeup/@lyft/170882535691</span><span class=\"invisible\">0645591</span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": {
                "url": "https://bird.makeup/@lyft/1708825356910645591",
                "title": "Lyft",
                "description": "Tux has been found! We’re focused on making sure Tux has everything she needs right now. \n\nWe are actively working with all involved to fully understand the situation. We must do better in how we support our community. And, we will.\n\nhttps://bird.makeup/@palashp40616755/1708742541401526442",
                "language": "en",
                "type": "link",
                "author_name": "",
                "author_url": "",
                "provider_name": "",
                "provider_url": "",
                "html": "",
                "width": 200,
                "height": 200,
                "image": "https://cdn.fosstodon.org/cache/preview_cards/images/026/977/220/original/197c5f1ffad84013.png",
                "image_description": "",
                "embed_url": "",
                "blurhash": "UoTNexoid[nmoPe:f*g2dGf8gffinmg2eoeV",
                "published_at": null
              },
              "poll": null
            },
            {
              "id": "111606558067884364",
              "created_at": "2023-08-08T20:27:50.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1689010553262575622",
              "url": "https://bird.makeup/users/davidrisher/statuses/1689010553262575622",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Behind the scenes getting ready for <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span>'s Q2 earnings call. Fully caffeinated thanks for <span class=\"h-card\"><a href=\"https://bird.makeup/users/starbucks\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>starbucks</span></a></span>.</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606557838573086",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/838/573/086/original/a628508246185355.png",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/838/573/086/small/a628508246185355.png",
                  "remote_url": "https://pbs.twimg.com/media/F3CR0ndboAAfhuy.png",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 540,
                      "height": 720,
                      "size": "540x720",
                      "aspect": 0.75
                    },
                    "small": {
                      "width": 416,
                      "height": 554,
                      "size": "416x554",
                      "aspect": 0.7509025270758123
                    }
                  },
                  "description": null,
                  "blurhash": "UBFFNn?cx^.8?^9}kqNKs~MyM|%0rVD$n4of"
                }
              ],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "110039019130333518",
                  "username": "starbucks",
                  "url": "https://bird.makeup/users/starbucks",
                  "acct": "starbucks@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558025034061",
              "created_at": "2023-12-18T23:41:45.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/id_aa_carmack/statuses/1736894549916577838",
              "url": "https://bird.makeup/users/id_aa_carmack/statuses/1736894549916577838",
              "replies_count": 1,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>My feeling is that today’s tech titans are proportionately less litigious than most prior industries; anyone have hard data references?</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "109984631082400725",
                "username": "id_aa_carmack",
                "acct": "id_aa_carmack@bird.makeup",
                "display_name": "John Carmack",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-03-07T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/id_aa_carmack",
                "uri": "https://bird.makeup/users/id_aa_carmack",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/109/984/631/082/400/725/original/5eaea4a221f881a3.jpg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/109/984/631/082/400/725/original/5eaea4a221f881a3.jpg",
                "header": "https://fosstodon.org/headers/original/missing.png",
                "header_static": "https://fosstodon.org/headers/original/missing.png",
                "followers_count": 6,
                "following_count": 0,
                "statuses_count": 518,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "Dallas, TX",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/id_aa_carmack\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/id_aa_carmack</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558022946263",
              "created_at": "2023-06-25T14:04:37.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1672969044671205378",
              "url": "https://bird.makeup/users/davidrisher/statuses/1672969044671205378",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Always the right answer, <span class=\"h-card\"><a href=\"https://bird.makeup/users/joelfagliano\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>joelfagliano</span></a></span>. Thanks! </p><p><span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span> <span class=\"h-card\"><a href=\"https://bird.makeup/users/nytimes\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>nytimes</span></a></span></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606557688812275",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/688/812/275/original/c465885fff4edfe7.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/688/812/275/small/c465885fff4edfe7.jpg",
                  "remote_url": "https://pbs.twimg.com/media/FzeUeplaUAAgTt-.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 554,
                      "height": 1200,
                      "size": "554x1200",
                      "aspect": 0.46166666666666667
                    },
                    "small": {
                      "width": 326,
                      "height": 706,
                      "size": "326x706",
                      "aspect": 0.46175637393767704
                    }
                  },
                  "description": null,
                  "blurhash": "UGQJs0W94USR~UE1IURi^+E1%MelOt-;%3tS"
                }
              ],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "109684947655019163",
                  "username": "nytimes",
                  "url": "https://bird.makeup/users/nytimes",
                  "acct": "nytimes@bird.makeup"
                },
                {
                  "id": "111606557869037192",
                  "username": "joelfagliano",
                  "url": "https://bird.makeup/users/joelfagliano",
                  "acct": "joelfagliano@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606558013460312",
              "created_at": "2023-10-02T05:01:31.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1708708770518544867",
              "url": "https://bird.makeup/users/davidrisher/statuses/1708708770518544867",
              "replies_count": 1,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Many have asked about <span class=\"h-card\"><a href=\"https://bird.makeup/users/palashp40616755\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>palashp40616755</span></a></span>’s cat Tux. We’ve now alerted <span class=\"h-card\"><a href=\"https://bird.makeup/users/lyft\" class=\"u-url mention\" rel=\"nofollow noopener noreferrer\" target=\"_blank\">@<span>lyft</span></a></span> drivers and riders in Austin to be on the lookout for her. </p><p>One request: please don’t vilify the driver. He’s received unwarranted threats and is just as distraught as we all are. </p><p>More info here about this: <a href=\"https://t.co/aUEMAVOMzE\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">t.co/aUEMAVOMzE</span><span class=\"invisible\"></span></a></p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [],
              "mentions": [
                {
                  "id": "109787655201925501",
                  "username": "lyft",
                  "url": "https://bird.makeup/users/lyft",
                  "acct": "lyft@bird.makeup"
                },
                {
                  "id": "111161051929093119",
                  "username": "palashp40616755",
                  "url": "https://bird.makeup/users/palashp40616755",
                  "acct": "palashp40616755@bird.makeup"
                }
              ],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            },
            {
              "id": "111606557973113005",
              "created_at": "2023-07-25T05:22:01.000Z",
              "in_reply_to_id": null,
              "in_reply_to_account_id": null,
              "sensitive": false,
              "spoiler_text": "",
              "visibility": "unlisted",
              "language": null,
              "uri": "https://bird.makeup/users/davidrisher/statuses/1683709163694882816",
              "url": "https://bird.makeup/users/davidrisher/statuses/1683709163694882816",
              "replies_count": 0,
              "reblogs_count": 0,
              "favourites_count": 0,
              "edited_at": null,
              "favourited": false,
              "reblogged": false,
              "muted": false,
              "bookmarked": false,
              "content": "<p>Whoever made this ad buy, please DM me. You’re hired.</p>",
              "filtered": [],
              "reblog": null,
              "account": {
                "id": "111606368192029473",
                "username": "davidrisher",
                "acct": "davidrisher@bird.makeup",
                "display_name": "David Risher",
                "locked": false,
                "bot": true,
                "discoverable": true,
                "group": false,
                "created_at": "2023-12-19T00:00:00.000Z",
                "note": "This account is a replica from Twitter. Its author can't see your replies. If you find this service useful, please consider supporting us via our Patreon. <br>",
                "url": "https://bird.makeup/users/davidrisher",
                "uri": "https://bird.makeup/users/davidrisher",
                "avatar": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "avatar_static": "https://cdn.fosstodon.org/cache/accounts/avatars/111/606/368/192/029/473/original/b980511e8b624f59.jpeg",
                "header": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "header_static": "https://cdn.fosstodon.org/cache/accounts/headers/111/606/368/192/029/473/original/670bbdda4b532e58.jpeg",
                "followers_count": 1,
                "following_count": 0,
                "statuses_count": 104,
                "last_status_at": "2023-12-19",
                "emojis": [],
                "fields": [
                  {
                    "name": "Location",
                    "value": "San Francisco, CA",
                    "verified_at": null
                  },
                  {
                    "name": "Official",
                    "value": "<a href=\"https://twitter.com/davidrisher\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">twitter.com/davidrisher</span></a>",
                    "verified_at": null
                  },
                  {
                    "name": "Support this service",
                    "value": "<a href=\"https://www.patreon.com/birddotmakeup\" rel=\"nofollow noopener noreferrer\" target=\"_blank\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">www.patreon.com/birddotmakeup</span></a>",
                    "verified_at": null
                  }
                ]
              },
              "media_attachments": [
                {
                  "id": "111606557812613084",
                  "type": "image",
                  "url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/812/613/084/original/fd793aeabbadb214.jpg",
                  "preview_url": "https://cdn.fosstodon.org/cache/media_attachments/files/111/606/557/812/613/084/small/fd793aeabbadb214.jpg",
                  "remote_url": "https://pbs.twimg.com/media/F128jspaEAEoWqj.jpg",
                  "preview_remote_url": null,
                  "text_url": null,
                  "meta": {
                    "original": {
                      "width": 1200,
                      "height": 900,
                      "size": "1200x900",
                      "aspect": 1.3333333333333333
                    },
                    "small": {
                      "width": 554,
                      "height": 416,
                      "size": "554x416",
                      "aspect": 1.3317307692307692
                    }
                  },
                  "description": null,
                  "blurhash": "UNHxZW%LIXNK9+XA$wt64_RnWZoL~KRPI[bc"
                }
              ],
              "mentions": [],
              "tags": [],
              "emojis": [],
              "card": null,
              "poll": null
            }
          ]
        let value = results;
        if (value?.length) {
          if (firstLoad) {
            setMembers(value);
          }
        //   setShowMore(!done);
        } 
        // else {
        //   setShowMore(false);
        // }
        setUIState('default');
      } catch (e) {
        setUIState('error');
      }
    })();
  }

  useEffect(() => {
    fetchMembers(true);
  }, []);

  return (
    <div class="sheet" id="list-manage-members-container">
      {!!onClose && (
        <button type="button" class="sheet-close" onClick={onClose}>
          <Icon icon="x" />
        </button>
      )}
      <header>
        <h2>Tech</h2>
      </header>
      <main>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              <AccountBlock account={member.account} instance={instance} />
              <RemoveAddButton account={member.account} listID={listID} />
            </li>
          ))}
          {showMore && uiState === 'default' && (
            <InView as="li" onChange={(inView) => inView && fetchMembers()}>
              <button type="button" class="light block" onClick={fetchMembers}>
                Show more&hellip;
              </button>
            </InView>
          )}
        </ul>
      </main>
    </div>
  );
}

function RemoveAddButton({ account, listID }) {
  const { masto } = api();
  const [uiState, setUIState] = useState('default');
  const [removed, setRemoved] = useState(false);

  return (
    <MenuConfirm
      confirm={!removed}
      confirmLabel={<span>Remove @{account.username} from list?</span>}
      align="end"
      menuItemClassName="danger"
      onClick={() => {
        if (removed) {
          setUIState('loading');
          (async () => {
            try {
              await masto.v1.lists.$select(listID).accounts.create({
                accountIds: [account.id],
              });
              setUIState('default');
              setRemoved(false);
            } catch (e) {
              setUIState('error');
            }
          })();
        } else {
          // const yes = confirm(`Remove ${account.username} from this list?`);
          // if (!yes) return;
          setUIState('loading');

          (async () => {
            try {
              await masto.v1.lists.$select(listID).accounts.remove({
                accountIds: [account.id],
              });
              setUIState('default');
              setRemoved(true);
            } catch (e) {
              setUIState('error');
            }
          })();
        }
      }}
    >
      <button
        type="button"
        class={`light ${removed ? '' : 'danger'}`}
        disabled={uiState === 'loading'}
      >
        {removed ? 'Add' : 'Remove…'}
      </button>
    </MenuConfirm>
  );
}

export default SuggestedFollows;
