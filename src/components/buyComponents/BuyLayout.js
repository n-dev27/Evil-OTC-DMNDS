/* eslint-disable no-undef */
import React, { Fragment, useContext, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { utils } from 'ethers';
import { useAccount, useBalance, useNetwork, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { useQuery } from "@apollo/client";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import styled from 'styled-components';
import { XMarkIcon, XCircleIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import Favorites from './Favorites';
import AlertToast from './AlertToast';
import PoolSearch from './PoolSearch';
import AssignedPools from './AssignedPools';
import TwitterPoolsLayout from '../socialComponents/TwitterPoolsLayout';
import { GET_POOL_INFO } from '../../constants/graphql/query';
import { convertTokenNewPrice } from '../../utils/tokenCoinNewPrice';
import { getSvgLogoPath } from '../../assets/symbol/svgIcons';
import { LayoutContext } from "../layout/layout";
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json';
import { getTokenPair } from '../../services/tokenInfoServices';
import { chains } from '../layout/layout';

const style = {
  wrapper: 'flex sm:px-8 sm:pt-5 sm:pb-6 justify-center h-full w-full',
  buyContainer:
    'customShare relative h-full xs:flex-col md:flex sm:pt-8 w-full sm:bg-[rgba(6,11,39,0.8)] shadow-[rgba(0,0,0,0.16)] rounded-[20px]',
  backContainer:
    'h-full overflow-y-auto xs:flex-col w-full justify-center rounded-xl',
  nav: `flex justify-stretch max-w-[530px] w-5/6 m-auto bg-white bg-opacity-10 border border-slate-400 border-opacity-5 rounded-lg`,
  navItem: `text-xl font-bold w-1/3 px-2 md:px-4 py-2 items-center justify-center text-white/50 enabled:hover:bg-[#d3d7db] hover:text-[#566B90] hover:text-black text-xs md:text-lg cursor-pointer rounded-lg`,
  activeNavItem: `text-xl font-bold w-1/3 px-2 md:px-4 py-2 items-center shadow-[_-12.572383880615234px_18.85857582092285px_25.14476776123047px_rgba(130,149,179,0.24)] bg-[#619FFF] text-white text-xs md:text-lg rounded-xg`,
  loadingStyle: `flex justify-center items-center`,

  buyButton:
    'enabled:bg-[#1C76FF] disabled:bg-[#B9BCC7]/50 cursor-pointer w-full text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center',
  confirmationBuyButton:
    'enabled:bg-[#1C76FF] disabled:bg-[#B9BCC7]/50 enabled:hover:scale-105 w-full shadow text-white rounded-3xl py-4 text-2xl font-roboto flex items-center justify-center enabled:cursor-pointer',
  CancelButton: 'bg-slate-700 hover:scale-105 w-full shadow text-white rounded-3xl py-4 text-2xl font-roboto flex items-center justify-center enabled:cursor-pointer',

  sellInput: 'flex w-full min-h-[117px] justify-between bg-white bg-opacity-10 rounded-xl shadow px-5 py-4',
  sellInputText: 'w-full text-xs sm:text-sm text-white font_Inter',
  sellInputBalanceContainer: 'flex flex-col gap-1',
  sellInputBalance: 'flex w-full justify-end items-center text-sm text-[#94A3B8] font-Inter',
  sellInputSelector: 'flex justify-start rounded-lg text-xl text-[#F8FAFC] font-Inter gap-4',
  sellInputMaxButton:
    'flex justify-center text-[#5DB1FF] text-base font-bold font_Inter items-center hover:animate-pulse text-base rounded-md',
  sellInputInputContainer: 'flex justify-end items-center text-white text-[1.6rem] pt-1',
  sellInputAmount:
    'defaultPlaceholder flex w-full justify-end text-[#F8FAFC] font-[Abel] bg-transparent text-2xl border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellInputValue: 'flex w-full justify-end text-sm text-slate-400 font_Inter',

  sellOutput: 'flex w-full min-h-[117px] justify-between bg-white bg-opacity-10 rounded-xl shadow px-5 py-4',
  sellOutputText: 'w-full text-xs sm:text-sm text-white font_Inter',
  sellOutputBalanceContainer: 'flex flex-col gap-1',
  sellOutputBalance: 'flex w-full justify-end items-center text-sm text-[#94A3B8] font-Inter',
  sellOutputSelector: 'flex text-[#F8FAFC] justify-start text-xl font-roboto gap-4',
  sellOutputInputContainer: 'flex justify-end items-center text-white text-[1.6rem] pt-1',
  sellOutputAmount:
  'defaultPlaceholder flex w-full justify-end text-[#F8FAFC] font-[Abel] bg-transparent text-2xl border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellOutputValue: 'flex w-full justify-end text-sm text-slate-400 font_Inter',
};

const StyledTabs = styled(Tabs)`
& {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-end;
  & > div {
    height: calc(100% - 50px);
  }
  & nav {
    flex: 1;
    display: flex;
    justify-content: center;
    width: fit-content;
    margin-right: 32px;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.1); /* Equivalent to 'bg-white bg-opacity-10' */
    border: 1.26px solid rgba(164, 176, 197, 0.07); /* Equivalent to 'border border-slate-400 border-opacity-5' */
    border-radius: 9999rem; /* Equivalent to 'rounded-lg' */
    & > ul {
      width: 100%;
      padding: 0.125rem;
      & > li {
        display: flex;
        width: 160px;
        font-size: 18px;
        font-weight: 500;
        font-family: Inter;
        line-height: 21.78px;
        padding: 12px, 24px, 12px, 24px !important;
        justify-content: center;
        cursor: pointer;
        color: white;
        & > div.absolute { /* div.absolute inside li */
          align-items: center;
          box-shadow: -12.572383880615234px 18.85857582092285px 25.14476776123047px 0px rgba(130, 149, 179, 0.24);
          background-color: rgba(28, 118, 255, 1) ;
          text-align: center;
          border-radius: 9999rem;
        }
      }
    }
  }
}

@media (max-width: 820px) {
  & nav {
    margin: 0;
    width: 100%;
    padding-left: 32px;
    margin-right: 16px;
    background: rgba(255, 255, 255, 0);
    border: hidden;
    border-radius: 0px;
    overflow-x: auto;
    scrollbar-width: none; // For Firefox
    -ms-overflow-style: none; // For IE and Edge

    &::-webkit-scrollbar { // For Webkit browsers like Chrome, Safari, and Opera
      display: none;
    }

    & > ul {
      padding: 0;

      & > li {
        min-width: 96px;
        font-size: 12px;
        font-family: Inter;
        padding: 8px 0;

        & > div.absolute {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.12);
        }
      }
    }
  }
}
`;

export default function BuyLayout({ poolRouter }) {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: chainData } = useBalance({
    address: address,
  });
  const [cookies, setCookie] = useCookies(['reseller']);
  const router = useRouter();
  
  const { loading, error, data, refetch } = useQuery(GET_POOL_INFO);
  const { chainKey, setChainKey, chainFlag, setChainFlag, hotButtonFlag, isBuyMobile, setIsBuyMobile, routerPath, setSelectedOne, setToken, showButton, setShowButton } = useContext(LayoutContext);
  const [key, setKey] = useState(Math.random()); // initialize with random key 
  const [isNarrowScreen, setIsNarrowScreen] = useState(false); // Default to false
  const [discountListing, setDiscountListing] = useState([]);
  const [allData, setAllData] = useState();
  const [poolRouterAddress, setPoolRouterAddress] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState('buyTokens');
  const [modalKey, setModalKey] = useState(-1);
  const [marketPrices, setMarketPrices] = useState({priceUsd: 0, priceNative: 0});
  const [isBuyPrice, setIsBuyPrice] = useState({});
  const [isBuyFlag, setIsBuyFlag] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChartFlag, setIsChartFlag] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [poolInfo, setPoolInfo] = useState(false);
  const [formattedPoolsData, setFormattedPoolsData] = useState();
  const [inputTokenPrice, setInputTokenPrice] = useState('');
  const [inputTokenAmount, setInputTokenAmount] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [outputTokenAmount, setOutputTokenAmount] = useState('');
  const [outputTokenPrice, setOutputTokenPrice] = useState('');
  const [tokenImage, setTokenImage] = useState();
  const [tokenOutImage, setTokenOutImage] = useState();
  const [favArray, setFavArray] = useState(null);
  const [favPoolFlag, setFavPoolFlag] = useState([]);

  const tabRef = useRef(null);

  let chainSymbol = chainData?.symbol ? chainData?.symbol : 'ETH';
  let chainDecimals = chainData?.decimals ? chainData?.decimals : 18;
  let chainToCheck = 'ethereum';
  const { query } = router;
  const reseller = query.reseller;

  if (chain?.id == 42161) {
    chainToCheck = 'arbitrum';
  };

  async function getTokenImage(token) {
    if (!token) return

    try {
      // Fetch the current swap price according to the currently connected chain
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${chainToCheck}/contract/${token}`);

      if (!response.ok) {
        // If the response is not OK, throw an error
        throw new Error(`API request failed with status ${response.status}`);
      }

      const tokenInfoJSON = await response.json();

      const image = tokenInfoJSON?.image?.large;

      if (image?.length) {
        return image;
      } else {
        return '/App_Logo.png';
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      // Handle the error as needed, e.g., by setting a default image or skipping the item
      return '/App_Logo.png';
    }
  }

  const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

  const poolType = modalKey !== -1 ? formattedPoolsData[modalKey] && formattedPoolsData[modalKey] && formattedPoolsData[modalKey]?.poolValue : null;
  const buyTokenAddress = modalKey !== -1 ? formattedPoolsData[modalKey] && formattedPoolsData[modalKey]?.poolAddress : null;
  const buyTokenDecimals = modalKey !== -1 ? formattedPoolsData[modalKey] && formattedPoolsData[modalKey]?.tokenDecimals : null;
  const buyTokenFixedPrice = modalKey !== -1 ? formattedPoolsData[modalKey] && (formattedPoolsData[modalKey]?.poolData_4?.toString() * utils.formatUnits(formattedPoolsData[modalKey]?.poolData_5?.toString(), formattedPoolsData[modalKey]?.tokenDecimals)) / 10 ** chainDecimals : null;
  const buyTokenPrice = modalKey !== -1 ? formattedPoolsData[modalKey] && formattedPoolsData[modalKey]?.poolData_4.toString() : null;
  const buyTokenAmountAvailable = modalKey !== -1 ? formattedPoolsData[modalKey] && parseFloat(utils.formatUnits(formattedPoolsData[modalKey]?.poolData_5?.toString(), formattedPoolsData[modalKey]?.tokenDecimals)).toFixed(5) : null;
  const buyTokenNativePrice = modalKey !== -1 ? formattedPoolsData[modalKey] && marketPrices?.priceNative : null;
  const discountValue = modalKey !== -1 ? formattedPoolsData[modalKey] && formattedPoolsData[modalKey]?.poolData_3 : null;

  const { config: buyFromPool } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'buyFromPool',
    enabled:
      modalKey !== -1 &&
      ((poolType || (poolType == '2')
        ? outputTokenAmount > '0'
        : buyTokenFixedPrice > '0') || poolType == '1'),
    args: [
      buyTokenAddress,
      poolType == '1' ?
        (buyTokenAmountAvailable && utils.parseUnits(buyTokenAmountAvailable?.toString(), buyTokenDecimals)?.toString()) : (outputTokenAmount && utils.parseUnits(outputTokenAmount, buyTokenDecimals)?.toString()),
      "",
    ],
    chainId: chain?.id,
    value:
      (poolType == '1' && buyTokenFixedPrice > '0' && utils.parseEther(buyTokenFixedPrice * (100 - discountValue / 10) / 100).toString()) ||
      (poolType == '2' || poolType == '3') && buyTokenFixedPrice > '0' && (outputTokenAmount * buyTokenPrice * (100 - discountValue / 10) / 100).toString() ||
      (poolType == '1' && buyTokenFixedPrice <= '0' && (buyTokenAmountAvailable * buyTokenNativePrice * (100 - discountValue / 10) / 100).toString() * 10 ** 18) ||
      (poolType == '2' || poolType == '3') && buyTokenFixedPrice <= '0' && utils.parseUnits((parseFloat(outputTokenAmount * buyTokenNativePrice * (100 - discountValue / 10) / 100).toFixed(10)).toString(), buyTokenDecimals).toString(),
    onSuccess(listForSellToken) {
      console.log('Ready to buy', buyFromPool)
    },
    onError(listForSellToken) {
      console.log('Ready to buy Error', buyFromPool)
    },
  });

  const {
    data: buyFromPoolTokenData,
    isLoading: buyFromPoolLoading,
    isSuccess: buyFromPoolStarted,
    error: buyFromPoolError,
    write: buyFromPoolWrite,
  } = useContractWrite(buyFromPool);

  const buyFromPoolWaitForTransaction = useWaitForTransaction({
    hash: buyFromPoolTokenData?.hash,
    onSuccess(buyFromPoolTokenData) {
      handleCancel();
      console.log('Success', buyFromPoolTokenData);
    },
  });

  const handleCancel = () => {
    setIsFlipped(false);
    setInputTokenAmount('0')
    setOutputTokenAmount('0')
  };

  const handleCloseModal = () => {
    setSelectedOne(false);
    router.push('/pending');
  };

  async function getTokenPrice() {
    if (chain?.id != (42161 || 56 || 137 || 97 || 80001 || 1)) {
      return
    } else {
      {
        convertTokenNewPrice(
          chain?.nativeCurrency?.symbol.toString(),
          setInputTokenPrice,
          chain?.id.toString(),
        )
      }
    }
  };

  async function getOutTokenPrice() {
    if (chain?.id != (42161 || 56 || 137 || 97 || 80001 || 1)) {
      return
    } else {
      {
        convertTokenNewPrice(
          modalKey !== -1  && formattedPoolsData[modalKey]?.tokenSymbol?.toString(),
          setOutputTokenPrice,
          chain?.id.toString(),
        )
      }
    }
  };

  // useEffect(() => {
  //   const fetchMarketPrices = async () => {
  //     const favList = await getOneList();
  //     console.log('fav list === ', favList)
  //     setFavPoolFlag(favList?.data.data)
  //     if (favList) {
  //       let newArray = [];
  //       await Promise.all(favList?.data.data.token_list.map(async (item, index) => {
  //         try {
  //           const tokenInfo = await getTokenMeta(item);
  //           if (tokenInfo.data) {
  //             console.log('tokenInfo === ', tokenInfo)
  //             newArray.push({ tokenAddress: item, image: tokenInfo.data[0].logo });
  //           } else {
  //             const image = getSvgLogoPath(item.symbol);
  //             newArray.push({ name: item.symbol, image: image });
  //           }
  //         } catch (error) {
  //           console.error('Error fetching image on BuyLayout 339 line:', error);
  //           // Handle the error as needed, e.g., by setting a default image or skipping the item
  //         }
  //       }));
  //       setImgArray(newArray);
  //     }
  //   }

  //   fetchMarketPrices();
  // }, []);

  useEffect(() => {
    if (data) {
      setAllData(data);
    }
  }, [data]);

  useEffect(()=> {
    setKey(Math.random()); // Change key each time discountListing changes
  }, [hotButtonFlag]);
  
  useEffect(() => {
    refetch();
  }, [routerPath]);

  useEffect(() => {
    setPoolRouterAddress(poolRouter && poolRouter !== "0" ? poolRouter.split('?')[1] : poolRouter);
    refetch();
  }, [poolRouter]);

  const handleResize = () => {
    const screenWidth = window.innerWidth;
    setIsNarrowScreen(screenWidth < 1210);

    if (screenWidth >= 1210) {
      document.querySelector(".buyTokens")?.click();
    } else {
        // Other conditions for different widths can be implemented here
      document.querySelector(".buyTokens")?.click();
    }
  };

  useEffect(() => {
    // Define the function inside useEffect to handle resizing

    // // Call handleResize on mount to check initial size
    handleResize();

    // Add the event listener after the component mounts
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty array ensures this effect only runs on mount and unmount

  useEffect(() => {
    if (buyFromPoolStarted) {
      setIsOpenModal(true);
    }
  }, [buyFromPoolStarted]);

  useEffect(() => {
    setTokenImage(getSvgLogoPath(chain?.nativeCurrency?.symbol));
  }, [chain, address]);

  useEffect(() => {
    getTokenPrice();
    getOutTokenPrice();
  }, [inputTokenAmount]);

  useEffect(() => {
    getTokenPrice();
    getOutTokenPrice();
  }, [outputTokenAmount]);

  useEffect(() => {
    getTokenPrice();
    getOutTokenPrice();

    setInputTokenAmount('');
    setOutputTokenAmount('');
    const fetchMarketPrices = async () => {
      if (modalKey !== -1) {
        if (formattedPoolsData[modalKey].tokenSymbol === 'QUICKI') {
          setTokenOutImage('');
        } else {
          setTokenOutImage(getSvgLogoPath(formattedPoolsData[modalKey].tokenSymbol));
        }
        const marketPrice = await getTokenPair(formattedPoolsData[modalKey].tokenAddress);

        const reMarketPrice = marketPrice?.data === null ?
          {
            priceUsd: 0,
            priceNative: 0,
          } :
          {
            priceUsd: parseFloat(marketPrice?.data[0]?.priceUsd),
            priceNative: parseFloat(marketPrice?.data[0]?.priceNative)
          };

        setMarketPrices(reMarketPrice);

        // const buyPriceEth = !formattedPoolsData[modalKey].listingType ? formattedPoolsData[modalKey].poolData_3 === 0 ? reMarketPrice.priceNative : reMarketPrice.priceNative * (100 - formattedPoolsData[modalKey].poolData_3) / 100 : (formattedPoolsData[modalKey].poolData_4?.toString() *
        //   utils.formatUnits(formattedPoolsData[modalKey].poolData_5?.toString(), formattedPoolsData[modalKey].tokenDecimals)) /
        //   10 ** 18;

        // const buyPrice = !formattedPoolsData[modalKey].listingType ? formattedPoolsData[modalKey].poolData_3 === 0 ? reMarketPrice.priceUsd : reMarketPrice.priceUsd * (100 - formattedPoolsData[modalKey].poolData_3) / 100 : 
        // Number(
        //   ((formattedPoolsData[modalKey].poolData_4?.toString() *
        //     utils.formatUnits(
        //       formattedPoolsData[modalKey].poolData_5?.toString(),
        //       formattedPoolsData[modalKey]?.tokenDecimals
        //     )) /
        //     10 ** 18) *
        //     chainTokenPrice
        // )?.toLocaleString(undefined, {maximumFractionDigits: 4});

        const buyPriceEth = formattedPoolsData[modalKey].poolData_3 === 0 ? reMarketPrice.priceNative : reMarketPrice.priceNative * (100 - formattedPoolsData[modalKey].poolData_3 / 10) / 100;
        const buyPrice = formattedPoolsData[modalKey].poolData_3 === 0 ? reMarketPrice.priceUsd : reMarketPrice.priceUsd * (100 - formattedPoolsData[modalKey].poolData_3 / 10) / 100;

        setIsBuyPrice({
          buyPrice: buyPrice === 0
            ? buyPrice
            : buyPrice.toString().split('.')[1]?.length > 8
            ? parseFloat(buyPrice).toFixed(4)
            : buyPrice,
          buyPriceEth: buyPriceEth === 0
            ? buyPriceEth
            : buyPriceEth.toString().split('.')[1].length > 8
            ? parseFloat(buyPriceEth).toFixed(4)
            : buyPriceEth,
        });
      }
    }

    fetchMarketPrices();
  }, [modalKey]);

  useEffect(() => {
    if (query.reseller) {
      setCookie('Reseller', reseller, { path: '/', maxAge: 30 })
    }
  }, [query.reseller]);

  useEffect(() => {
    if (inputTokenAmount > 0 && outputTokenPrice > 0) {
      let outPutTokenAvailable = modalKey !== -1 && utils.formatUnits(formattedPoolsData[modalKey].poolData_5?.toString(), formattedPoolsData[modalKey]?.tokenDecimals)
      let outputDiamondCalculation = (inputTokenAmount * inputTokenPrice / outputTokenPrice).toString()

      setOutputTokenAmount(Number(parseFloat(outputDiamondCalculation) > parseFloat(outPutTokenAvailable) ? outPutTokenAvailable : outputDiamondCalculation)?.toLocaleString(undefined, { maximumFractionDigits: 10 }))
    } else if (inputTokenAmount == '' || inputTokenAmount == '0') {
      setOutputTokenAmount('')
    }
  }, [inputTokenAmount, outputTokenPrice]);

  useEffect(() => {
    if (outputTokenAmount > 0 && inputTokenPrice > 0) {
      let inputDiamondCalculation = parseFloat(outputTokenAmount * outputTokenPrice / inputTokenPrice).toFixed(10).toString()
      setInputValue(Number(inputDiamondCalculation)?.toLocaleString(undefined, { maximumFractionDigits: 10 }));
    } else if (outputTokenAmount == '') {
      setInputValue('')
    }

  }, [outputTokenAmount, inputTokenPrice]);

  const handleAllChains = () => {
    setChainFlag(!chainFlag);
  }

  return (
    <>
      <div className={style.wrapper}>
        <AlertToast />
        {/* {error ? (
          <NotificationModal content={'0'} isOpen={true}/>
        ) : ( */}
          <div className='flex gap-5 w-full h-full justify-center'>
            {/* <div className={`${isBuyMobile === true ? 'hidden' : 'mxl:flex'} hidden max-w-[317px] h-[calc(100vh-180px)] overflow-y-auto xs:flex-col mxl:flex w-full bg-[hsl(0,0%,50%,0.07)] rounded-xl p-[12px] sm:p-0 sm:py-5`}></div> */}
            <div className={`${style.buyContainer} tab_container`}>
              <StyledTabs
                value={activeTab}
                ref={tabRef}
              >
              <div className='flex absolute top-1 left-8 gap-2'>
                <p className='hidden lp:flex text-[28px] font-[Inter] font-bold text-[rgba(255,255,255,0.8)]'>Buy Token</p>
                <div className={`${chainKey === 'All Chain' ? 'px-4 py-2' : 'p-2'} hidden lg:flex relative cursor-pointer justify-center items-center gap-2 h-fit rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-base font-[Inter] text-[rgba(255,255,255,0.8)]`}
                  onClick={() => handleAllChains()}
                >
                  {chainKey !== 'All Chain' && <Image src={chains.filter(chain => chain.name.toLowerCase().includes(chainKey.toLowerCase()))[0].logo} alt={`${chainKey.toLowerCase()}_logo`} className='w-6 h-6'></Image>}
                  <p className='hidden llg:flex mmxl:hidden mxl:flex font-[Inter] text-xs tracking-widest text-white'>{chainKey}</p>
                  {chainFlag ? (
                    <ChevronUpIcon className='w-5 h-5' />
                  ) : (
                    <ChevronDownIcon className='w-5 h-5'/>
                  )}
                </div>
              </div>
                <TabsHeader>
                  {isNarrowScreen && 
                    <Tab
                      key='favorite'
                      value='favorite'
                      onClick={() => setActiveTab('favorite')}
                      className={activeTab === 'favorite' ? 'favorite' : 'opacity-70 favorite'}
                    >
                      Favorite
                    </Tab>
                  }
                  <Tab
                    key='buyTokens'
                    value='buyTokens'
                    onClick={() => setActiveTab('buyTokens')}
                    className={activeTab === 'buyTokens' ? 'buyTokens' : 'opacity-70 buyTokens'}
                  >
                    Search
                  </Tab>
                  <Tab
                    key='twitterTokens'
                    value='twitterTokens'
                    onClick={() => setActiveTab('twitterTokens')}
                    className={activeTab === 'twitterTokens' ? 'twitterTokens' : 'opacity-70 twitterTokens'}
                  >
                    Twitter Pools
                  </Tab>
                  <Tab
                    key='walletTokens'
                    value='walletTokens'
                    onClick={() => setActiveTab('walletTokens')}
                    className={activeTab === 'walletTokens' ? 'walletTokens' : 'opacity-70 walletTokens'}
                  >
                    Assigned Pools
                  </Tab>
                </TabsHeader>
                <TabsBody>
                  {isNarrowScreen &&
                    <TabPanel value="favorite" className="p-0">
                      <Favorites isNarrowScreen={isNarrowScreen} tokenImage={tokenImage} marketPricesFrom={marketPrices} inputTokenPrice={inputTokenPrice} setInputTokenPrice={setInputTokenPrice} inputTokenAmount={inputTokenAmount} setInputTokenAmount={setInputTokenAmount} outputTokenPrice={outputTokenPrice} setOutputTokenPrice={setOutputTokenPrice} isBuyPrice={isBuyPrice} setIsBuyPrice={setIsBuyPrice} outputTokenAmount={outputTokenAmount} setOutputTokenAmount={setOutputTokenAmount} inputValue={inputValue} setInputValue={setInputValue} modalKey={modalKey} setModalKey={setModalKey} formattedPoolsData={formattedPoolsData} singlePoolsData={modalKey >= 0 ? formattedPoolsData[modalKey] : {}} tokenOutImage={tokenOutImage} isChartFlag={isChartFlag} setIsChartFlag={setIsChartFlag} isBuyFlag={isBuyFlag} setIsBuyFlag={setIsBuyFlag} isFavorite={isFavorite} setIsFavorite={setIsFavorite} showShareModal={showShareModal} setShowShareModal={setShowShareModal} poolInfo={poolInfo} setPoolInfo={setPoolInfo} isBuyMobile={isBuyMobile} setIsBuyMobile={setIsBuyMobile} showButton={showButton} setShowButton={setShowButton} favArray={favArray} setFavArray={setFavArray} discountListing={discountListing} />
                    </TabPanel>
                  }
                  <TabPanel value="buyTokens" className='p-0'>
                      <PoolSearch setIsChartFlag={setIsChartFlag} setIsFavorite={setIsFavorite} setDiscountListing={setDiscountListing} poolRouterAddress={poolRouterAddress} showShareModal={showShareModal} setShowShareModal={setShowShareModal} poolInfo={poolInfo} setPoolInfo={setPoolInfo} favPoolFlag={favPoolFlag} setFavPoolFlag={setFavPoolFlag} favArray={favArray} setFavArray={setFavArray}  isConnected={isConnected} tokenAddress={query.tokenAddress} formattedPoolsData={formattedPoolsData} setFormattedPoolsData={setFormattedPoolsData} dataList={allData} loading={loading} setIsBuyFlag={setIsBuyFlag} setModalKey={setModalKey} />
                  </TabPanel>
                  <TabPanel value="twitterTokens">
                    {(
                      <TwitterPoolsLayout />
                    )}
                  </TabPanel>
                  <TabPanel value="walletTokens">
                    <AssignedPools />
                  </TabPanel>
                </TabsBody>
              </StyledTabs>
            </div>

            <Transition appear show={isOpenModal} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setIsOpenModal(false)}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="max-w-[500px] max-h-[730px] overflow w-full transform rounded-[20px] bg-gray-200 px-4 pt-4 pb-8 text-left align-middle font-bold text-[#566C90] shadow-[0_0_12px_8px_rgba(28,118,255,0.5)] transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-md flex w-full font-medium leading-6 text-[#8295B3] md:text-lg"
                      >
                        <div className="flex w-full justify-end">
                          <div className="flex">
                            <button
                              type="button"
                              className="h-6 w-6 items-center rounded-md border border-transparent bg-transparent text-white hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                              onClick={() => setIsOpenModal(false)}
                            >
                              <XMarkIcon />
                            </button>
                          </div>
                        </div>
                      </Dialog.Title>
                      <div className="text-[#566B90]">
                      <div className="flex w-full justify-center">
                        {buyFromPoolStarted && !buyFromPoolWaitForTransaction.isSuccess && (
                          <div>
                            <div className="flex-col p-4">
                              <div>Transaction Processing</div>
                              <video className="-mt-16 h-auto w-full max-w-full" autoPlay muted loop>
                                <source src="/videos/dswap_loader.webm" type="video/webm" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          </div>
                        )}
                        {buyFromPoolWaitForTransaction.isSuccess && (
                          <div>
                            <div className="flex-col justify-center text-center">
                              <div className="py-2">Purchase of {modalKey !== -1 && formattedPoolsData[modalKey] && formattedPoolsData[modalKey].tokenName} Successful</div>
                              <div className="flex justify-center text-center">
                                <CheckCircleIcon className="h-[12rem] w-[12rem] text-green-400" />
                              </div>
                              <div className="flex justify-center text-center text-xs">
                                <a>Transaction Details</a>
                                <a
                                  className="flex items-center px-1"
                                  href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
                                </a>
                              </div>
                              <div className="mt-2">
                                <button
                                  className="w-full rounded-2xl bg-blue-400 p-2 text-white hover:bg-blue-500"
                                  onClick={() => handleCloseModal()}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {buyFromPoolWaitForTransaction.isError && (
                          <div>
                            <div className="flex-col justify-center p-4 text-center">
                              <div className="py-2">Purchase of {modalKey !== -1 && formattedPoolsData[modalKey] && formattedPoolsData[modalKey].tokenName} Failure</div>
                              <div className="flex justify-center text-center">
                                <XCircleIcon className="h-[12rem] w-[12rem] text-red-400" />
                              </div>
                              <div className="flex justify-center text-xs">
                                <a>Transaction Details</a>
                                <a
                                  className="flex items-center px-1"
                                  href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
                                </a>
                              </div>
                              <div className="mt-2">
                                <button
                                  className="w-full rounded-2xl bg-blue-400 p-2 text-white hover:bg-blue-500"
                                  onClick={() => setIsOpenModal(false)}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
                </div>
                </Dialog>
            </Transition>

            {!isNarrowScreen && (
              <Favorites isNarrowScreen={isNarrowScreen} tokenImage={tokenImage} marketPricesFrom={marketPrices} inputTokenPrice={inputTokenPrice} setInputTokenPrice={setInputTokenPrice} inputTokenAmount={inputTokenAmount} setInputTokenAmount={setInputTokenAmount} outputTokenPrice={outputTokenPrice} setOutputTokenPrice={setOutputTokenPrice} isBuyPrice={isBuyPrice} setIsBuyPrice={setIsBuyPrice} outputTokenAmount={outputTokenAmount} setOutputTokenAmount={setOutputTokenAmount} inputValue={inputValue} setInputValue={setInputValue} modalKey={modalKey} formattedPoolsData={formattedPoolsData} singlePoolsData={modalKey >= 0 ? formattedPoolsData[modalKey] : {}} tokenOutImage={tokenOutImage} isChartFlag={isChartFlag} setIsChartFlag={setIsChartFlag} isBuyFlag={isBuyFlag} setIsBuyFlag={setIsBuyFlag} isFavorite={isFavorite} setIsFavorite={setIsFavorite} showShareModal={showShareModal} setShowShareModal={setShowShareModal} poolInfo={poolInfo} setPoolInfo={setPoolInfo} isBuyMobile={isBuyMobile} setIsBuyMobile={setIsBuyMobile} showButton={showButton} setShowButton={setShowButton} favArray={favArray} setFavArray={setFavArray} discountListing={discountListing} setModalKey={setModalKey}/>
            )}
          </div>
        {/* )} */}
      </div>
    </>
  )
}