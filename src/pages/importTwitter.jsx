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
import MenuConfirm from '../components/menu-confirm';

function ImportTwitter() {
  const params = useParams();
  const { masto, instance, authenticated } = api({
    instance: params.instance,
  });
  useTitle(`ImportTwitter`, `/l`);
  const [uiState, setUIState] = useState('default');

  const [reloadCount, reload] = useReducer((c) => c + 1, 0);
  const [twitterBridgedFriendList, setImportTwitter] = useState([]);
  const [relationshipUIState, setRelationshipUIState] = useState('default');
  const [relationship, setRelationship] = useState(null);
  const {
    following,
    requested,
  } = relationship || {};
  const twitterAccounts = [
    "BarackObama",
    "elonmusk",
    "NASA",
    "Twitter",
    "BillGates",
    "EmmaWatson",
    "SpaceX",
    "coldplay",
    "Xbox",
    "Pontifex",
    "Tesla",
    "RobertDowneyJr",
    "MoSalah",
    "RockstarGames",
    "POTUS44",
    "tim_cook",
    "Microsoft",
    "Android",
    "Guaje7Villa",
    "NASAHubble",
    "Windows",
    "Space_Station",
    "googlechrome",
    "Bourdain",
    "jack",
    "FLOTUS44",
    "BillNye",
    "AlsisiOfficial",
    "JeffBezos",
    "SteveCarell",
    "StationCDRKelly",
    "DashieXP",
    "sundarpichai",
    "dylansprouse",
    "MarsCuriosity",
    "TheRealStanLee",
    "NASAJPL",
    "dog_feelings",
    "Hegazi",
    "NateSilver538",
    "NASAEarth",
    "RepAdamSchiff",
    "NASAPersevere",
    "nasahqphoto",
    "ethereum",
    "satyanadella",
    "MikeBloomberg",
    "NASAKennedy",
    "bflay",
    "biz",
    "amremoussa",
    "NASAWebb",
    "googledevs",
    "melindagates",
    "github",
    "NYGovCuomo",
    "USMNT",
    "ericschmidt",
    "gatesfoundation",
    "sydneyleroux",
    "googledrive",
    "Porsche",
    "mbatshuayi",
    "HOUSEPORN___",
    "NASA_Johnson",
    "GUBLERNATION",
    "GoogleAI",
    "TwitterDesign",
    "Lumia",
    "WarrenBuffett",
    "ev",
    "timoreilly",
    "kevinrose",
    "mradamscott",
    "Mariobatali",
    "CathieDWood",
    "dickc",
    "NASA_Astronauts",
    "FOXSoccer",
    "MTA",
    "Comey",
    "steveo",
    "NASAMars",
    "landondonovan",
    "ISS_Research",
    "emiliaclarke",
    "ycombinator",
    "majornelson",
    "TerribleMaps",
    "Downtown",
    "XboxP3",
    "hopesolo",
    "AhmedShafikEG",
    "James_Phelps",
    "bgreene",
    "NASA_Technology",
    "googlenexus",
    "NSAGov",
    "sama",
    "Rick_Bayless",
    "JohnBrennan",
    "boringcompany",
    "YellowstoneNPS",
    "NASAGoddard",
    "YayaToure",
    "marsrader",
    "SarcasticRover",
    "HUBBLE_space",
    "OpenAI",
    "humansofny",
    "alikrieger",
    "GSElevator",
    "universal_sci",
    "mayemusk",
    "J_Klinsmann",
    "ENERGY",
    "seriouseats",
    "cpulisic_10",
    "khanacademy",
    "tfosumensah",
    "neuralink",
    "NASAJuno",
    "JustinRoiland",
    "madebygoogle",
    "ARKInvest",
    "SeinfeldToday",
    "culturaltutor",
    "fredwilson",
    "NASA_Marshall",
    "MichaelDell",
    "TimHowardGK",
    "waitbutwhy",
    "NASA_Orion",
    "reactjs",
    "sequoia",
    "paraga",
    "Food52",
    "clint_dempsey",
    "surface",
    "bgurley",
    "NASA_SLS",
    "blueorigin",
    "kelleymohara",
    "vkhosla",
    "jeffweiner",
    "code",
    "signalapp",
    "karpathy",
    "GVteam",
    "mohmedabogabal",
    "OpDeathEaters",
    "MrCraigRobinson",
    "ChristenPress",
    "J_Green37",
    "alexisohanian",
    "VisualStudio",
    "foodista",
    "lifeatgoogle",
    "TrungTPhan",
    "bchesky",
    "windowsblog",
    "nycgo",
    "virgingalactic",
    "RepCummings",
    "googlestudents",
    "RocketLab",
    "jon_prosser",
    "internetofshit",
    "evleaks",
    "bromco",
    "NASASocial",
    "saurik",
    "bwecht",
    "BibopGGresta",
    "NASAGoddardPix",
    "angular",
    "MayorOfLA",
    "Commercial_Crew",
    "NASA_Langley",
    "AngelList",
    "drfeifei",
    "SecretaryCarson",
    "NASAAmes",
    "TheStoicEmperor",
    "catcora",
    "Concacaf",
    "xkcdComic",
    "NASAArmstrong",
    "NataliaDyer",
    "nihilist_arbys",
    "patrickc",
    "DwightSchrute_",
    "AstroBehnken",
    "judahsmith",
    "EgyProjects",
    "yedlinny",
    "TechEmails",
    "MikeSievert",
    "MixDiskerud",
    "jess",
    "ulalaunch",
    "Astro_Doug",
    "Werner",
    "TwitterBlue",
    "fchollet",
    "Seinfeld2000",
    "NASA_Wallops",
    "johndoerr",
    "kimbal",
    "aronjo20",
    "jasonfried",
    "drewhouston",
    "Jermainejunior",
    "NASAglenn",
    "Noahpinion",
    "demishassabis",
    "moeebrian",
    "vuejs",
    "Hyperloop",
    "mlevchin",
    "goodfellow_ian",
    "exploreplanets",
    "DARPA",
    "BoeingSpace",
    "jkbjournalist",
    "inspiration4x",
    "kleinerperkins",
    "Austen",
    "iH8sn0w",
    "LucidMotors",
    "vintagemapstore",
    "DefenseIntel",
    "NaomiScott",
    "FabianJohnson23",
    "rrhoover",
    "travisk",
    "RepBetoORourke",
    "ReneRedzepiNoma",
    "tomwarren",
    "FEhrsam",
    "mackenziescott",
    "bluesky",
    "mrsorokaa",
    "hyperloop__one",
    "j_brooks25",
    "tfadell",
    "SofiaHCBBG",
    "yoyoel",
    "reckless",
    "AmericanOutlaws",
    "vertigo_comics",
    "NIHDirector",
    "Rivian",
    "roselavelle",
    "Suhail",
    "davidcohen",
    "ghostofhellas",
    "traditionalhome",
    "LRO_NASA",
    "TestKitchen",
    "BrekShea",
    "PanguTeam",
    "NASA_LSP",
    "CurtisStone",
    "Cathrinmachin",
    "joebelfiore",
    "hillsongNYC",
    "geoffreyhinton",
    "windowsinsider",
    "MicrosoftDesign",
    "WearOSbyGoogle",
    "ajassy",
    "joshk",
    "haveibeenpwned",
    "ishanagarwal24",
    "wongmjane",
    "lightning",
    "carllentzNYC",
    "markrussinovich",
    "kotlin",
    "jgebbia",
    "tailwindcss",
    "HowtoADHD",
    "CookCarluccio",
    "qwertyoruiopz",
    "checkra1n",
    "TrueAnonPod",
    "OriolVinyalsML",
    "OnLeaks",
    "ussoccer",
    "JeffersonBethke",
    "dkhos",
    "PopeTawadros",
    "NASAStennis",
    "metrolosangeles",
    "trueventures",
    "gdb",
    "VRSVirginia",
    "ringo_ring",
    "yegg",
    "citizenlab",
    "soumithchintala",
    "Carnage4Life",
    "RonConway",
    "labnol",
    "MalPugh",
    "MassEMA",
    "vijaya",
    "NSACyber",
    "hugo_larochelle",
    "OrbitalATK",
    "panos_panay",
    "GabeAul",
    "chirag_kulkarni",
    "costplusdrugs",
    "ElBloombito",
    "chrmanning",
    "AliceWaters",
    "mingchikuo",
    "gregjoz",
    "BadEconTakes",
    "roelofbotha",
    "rsalakhu",
    "arxivblog",
    "NandoDF",
    "blocks",
    "frontpagetech",
    "shivon",
    "TourismandAntiq",
    "Una",
    "Scott_Wiener",
    "RWalensky",
    "analogue",
    "CommunityNotes",
    "wcathcart",
    "WPLevel5",
    "openstreetmap",
    "foundersfund",
    "AndyBiotech",
    "RichardSocher",
    "ByzantineLegacy",
    "NPRFood",
    "RJScaringe",
    "IPFS",
    "JonFreier",
    "Arm",
    "DominicDAgosti2",
    "TBD54566975",
    "StartupLJackson",
    "evanspiegel",
    "the_transit_guy",
    "HouseIntel",
    "taig_jailbreak",
    "united2026",
    "MargRev",
    "Astro_Ferg",
    "woodhaus2",
    "StanfordAILab",
    "jesslivingston",
    "TwitterNYC",
    "bluebottleroast",
    "VertexPharma",
    "FBIRecordsVault",
    "solarcity",
    "pythianism",
    "leeerob",
    "axi0mX",
    "davidhornik",
    "carolinecapital",
    "bloomtech",
    "crazylove",
    "TheAncientWorld",
    "WolfgangPuck",
    "salkhanacademy",
    "USDS",
    "LVCVA",
    "moot",
    "KristinJohns",
    "konradjr",
    "danrobinson",
    "AppleCard",
    "OldSchoolBoston",
    "BishopAngaelos",
    "NevilleRay",
    "Initialized",
    "CommanderMLA",
    "Slashleaks",
    "astro_jaz",
    "JeffImmelt",
    "ashleymayer",
    "dearmoonproject",
    "DeepLearningHub",
    "Digital_Gov",
    "AirbnbEng",
    "BostonVC",
    "lockheimer",
    "greentheonly",
    "essential",
    "sm",
    "sindresorhus",
  ];
  const slicedTwitterAccounts = twitterAccounts.slice(600, 750);
  
  useEffect(() => {
    setUIState('loading');
    (async () => {
      try {
        // const res = await fetch(`https://fosstodon.org/api/v2/search?q=@${nostrFriend.pubkey}@mostr.pub&resolve=true&limit=40&type=accounts`, {method: "get"});
        // const nostrFriendsResponse = await res.json();
        // const nostrFriends = nostrFriendsResponse.serp;
        // console.log(nostrFriends);
        // const mostrBridgedFriendArray = []
        // 
        // 
        slicedTwitterAccounts.forEach(async (twitterAccount) => {
            const searchParams = {
                q: `@${twitterAccount}@bird.makeup`,
                resolve: authenticated,
                limit: 5,
              };
            // const res = await masto.v2.search.fetch(params);
            // const res = await fetch(`https://fosstodon.org/api/v2/search?q=@${nostrFriend.pubkey}@mostr.pub&resolve=true&limit=40&type=accounts`, {method: "get"});
            
            setTimeout(async () => {
                try {
                    const twitterBridgedFriendResponse = await masto.v2.search.fetch(searchParams);
                    const twitterBridgedFriend = twitterBridgedFriendResponse.accounts[0];
                    if (twitterBridgedFriend) {
                        twitterBridgedFriendList.push(twitterBridgedFriend);
                        console.log(`twitterBridgedFriendList: ${twitterBridgedFriendList}`)
                        setImportTwitter(twitterBridgedFriendList);
                        setUIState('default');
                    }
                } catch (e) {
                    console.error(e);
                    setUIState('error');
                  }
              }, 1000);


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
          <MenuConfirm
              confirm={following || requested}
              menuItemClassName="danger"
              align="end"
              onClick={() => {
                setRelationshipUIState('loading');
                (async () => {
                  const { masto: currentMasto } = api();
                  twitterBridgedFriendList.forEach(async (twitterBridgedFriend) => {
                    try {
                      let newRelationship;
                      newRelationship = await masto.v1.accounts
                        .$select(twitterBridgedFriend.id)
                        .follow();
                      if (newRelationship) setRelationship(newRelationship);
                      setRelationshipUIState('default');
                      console.log(`followed twitterBridgedFriend with id ${twitterBridgedFriend.id}`);
                    } catch (e) {
                      alert(e);
                      setRelationshipUIState('error');
                    }
                  });
                })();
              }}
            >
              <button
                type="button"
                class={`${following || requested ? 'light swap' : ''}`}
                data-swap-state={following || requested ? 'danger' : ''}
              >
                  Follow All
              </button>
            </MenuConfirm>
        </header>

        <main>
            <>
            <ul class="timeline flat accounts-list accounts-import-list">
              {twitterBridgedFriendList.map((twitterBridgedFriend) => (
                <a
                    class="account-block import-friends-block"
                    href={`/#/${instance}/a/${twitterBridgedFriend.id}`}
                    target={external ? '_blank' : null}
                    title={`@${twitterBridgedFriend.acct}`}
                    key={twitterBridgedFriend.id}
                    onClick={(e) => {
                    if (external) return;
                    e.preventDefault();
                    if (onClick) return onClick(e);

                        // navigate(`/${instance}/a/${id}`);
                        location.hash = `/${instance}/a/${twitterBridgedFriend.id}`;
                    
                    }}
                >
                    <li>
                        <Avatar
                            url={twitterBridgedFriend.avatar}
                            size="xl"
                            />
                        <span>{twitterBridgedFriend.displayName}</span>
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

export default ImportTwitter;
