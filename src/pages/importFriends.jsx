import './lists.css';

import { useEffect, useReducer, useRef, useState } from 'preact/hooks';

import Icon from '../components/icon';
import Link from '../components/link';
import ListAddEdit from '../components/list-add-edit';
import Loader from '../components/loader';
import Modal from '../components/modal';
import NavMenu from '../components/nav-menu';
import { api } from '../utils/api';
import useTitle from '../utils/useTitle';
import { useParams, useSearchParams } from 'react-router-dom';
import AccountBlock from '../components/account-block';
import Avatar from '../components/avatar';


function ImportFriends() {
  const params = useParams();
  const { masto, instance, authenticated } = api({
    instance: params.instance,
  });
  useTitle(`ImportFriends`, `/l`);
  const [uiState, setUIState] = useState('default');

  const [reloadCount, reload] = useReducer((c) => c + 1, 0);
  const [mostrBridgedFriendList, setImportFriends] = useState([]);
  useEffect(() => {
    setUIState('loading');
    (async () => {
      try {
        const res = await fetch(`https://api.nostr.band/nostr?method=search&count=200&q=following:npub1k979np6dcpwh7mkfwk7wq3msezml48fh7wksp9hakakf8pwk3y5qhdz7te&type=people`, {method: "get"});
        const nostrFriendsResponse = await res.json();
        const nostrFriends = nostrFriendsResponse.serp;
        console.log(nostrFriends);
        const mostrBridgedFriendArray = []
        nostrFriends.forEach(async (nostrFriend) => {
            const searchParams = {
                q: `@${nostrFriend.pubkey}@mostr.pub`,
                resolve: authenticated,
                limit: 5,
              };
            // const res = await masto.v2.search.fetch(params);
            // const res = await fetch(`https://fosstodon.org/api/v2/search?q=@${nostrFriend.pubkey}@mostr.pub&resolve=true&limit=40&type=accounts`, {method: "get"});
            
            // setTimeout(async () => {
                const mostrBridgedFriendResponse = await masto.v2.search.fetch(searchParams);
                const mostrBridgedFriend = mostrBridgedFriendResponse.accounts[0];
                mostrBridgedFriendList.push(mostrBridgedFriend);
                console.log(`mostrBridgedFriendList: ${mostrBridgedFriendList}`)
                setImportFriends(mostrBridgedFriendList);
                setUIState('default');
            //   }, 500);


        })
      } catch (e) {
        console.error(e);
        setUIState('error');
      }
    })();
  }, [reloadCount]);

  const [showListAddEditModal, setShowListAddEditModal] = useState(false);

  return (
    <div id="lists-page" class="deck-container" tabIndex="-1">
      <div class="timeline-deck deck">
        <header>
          <div class="header-grid">
            <div class="header-side">
              <NavMenu />
              <Link to="/" class="button plain">
                <Icon icon="home" size="l" />
              </Link>
            </div>
            <h1>Import Friends</h1>
            <div class="header-side">
              <button
                type="button"
                class="plain"
                onClick={() => setShowListAddEditModal(true)}
              >
                <Icon icon="plus" size="l" alt="New list" />
              </button>
            </div>
          </div>
        </header>
        <main>
            <>
            <ul class="timeline flat accounts-list">
                {mostrBridgedFriendList.map((mostrBridgedFriend) => (
                        <a
                            class="account-block import-friends-block"
                            href={`/#/${instance}/a/${mostrBridgedFriend.id}`}
                            target={external ? '_blank' : null}
                            title={`@${mostrBridgedFriend.acct}`}
                            key={mostrBridgedFriend.id}
                            onClick={(e) => {
                            if (external) return;
                            e.preventDefault();
                            if (onClick) return onClick(e);

                                // navigate(`/${instance}/a/${id}`);
                                location.hash = `/${instance}/a/${mostrBridgedFriend.id}`;
                            
                            }}
                        >
                            <li>
                                <Avatar
                                    url={mostrBridgedFriend.avatar}
                                    size="xl"
                                    />
                                <span>{mostrBridgedFriend.displayName}</span>
                            {/* <AccountBlock
                                account={mostrBridgedFriend}
                                instance={instance}
                                showStats
                            /> */}
                            </li>
                        </a>

                ))}
            </ul>
            </>

        </main>
      </div>
      {showListAddEditModal && (
        <Modal
          class="light"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowListAddEditModal(false);
            }
          }}
        >
          <ListAddEdit
            list={showListAddEditModal?.list}
            onClose={(result) => {
              if (result.state === 'success') {
                reload();
              }
              setShowListAddEditModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default ImportFriends;
