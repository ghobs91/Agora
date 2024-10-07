import './trending.css';

import { MenuItem } from '@szhsin/react-menu';
import { getBlurHashAverageColor } from 'fast-blurhash';
import { useMemo, useRef, useState } from 'preact/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnapshot } from 'valtio';

import Icon from '../components/icon';
import Link from '../components/link';
import Menu2 from '../components/menu2';
import RelativeTime from '../components/relative-time';
import Timeline from '../components/timeline';
import { api } from '../utils/api';
import { filteredItems } from '../utils/filters';
import pmem from '../utils/pmem';
import states from '../utils/states';
import { saveStatus } from '../utils/states';
import useTitle from '../utils/useTitle';
import { NotificationsLink } from './home';
import { BskyAgent } from '@atproto/api';
import { isNostrAccount } from '../utils/protocol-translator';

const LIMIT = 20;

const fetchLinks = pmem(
  (masto) => masto.v1.trends.links.list().next(),
  {
    maxAge: 10 * 60 * 1000, // 10 minutes
  },
);

async function blueSkyPopularFeedFetch() {
  try {
    const agent = new BskyAgent({ service: 'https://bsky.social' });
    const login = await agent.login({
      identifier: 'ghobstest.bsky.social',
      password: 'M&c)mgv~%sUBW85',
    });
    const token = login.data.accessJwt;
    
    const response = await fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed?feed=at://did:plc:xfqcsi7wuwedeqaa5m7aih44/app.bsky.feed.generator/aaahonshw52xy', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { feed } = await response.json();

    return feed.map((item) => ({
      id: item.post.cid,
      createdAt: item.post.record.createdAt,
      uri: item.post.uri,
      url: `https://example.com/post/${item.post.cid}`,
      content: item.post.record.text,
      reblogsCount: item.post.repostCount,
      favouritesCount: item.post.likeCount,
      account: {
        id: item.post.author.did,
        username: item.post.author.handle,
        displayName: item.post.author.displayName,
        avatar: item.post.author.avatar,
        url: `https://bsky.app/profile/${item.post.author.handle}`,
      },
      mediaAttachments: item.post.embed?.images?.map((image) => ({
        type: "image",
        url: image.fullsize,
        description: image.alt,
        meta: {
          original: { width: image.aspectRatio.width, height: image.aspectRatio.height, size: image.size }
        }
      })) || [],
    }));
  } catch (error) {
    console.error('BlueSky Feed Fetch Error:', error);
    return [];
  }
}

function Trending({ columnMode, ...props }) {
  const snapStates = useSnapshot(states);
  const params = columnMode ? {} : useParams();
  const [uiState, setUIState] = useState('default');
  const myCurrentInstance = api().instance;
  const { masto, instance } = api({ instance: params.instance || props.instance });
  const title = 'Trending';
  useTitle(title, `/:myCurrentInstance?/trending`);

  const latestItem = useRef();
  const [hashtags, setHashtags] = useState([]);
  const [links, setLinks] = useState([]);
  const trendIterator = useRef();

  async function fetchTrend(firstLoad) {
    if (firstLoad || !trendIterator.current) {
      const blueSkyFeed = await blueSkyPopularFeedFetch();
      trendIterator.current = masto.v1.trends.statuses.list({ limit: LIMIT });

      try {
        const { value: tags } = await masto.v1.trends.tags.list().next();
        setHashtags(tags || []);
      } catch (error) {
        console.error('Hashtag Fetch Error:', error);
      }

      try {
        const { value } = await fetchLinks(masto);
        setLinks(value?.filter?.((link) => link.type === 'link') || []);
      } catch (error) {
        console.error('Link Fetch Error:', error);
      }
    }

    const results = await trendIterator.current.next();
    const nostrTrending = await fetch('https://api.nostr.band/v0/trending/notes').then(res => res.json());
    const mastodonResults = filteredItems(results.value, 'public');

    mastodonResults.forEach((item) => saveStatus(item, instance));
    return { ...results, value: mastodonResults };
  }

  async function checkForUpdates() {
    try {
      const { value } = await masto.v1.trends.statuses.list({ limit: 1 }).next();
      return value?.[0]?.id !== latestItem.current;
    } catch (error) {
      return false;
    }
  }

  const TimelineStart = useMemo(() => (
    <>
      {hashtags.length > 0 && (
        <div class="filter-bar">
          <Icon icon="chart" class="insignificant" size="l" />
          {hashtags.map((tag) => (
            <Link to={`/${instance}/t/${tag.name}`} key={tag.name}>
              <span><span class="more-insignificant">#</span>{tag.name}</span>
              <span class="filter-count">{tag.history.reduce((acc, cur) => acc + +cur.uses, 0).toLocaleString()}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  ), [hashtags]);

  return (
    <Timeline
      key={instance}
      title={title}
      id="trending"
      instance={instance}
      emptyText="No trending posts."
      errorText="Unable to load posts"
      fetchItems={fetchTrend}
      checkForUpdates={checkForUpdates}
      checkForUpdatesInterval={5 * 60 * 1000} // 5 minutes
      useItemID
      timelineStart={TimelineStart}
      boostsCarousel={snapStates.settings.boostsCarousel}
      allowFilters
      headerEnd={<NotificationsLink />}
    />
  );
}

export default Trending;
