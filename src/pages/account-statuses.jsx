import { MenuItem } from '@szhsin/react-menu';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSnapshot } from 'valtio';

import AccountInfo from '../components/account-info';
import EmojiText from '../components/emoji-text';
import Icon from '../components/icon';
import Link from '../components/link';
import Menu2 from '../components/menu2';
import Timeline from '../components/timeline';
import { api } from '../utils/api';
import pmem from '../utils/pmem';
import showToast from '../utils/show-toast';
import states from '../utils/states';
import { saveStatus } from '../utils/states';
import useTitle from '../utils/useTitle';

const LIMIT = 20;
const MIN_YEAR = 1983;
const MIN_YEAR_MONTH = `${MIN_YEAR}-01`; // Birth of the Internet

const supportsInputMonth = (() => {
  try {
    const input = document.createElement('input');
    input.setAttribute('type', 'month');
    return input.type === 'month';
  } catch (e) {
    return false;
  }
})();

async function _isSearchEnabled(instance) {
  const { masto } = api({ instance });
  const results = await masto.v2.search.fetch({
    q: 'from:me',
    type: 'statuses',
    limit: 1,
  });
  return !!results?.statuses?.length;
}
const isSearchEnabled = pmem(_isSearchEnabled);

function AccountStatuses() {
  const snapStates = useSnapshot(states);
  const { id, ...params } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month');
  const excludeReplies = !searchParams.get('replies');
  const excludeBoosts = !!searchParams.get('boosts');
  const tagged = searchParams.get('tagged');
  const media = !!searchParams.get('media');
  const { masto, instance, authenticated } = api({ instance: params.instance });
  const accountStatusesIterator = useRef();

  const allSearchParams = [month, excludeReplies, excludeBoosts, tagged, media];
  const [account, setAccount] = useState();
  const searchOffsetRef = useRef(0);
  useEffect(() => {
    searchOffsetRef.current = 0;
  }, allSearchParams);

  const sameCurrentInstance = useMemo(
    () => instance === api().instance,
    [instance],
  );
  const [searchEnabled, setSearchEnabled] = useState(false);
  const canAutoSwitchToUsersInstance = () => {
    return account.acct && account?.acct != 'bird.makeup' && account?.acct != 'threads.net';
  }
  useEffect(() => {
    // Only enable for current logged-in instance
    // Most remote instances don't allow unauthenticated searches

    if (!sameCurrentInstance) return;
    if (!account?.acct) return;
    if (canAutoSwitchToUsersInstance()) {
      (async () => {
        try {
          const { masto } = api({
            instance: accountInstance,
          });
          const acc = await masto.v1.accounts.lookup({
            acct: account.acct,
          });
          const { id } = acc;
          location.hash = `/${accountInstance}/a/${id}`;
        } catch (e) {
          console.error(e);
          alert('Unable to fetch account info');
        }
      })();
    }

    (async () => {
      const enabled = await isSearchEnabled(instance);
      console.log({ enabled });
      setSearchEnabled(enabled);
    })();
  }, [instance, sameCurrentInstance, account?.acct]);

  async function fetchAccountStatuses(firstLoad) {
    const isValidMonth = /^\d{4}-[01]\d$/.test(month);
    const isValidYear = month?.split?.('-')?.[0] >= MIN_YEAR;
    if (isValidMonth && isValidYear) {
      if (!account) {
        return {
          value: [],
          done: true,
        };
      }
      const [_year, _month] = month.split('-');
      const monthIndex = parseInt(_month, 10) - 1;
      // YYYY-MM (no day)
      // Search options:
      // - from:account
      // - after:YYYY-MM-DD (non-inclusive)
      // - before:YYYY-MM-DD (non-inclusive)

      // Last day of previous month
      const after = new Date(_year, monthIndex, 0);
      const afterStr = `${after.getFullYear()}-${(after.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${after.getDate().toString().padStart(2, '0')}`;
      // First day of next month
      const before = new Date(_year, monthIndex + 1, 1);
      const beforeStr = `${before.getFullYear()}-${(before.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${before.getDate().toString().padStart(2, '0')}`;
      console.log({
        month,
        _year,
        _month,
        monthIndex,
        after,
        before,
        afterStr,
        beforeStr,
      });

      let limit;
      if (firstLoad) {
        limit = LIMIT + 1;
        searchOffsetRef.current = 0;
      } else {
        limit = LIMIT + searchOffsetRef.current + 1;
        searchOffsetRef.current += LIMIT;
      }

      const searchResults = await masto.v2.search.fetch({
        q: `from:${account.acct} after:${afterStr} before:${beforeStr}`,
        type: 'statuses',
        limit,
        offset: searchOffsetRef.current,
      });
      if (searchResults?.statuses?.length) {
        const value = searchResults.statuses.slice(0, LIMIT);
        value.forEach((item) => {
          saveStatus(item, instance);
        });
        const done = searchResults.statuses.length <= LIMIT;
        return { value, done };
      } else {
        return { value: [], done: true };
      }
    }

    const results = [];
    if (firstLoad) {
      const { value: pinnedStatuses } = await masto.v1.accounts
        .$select(id)
        .statuses.list({
          pinned: true,
        })
        .next();
      if (pinnedStatuses?.length && !tagged && !media) {
        pinnedStatuses.forEach((status) => {
          status._pinned = true;
          saveStatus(status, instance);
        });
        if (pinnedStatuses.length >= 3) {
          const pinnedStatusesIds = pinnedStatuses.map((status) => status.id);
          results.push({
            id: pinnedStatusesIds,
            items: pinnedStatuses,
            type: 'pinned',
          });
        } else {
          results.push(...pinnedStatuses);
        }
      }
    }
    if (firstLoad || !accountStatusesIterator.current) {
      accountStatusesIterator.current = masto.v1.accounts
        .$select(id)
        .statuses.list({
          limit: LIMIT,
          exclude_replies: excludeReplies,
          exclude_reblogs: excludeBoosts,
          only_media: media,
          tagged,
        });
    }
    const { value, done } = await accountStatusesIterator.current.next();
    if (value?.length) {
      value.forEach((post) => {
        if (!post.reblog) {
          results.push(post);
          saveStatus(post, instance);
        } else {
          if (!post.reblog.inReplyToAccountId && !post.reblog.inReplyToId) {
            results.push(post);
            saveStatus(post, instance);
          }
        }
      });
      // results.push(...value);

      // value.forEach((item) => {
      //   if (!item.reblog.inReplyToAccountId && !item.reblog.inReplyToId) {
      //     saveStatus(item, instance);
      //   }
      // });
    }
    return {
      value: results,
      done,
    };
  }

  const [featuredTags, setFeaturedTags] = useState([]);
  useTitle(
    `${account?.displayName ? account.displayName + ' ' : ''}@${
      account?.acct ? account.acct : 'Account posts'
    }`,
    '/:instance?/a/:id',
  );
  useEffect(() => {
    (async () => {
      try {
        const acc = await masto.v1.accounts.$select(id).fetch();
        console.log(acc);
        setAccount(acc);
      } catch (e) {
        console.error(e);
      }
      // try {
      //   const featuredTags = await masto.v1.accounts
      //     .$select(id)
      //     .featuredTags.list();
      //   console.log({ featuredTags });
      //   setFeaturedTags(featuredTags);
      // } catch (e) {
      //   console.error(e);
      // }
    })();
  }, [id]);

  const { displayName, acct, emojis } = account || {};

  const filterBarRef = useRef();
  const TimelineStart = useMemo(() => {
    const cachedAccount = snapStates.accounts[`${id}@${instance}`];
    const filtered =
      !excludeReplies || excludeBoosts || tagged || media || !!month;
    return (
      <>
        <AccountInfo
          instance={instance}
          account={cachedAccount || id}
          fetchAccount={() => masto.v1.accounts.$select(id).fetch()}
          authenticated={authenticated}
          standalone
        />
        <div class="filter-bar" ref={filterBarRef}>
          {filtered ? (
            <Link
              to={`/${instance}/a/${id}`}
              class="insignificant filter-clear"
              title="Clear filters"
              key="clear-filters"
            >
              <Icon icon="x" size="l" />
            </Link>
          ) : (
            <Icon icon="filter" class="insignificant" size="l" />
          )}
          <Link
            to={`/${instance}/a/${id}${excludeReplies ? '?replies=1' : ''}`}
            onClick={() => {
              if (excludeReplies) {
                showToast('Showing post with replies');
              }
            }}
            class={excludeReplies ? '' : 'is-active'}
          >
            + Replies
          </Link>
          <Link
            to={`/${instance}/a/${id}${excludeBoosts ? '' : '?boosts=0'}`}
            onClick={() => {
              if (!excludeBoosts) {
                showToast('Showing posts without boosts');
              }
            }}
            class={!excludeBoosts ? '' : 'is-active'}
          >
            - Boosts
          </Link>
          <Link
            to={`/${instance}/a/${id}${media ? '' : '?media=1'}`}
            onClick={() => {
              if (!media) {
                showToast('Showing posts with media');
              }
            }}
            class={media ? 'is-active' : ''}
          >
            Media
          </Link>
          {featuredTags.map((tag) => (
            <Link
              key={tag.id}
              to={`/${instance}/a/${id}${
                tagged === tag.name
                  ? ''
                  : `?tagged=${encodeURIComponent(tag.name)}`
              }`}
              onClick={() => {
                if (tagged !== tag.name) {
                  showToast(`Showing posts tagged with #${tag.name}`);
                }
              }}
              class={tagged === tag.name ? 'is-active' : ''}
            >
              <span>
                <span class="more-insignificant">#</span>
                {tag.name}
              </span>
              {
                // The count differs based on instance 😅
              }
              {/* <span class="filter-count">{tag.statusesCount}</span> */}
            </Link>
          ))}
          {searchEnabled &&
            (supportsInputMonth ? (
              <label class={`filter-field ${month ? 'is-active' : ''}`}>
                <Icon icon="month" size="l" />
                <input
                  type="month"
                  disabled={!account?.acct}
                  value={month || ''}
                  min={MIN_YEAR_MONTH}
                  max={new Date().toISOString().slice(0, 7)}
                  onInput={(e) => {
                    const { value, validity } = e.currentTarget;
                    if (!validity.valid) return;
                    setSearchParams(
                      value
                        ? {
                            month: value,
                          }
                        : {},
                    );
                  }}
                />
              </label>
            ) : (
              // Fallback to <select> for month and <input type="number"> for year
              <MonthPicker
                class={`filter-field ${month ? 'is-active' : ''}`}
                disabled={!account?.acct}
                value={month || ''}
                min={MIN_YEAR_MONTH}
                max={new Date().toISOString().slice(0, 7)}
                onInput={(e) => {
                  const { value, validity } = e;
                  if (!validity.valid) return;
                  setSearchParams(
                    value
                      ? {
                          month: value,
                        }
                      : {},
                  );
                }}
              />
            ))}
        </div>
      </>
    );
  }, [
    id,
    instance,
    authenticated,
    featuredTags,
    searchEnabled,
    ...allSearchParams,
  ]);

  useEffect(() => {
    // Focus on .is-active
    const active = filterBarRef.current?.querySelector('.is-active');
    if (active) {
      console.log('active', active, active.offsetLeft);
      filterBarRef.current.scrollTo({
        behavior: 'smooth',
        left:
          active.offsetLeft -
          (filterBarRef.current.offsetWidth - active.offsetWidth) / 2,
      });
    }
  }, [featuredTags, searchEnabled, ...allSearchParams]);

  const accountInstance = useMemo(() => {
    if (!account?.url) return null;
    const domain = new URL(account.url).hostname;
    return domain;
  }, [account]);
  const sameInstance = instance === accountInstance;
  const allowSwitch = !!account && !sameInstance;

  return (
    <Timeline
      key={id}
      title={`${account?.acct ? '@' + account.acct : 'Posts'}`}
      titleComponent={
        <h1
          class="header-account"
          // onClick={() => {
          //   states.showAccount = {
          //     account,
          //     instance,
          //   };
          // }}
        >
          <b>
            <EmojiText text={displayName} emojis={emojis} />
          </b>
          <div>
            <span>@{acct}</span>
          </div>
        </h1>
      }
      id="account-statuses"
      instance={instance}
      emptyText="Nothing to see here yet."
      errorText="Unable to load posts"
      fetchItems={fetchAccountStatuses}
      useItemID
      boostsCarousel={snapStates.settings.boostsCarousel}
      timelineStart={TimelineStart}
      refresh={[
        excludeReplies,
        excludeBoosts,
        tagged,
        media,
        month + account?.acct,
      ].toString()}
      headerEnd={
        <Menu2
          portal
          // setDownOverflow
          overflow="auto"
          viewScroll="close"
          position="anchor"
          menuButton={
            <button type="button" class="plain">
              <Icon icon="more" size="l" />
            </button>
          }
        >
          <MenuItem
            disabled={!allowSwitch}
            onClick={() => {
              (async () => {
                try {
                  const { masto } = api({
                    instance: accountInstance,
                  });
                  const acc = await masto.v1.accounts.lookup({
                    acct: account.acct,
                  });
                  const { id } = acc;
                  location.hash = `/${accountInstance}/a/${id}`;
                } catch (e) {
                  console.error(e);
                  alert('Unable to fetch account info');
                }
              })();
            }}
          >
            <Icon icon="transfer" />{' '}
            <small class="menu-double-lines">
              Switch to account's instance (<b>{accountInstance}</b>)
            </small>
          </MenuItem>
        </Menu2>
      }
    />
  );
}

