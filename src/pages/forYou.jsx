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
import TheAlgorithm from "fedialgo"
import { getCurrentAccount } from '../utils/store-utils';
const LIMIT = 20;

function ForYou(props) {
  const snapStates = useSnapshot(states);
  const { masto, instance } = api();
  const id = props?.id || useParams()?.id;
  // const navigate = useNavigate();
  const latestItem = useRef();
  // const [reloadCount, reload] = useReducer((c) => c + 1, 0);

  const listIterator = useRef();
  async function fetchList(firstLoad) {


    const currAccount = getCurrentAccount();
    const currUser = currAccount.info;
    const algo = new TheAlgorithm(masto, currUser)
    const feed = await algo.getFeed()
    let weights = await algo.getWeights()
    console.log(`weights: ${weights}`);
    weights["Favs"] = 2
    weights["Interacts"] = 1
    weights["Chaos"] = 3
    weights["Reblogs"] = 2
    weights["TopPosts"] = 4
    weights["Diversity"] = 3

    let newWeights = weights
    const newFeed = await algo.setWeights(newWeights)
    if (firstLoad || !listIterator.current) {
      listIterator.current = newFeed;
    }

    const results = await listIterator.current;
    let  value  = results;
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

  return (
    <>
      <Timeline
        key={id}
        title={list.title}
        id="list"
        emptyText="Nothing yet."
        errorText="Unable to load posts."
        instance={instance}
        fetchItems={fetchList}
        useItemID
        boostsCarousel={snapStates.settings.boostsCarousel}
        allowFilters
        // refresh={reloadCount}
      />
    </>
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

export default ForYou;
