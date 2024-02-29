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
    const newFeed = await algo.setWeights(newWeights);
    if (firstLoad || !listIterator.current) {
      listIterator.current = newFeed;
    }

    // const results = await listIterator.current;
    const results = await newFeed;
    // let  value  = results.slice(0, 30);
    let  value  = results;
    if (value?.length) {
      if (firstLoad) {
        latestItem.current = value[0].id;
      }

      value = filteredItems(value, 'home');
      value.forEach(async (item) => {
        // const localVersionOfStatus = await getLocalVersionOfStatus(item);
        // if (localVersionOfStatus) {
        //   saveStatus(localVersionOfStatus, instance);
        // } else {
          saveStatus(item, instance);
        // }
      });
    }
    return {
      ...results,
      value,
    };
  }

  async function getLocalVersionOfStatus (status) {
    const apiEndpoint = masto;
    const results =
      await apiEndpoint.v2.search.fetch({
        q: status.url ? status.url : status.uri,
        type: 'statuses',
        resolve: true,
        limit: 1,
      });
    if (results.statuses.length) {
      const localVersionOfStatus = results.statuses[0];
      return localVersionOfStatus;
    } else {
      return null;
    }
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
        key={instance}
        title={list.title}
        id="foryou"
        emptyText="Nothing yet."
        errorText="Unable to load posts."
        instance={instance}
        fetchItems={fetchList}
        checkForUpdates={checkForUpdates}
        useItemID
        boostsCarousel={snapStates.settings.boostsCarousel}
        allowFilters
        // refresh={reloadCount}
      />
    </>
  );
}

export default ForYou;