function MonthPicker(props) {
  const {
    class: className,
    disabled,
    value,
    min,
    max,
    onInput = () => {},
  } = props;
  const [_year, _month] = value?.split('-') || [];
  const monthFieldRef = useRef();
  const yearFieldRef = useRef();

  const checkValidity = (month, year) => {
    const [minYear, minMonth] = min?.split('-') || [];
    const [maxYear, maxMonth] = max?.split('-') || [];
    if (year < minYear) return false;
    if (year > maxYear) return false;
    if (year === minYear && month < minMonth) return false;
    if (year === maxYear && month > maxMonth) return false;
    return true;
  };

  return (
    <div class={className}>
      <Icon icon="month" size="l" />
      <select
        ref={monthFieldRef}
        disabled={disabled}
        value={_month || ''}
        onInput={(e) => {
          const { value: month } = e.currentTarget;
          const year = yearFieldRef.current.value;
          if (!checkValidity(month, year))
            return {
              value: '',
              validity: {
                valid: false,
              },
            };
          onInput({
            value: month ? `${year}-${month}` : '',
            validity: {
              valid: true,
            },
          });
        }}
      >
        <option value="">Month</option>
        <option disabled>-----</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option
            value={
              // Month is 1-indexed
              (i + 1).toString().padStart(2, '0')
            }
            key={i}
          >
            {new Date(0, i).toLocaleString('default', {
              month: 'long',
            })}
          </option>
        ))}
      </select>{' '}
      <input
        ref={yearFieldRef}
        type="number"
        disabled={disabled}
        value={_year || new Date().getFullYear()}
        min={min?.slice(0, 4) || MIN_YEAR}
        max={max?.slice(0, 4) || new Date().getFullYear()}
        onInput={(e) => {
          const { value: year, validity } = e.currentTarget;
          const month = monthFieldRef.current.value;
          if (!validity.valid || !checkValidity(month, year))
            return {
              value: '',
              validity: {
                valid: false,
              },
            };
          onInput({
            value: year ? `${year}-${month}` : '',
            validity: {
              valid: true,
            },
          });
        }}
        style={{
          width: '4.5em',
        }}
      />
    </div>
  );
}

export default AccountStatuses;
