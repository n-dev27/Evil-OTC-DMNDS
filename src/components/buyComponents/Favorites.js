import React, { Fragment, useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'
import { utils } from 'ethers'
import { toast } from "react-hot-toast";
import { Dialog, Transition } from '@headlessui/react'
import { useAccount, useBalance, useNetwork, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { PlusCircleIcon, ChartBarIcon, ShareIcon, PlusIcon, InformationCircleIcon, XMarkIcon, ChevronRightIcon, ArrowLeftIcon, XCircleIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import ShareModal from './ShareModal';
import { getSvgLogoPath } from '../../assets/symbol/svgIcons';
import { getVestingSchedule } from '../../utils/getVestingSchedule';
import { LayoutContext } from '../layout/layout';
import { deleteList, getOneList } from '../../services/favListServices';
import { getTokenMeta, getTokenPair, getTokenPrice2 } from '../../services/tokenInfoServices';
import { countLeadingZerosAfterDecimal } from '../../utils/countDecimals';
import isEmpty from '../../utils/isEmpty';
import diamondSwapABI from '../../constants/contracts/diamondABI.json';
import star_1 from '../../assets/star_1.svg';
import Group from '../../assets/favorite_empty.svg';
import back from '../../assets/back_logo.svg';
import chart_logo from '../../assets/chart.svg';
import group_chart from '../../assets/group_chart.svg';
import Arrow_Icon from '../../assets/arrows_swap.svg'
import walletIcon from '../../assets/bal_logo.svg';
import checkLogo from '../../assets/check_logo.svg'

const style = {
  wrapper: 'flex px-8 pt-5 pb-8 justify-center h-full w-full',
  buyContainer:
    'relative h-full overflow-y-auto xs:flex-col md:flex pt-8 w-2/3 bg-[rgba(22,41,48,0.8)] shadow-[rgba(0,0,0,0.16)] rounded-[20px]',
  backContainer:
    'h-full overflow-y-auto xs:flex-col w-full justify-center rounded-xl',
  nav: `flex justify-stretch max-w-[530px] w-5/6 m-auto bg-white bg-opacity-10 border border-slate-400 border-opacity-5 rounded-lg`,
  navItem: `text-xl font-bold w-1/3 px-2 md:px-4 py-2 items-center justify-center text-white/50 enabled:hover:bg-[#d3d7db] hover:text-[#566B90] hover:text-black text-xs md:text-lg cursor-pointer rounded-lg`,
  activeNavItem: `text-xl font-bold w-1/3 px-2 md:px-4 py-2 items-center shadow-[_-12.572383880615234px_18.85857582092285px_25.14476776123047px_rgba(130,149,179,0.24)] bg-[#619FFF] text-white text-xs md:text-lg rounded-xg`,
  loadingStyle: `flex justify-center items-center`,

  buyButton:
    'enabled:bg-[rgba(70,147,163,1)] disabled:bg-[#B9BCC7]/50 cursor-pointer w-full text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center',
  confirmationBuyButton:
    'customShare enabled:bg-[rgba(70,147,163,1)] disabled:bg-[#B9BCC7]/50 enabled:hover:scale-105 w-full shadow text-[rgba(255,255,255,0.8)] rounded-full py-3 text-sm font-[Inter] font-semibold flex items-center justify-center enabled:cursor-pointer border-[1.2px] border-[rgba(255,255,255,0.1)]',
  CancelButton: 'bg-slate-700 hover:scale-105 w-full shadow text-white rounded-3xl py-4 text-2xl font-roboto flex items-center justify-center enabled:cursor-pointer',

  sellInput: 'flex w-full min-h-[100px] justify-between bg-[rgba(255,255,255,0.05)] rounded-[6px] border-[0.62px] border-[rgba(255,255,255,0.1)] p-3',
  sellInputText: 'text-left w-full text-xs sm:text-sm text-[rgba(255,255,255,0.5)] font_[Inter]',
  sellInputBalanceContainer: 'flex flex-col gap-1',
  sellInputBalance: 'flex w-full justify-end items-center gap-1',
  sellInputSelector: 'flex justify-start items-center gap-2',
  sellInputMaxButton:
    'flex justify-center text-[rgba(70,147,163,1)] text-[10px] font-bold font_Inter items-center hover:animate-pulse',
  sellInputInputContainer: 'flex justify-end items-center pt-1',
  sellInputAmount:
    'defaultPlaceholder flex w-full justify-end text-[rgba(255,255,255,0.8)] font-[Abel] bg-transparent text-[20px] border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellInputValue: 'flex w-full justify-end text-sm text-[rgba(255,255,255,0.5)] font-[Abel]',

  sellOutput: 'flex w-full min-h-[100px] justify-between bg-[rgba(255,255,255,0.05)] rounded-[6px] border-[0.62px] border-[rgba(255,255,255,0.1)] p-3',
  sellOutputText: 'text-left w-full text-xs sm:text-sm text-[rgba(255,255,255,0.5)] font_[Inter]',
  sellOutputBalanceContainer: 'flex flex-col gap-1',
  sellOutputBalance: 'flex w-full justify-end items-center gap-1',
  sellOutputSelector: 'flex justify-start items-center gap-2',
  sellOutputInputContainer: 'flex justify-end items-center pt-1',
  sellOutputAmount:
  'defaultPlaceholder flex w-full justify-end text-[rgba(255,255,255,0.8)] font-[Abel] bg-transparent text-[20px] border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellOutputValue: 'flex w-full justify-end text-sm text-[rgba(255,255,255,0.5)] font-[Abel]',
};

export default function Favorites({ isNarrowScreen, tokenImage, marketPricesFrom, inputTokenPrice, setInputTokenPrice, inputTokenAmount, setInputTokenAmount, outputTokenPrice, setOutputTokenPrice, isBuyPrice, setIsBuyPrice, outputTokenAmount, setOutputTokenAmount, inputValue, setInputValue, modalKey, formattedPoolsData, singlePoolsData, tokenOutImage, isChartFlag, setIsChartFlag, isBuyFlag, setIsBuyFlag, isFavorite, setIsFavorite, showShareModal, setShowShareModal, poolInfo, setPoolInfo, isBuyMobile, setIsBuyMobile, showButton, setShowButton, favArray, setFavArray, discountListing, setModalKey }) {
  const router = useRouter();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  const { data: chainData } = useBalance({
    address: address,
  });

  const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT
  let QUICKI_URL = "https://coinando.com/static/assets/coins/quick-intel-logo.png";

  let chainSymbol = chainData?.symbol ? chainData?.symbol : 'ETH';
  let chainDecimals = chainData?.decimals ? chainData?.decimals : 18;
  let chainToCheck = 'ethereum';

  if (chain?.id == 42161) {
    chainToCheck = 'arbitrum';
  };

  const inputTokenBalance = useBalance({
    address: address,
  })

  const outputTokenBalance = useBalance({
    address: address,
    token: modalKey !== -1 ? singlePoolsData?.tokenAddress : ''
  });

  const tokenInputBalance = inputTokenBalance?.data?.formatted;
  const tokenOutputBalance = outputTokenBalance?.data?.formatted;

  const poolType = modalKey !== -1 ? singlePoolsData && singlePoolsData && singlePoolsData?.poolValue : null;
  const buyTokenAddress = modalKey !== -1 ? singlePoolsData && singlePoolsData?.poolAddress : null;
  const buyTokenDecimals = modalKey !== -1 ? singlePoolsData && singlePoolsData?.tokenDecimals : null;
  const buyTokenFixedPrice = modalKey !== -1 ? singlePoolsData && (singlePoolsData?.poolData_4?.toString() * utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)) / 10 ** chainDecimals : null;
  const buyTokenPrice = modalKey !== -1 ? singlePoolsData && singlePoolsData?.poolData_4.toString() : null;
  const buyTokenAmountAvailable = modalKey !== -1 ? singlePoolsData && parseFloat(utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)).toFixed(5) : null;
  const buyTokenNativePrice = modalKey !== -1 ? singlePoolsData && marketPricesFrom?.priceNative : null;
  const discountValue = modalKey !== -1 ? singlePoolsData && singlePoolsData?.poolData_3 : null;

  const { token, setToken, isFavMobile, setIsFavMobile, isChartMobile, setIsChartMobile, favValues, tokenListFlag, setTokenListFlag, poolListFlag, setPoolListFlag, chainTokenPrice, setChainTokenPrice } = useContext(LayoutContext);
  const [viewIndex, setViewIndex] = useState(null);
  const [favTokenList, setFavTokenList] = useState([]);
  const [favPoolList, setFavPoolList] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [outputTokenMarketAmount, setOutputTokenMarketAmount] = useState(true);
  const [clickIndex, setClickIndex] = useState(false);
  const [clickEthPrice, setClickEthPrice] = useState(false);
  const [clickBuyPriceEth, setClickBuyPriceEth] = useState(false);
  const [clickBuyPrice, setClickBuyPrice] = useState(false);
  const [isConfirmation, setIsConfirmation] = useState(true);

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
      // handleCancel();
      console.log('Success', buyFromPoolTokenData);
    },
  });

  const handleDisFavorite = async (index) => {
    const newArray = favTokenList;
    newArray.slice(index);
    setFavTokenList(newArray);
    const response = await deleteList(address, favTokenList[index].tokenAddress, '');
    console.log('delete token response on favorite == ', response);

    // Fetch the updated list after delete operation
    const favList = await getOneList(address);
    setFavArray(favList?.data.data);
    setTokenListFlag(!tokenListFlag);
  };

  const handleDisPoolsFavorite = async(pool, index) => {
    const newArray = favPoolList;
    newArray.slice(index)
    setFavPoolList(newArray);
    const response = await deleteList(address, '', pool.poolAddress);
    console.log('delete pool response on favorite == ', response);

    // Fetch the updated list after delete operation
    const favList = await getOneList(address);
    setFavArray(favList?.data.data);
    setPoolListFlag(!poolListFlag);
  };

  const handleListClick = (index, pool) => {
    const indexOf = formattedPoolsData.findIndex(value => value.poolAddress.toLowerCase() === favPoolList[index].poolAddress.toLowerCase())
    setModalKey(indexOf);

    setClickIndex(index);
    setClickEthPrice(marketPrices[index]?.priceNative)
    setClickBuyPriceEth(pool.poolData_3 === 0 ? parseFloat(marketPrices[index]?.priceNative).toFixed(4) : parseFloat(marketPrices[index]?.priceNative * (100 - pool.poolData_3 / 10) / 100).toFixed(4))
    setClickBuyPrice(pool.poolData_3 === 0 ? parseFloat(marketPrices[index]?.priceUsd).toFixed(4) : parseFloat(marketPrices[index]?.priceUsd * (100 - pool.poolData_3 / 10) / 100).toFixed(4))

    if (isNarrowScreen) {
      setIsFavMobile(true);
      setIsFavorite(false);
    } else {
      setIsFavorite(true);
    }
    setIsChartFlag(false);
    setIsBuyFlag(false);
  };

  const handleShare = (pool) => {
    setShowShareModal(true);
    setPoolInfo(pool);
  };

  const handleClickInputMax = () => {
    let outputDiamondCalculation = tokenInputBalance * inputTokenPrice / outputTokenPrice;
    let outPutTokenAvailable = modalKey !== -1 && utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)

    setInputTokenAmount(outputDiamondCalculation > outPutTokenAvailable ? outPutTokenAvailable * outputTokenPrice / inputTokenPrice : tokenInputBalance.toString())
  };

  useEffect(() => {
    const fetchData = async () => {
      // Also check if "token_list" itself is an array
      if (favArray?.token_list?.length !== 0 && Array.isArray(favArray?.token_list)) {
        let newArray1 = [];
        await Promise.all(favArray?.token_list.map(async (item, index) => {
          try {
            const tokenInfo = await getTokenMeta(item);
            if (tokenInfo?.data) {
              newArray1.push({ name: tokenInfo?.data[0].symbol, tokenAddress: item, image: tokenInfo?.data[0].logo });
            }
          } catch (error) {
            console.log('Error fetching token metadata on Favorite', error);
          }
        }));

        setFavTokenList(newArray1);
      } else {
        setFavTokenList([]);
      }

      // Also check if "pool_list" itself is an array
      if (favArray?.pool_list?.length !== 0 && Array.isArray(favArray?.pool_list)) {
        let newArray2 = [];
        const updatedMarketPrices = [];
        newArray2 = discountListing && discountListing.filter(pool => favArray?.pool_list.includes(pool.poolAddress));

        if (Array.isArray(newArray2)) {
          for (const pool of newArray2) {
            const marketPrice = await getTokenPair(pool.tokenAddress);
            const updatedPool = marketPrice?.data === null ? 
            { 
              priceUsd: 0,
              priceNative: 0,
            } : 
            { 
              priceUsd: parseFloat(marketPrice?.data[0]?.priceUsd),
              priceNative: parseFloat(marketPrice?.data[0]?.priceNative)
            };
            updatedMarketPrices.push(updatedPool);
          }
        }
        setFavPoolList(newArray2);
        setMarketPrices(updatedMarketPrices);
      } else {
        setFavPoolList([]);
      }

      const tokenPrice = await getTokenPrice2('ETH');
      setChainTokenPrice(tokenPrice?.data?.ETH?.USD);
    };

    fetchData();
  }, [favArray, discountListing]);

  useEffect(() => {
    if (buyFromPoolStarted) setIsBuyMobile(false);
  }, [buyFromPoolStarted]);

  const handleSearchToken = () => {
    if (modalKey !== -1) {
      setToken(singlePoolsData?.tokenAddress)
    }
  }

  return (
    <div className='flex'>
      {isFavorite &&
        <div className={`customShare customFavorite min-w-[458px] w-1/3 h-full flex flex-col gap-4 rounded-2xl p-6 overflow-y-auto`}>
          <div className='w-full flex gap-2 items-center'>
            <Image src={back} alt='back_logo' className='cursor-pointer'
              onClick={() => setIsFavorite(false)}
            ></Image>
            <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>Favorite</p>
          </div>

          <div className='w-full flex justify-between items-center'>
            <div className='flex gap-5 justify-center items-center'>
              <button className='w-14 h-14 rounded-full' onClick={() => handleSearchToken()}>
                {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol === 'QUICKI' ? (
                  <Image className='rounded-full' src={QUICKI_URL} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                ) : tokenOutImage ? (
                  <Image src={tokenOutImage} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                ) : <></>}
              </button>
              <div className='flex flex-col'>
                <p className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[28px] cursor-pointer' onClick={() => handleSearchToken()}>{modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}</p>
                <p className='text-[rgba(100,116,139,1)] text-lg font-[Inter]'>{chain?.name}</p>
              </div>
            </div>
            <div className='flex gap-1'>
              <button className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                onClick={() => handleShare(singlePoolsData)}
              >
                <ShareIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
              </button>
              <a
                className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                target="_blank"
                href={`https://arbiscan.io/address/${singlePoolsData?.poolCreator}`}
                rel="noreferrer"
                data-ripple-dark="true">
                <PlusIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
              </a>
            </div>
          </div>

          <div className='w-full flex flex-col gap-3'>
            <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] rounded-lg w-full p-5'>
              <div className='flex gap-1 items-center'>
                <p className='text-[rgba(100,116,139,1)] text-base font-[Inter]'>Buy Price</p>
                <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
              </div>
              {singlePoolsData?.poolData_4?.toString() > '0' ? (
                <>
                  <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>
                    {parseFloat((singlePoolsData.poolData_4?.toString() *
                      utils.formatUnits(singlePoolsData.poolData_5?.toString(), singlePoolsData?.tokenDecimals)) /
                      10 ** 18).toFixed(2)}{' '}
                    {chainSymbol}
                  </p>
                  <div className='flex gap-3'>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      {(
                        Number(
                          ((singlePoolsData.poolData_4?.toString() *
                            utils.formatUnits(
                              singlePoolsData.poolData_5?.toString(),
                              singlePoolsData?.tokenDecimals
                            )) /
                            10 ** 18) *
                          chainTokenPrice
                        )?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      )} USD
                    </p>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>
                    {isEmpty(favValues) ? marketPrices[clickIndex]?.priceNative ? clickBuyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol : favValues?.marketPrices?.priceNative ? favValues?.buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                  </p>
                  <div className='flex gap-3'>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      {isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd ? '$' + clickBuyPrice : '-' : favValues?.marketPrices?.priceUsd ? '$' + favValues?.buyPrice : '-'} USD
                    </p>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className='flex justify-between bg-[rgba(255,255,255,0.05)] rounded-lg w-full p-5'>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-1 items-center'>
                  <p className='text-[rgba(100,116,139,1)] text-base font-[Inter]'>Market Price</p>
                  <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                </div>
                <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>{parseFloat(isEmpty(favValues) ? clickEthPrice : favValues?.ethPrice).toFixed(4)} ETH</p>
                <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>${parseFloat(isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd : favValues?.marketPrices?.priceUsd).toFixed(2)} USD</p>
              </div>
              <div className='flex flex-col gap-3 justify-center items-center'>
                <Image src={chart_logo} alt='chart' ></Image>
                <button className='text-[rgba(70,147,163,1)] text-xs font-[Inter] cursor-pointer'
                  onClick={() => {
                    setIsChartFlag(true);
                    setIsFavorite(false);
                    setIsBuyFlag(false);
                  }}
                >See chart</button>
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] rounded-lg w-full p-5'>
                <div className='flex gap-1 items-center'>
                  <p className='text-[rgba(100,116,139,1)] text-base font-[Inter]'>Tokens Remaining</p>
                  <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                </div>
                <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>
                  {Number(
                    utils.formatUnits(
                      singlePoolsData.poolData_5.toString(),
                      singlePoolsData.tokenDecimals
                    )
                  ).toLocaleString()}
                </p>
                <p className='text-[rgba(255,255,255,0.8)] text-[14px] font-[Inter]'>Partial buys allowed</p>
              </div>
              <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] rounded-lg w-full p-5'>
                <div className='flex gap-1 items-center'>
                  <p className='text-[rgba(100,116,139,1)] text-base font-[Inter]'>Vesting Schedule</p>
                  <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                </div>
                <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>
                  {singlePoolsData?.poolData_2?.toString() > '0' ? (
                    singlePoolsData?.poolData_2?.toString() / '10' + '% upfront'
                  ) : '-'}
                </p>
                <p className='text-[rgba(255,255,255,0.8)] text-[14px] font-[Inter]'>
                  {singlePoolsData?.poolData_1?.toString() > '0' ? (
                    `Then, ${singlePoolsData?.poolData_1?.toString() / '10'}%/ ${getVestingSchedule(singlePoolsData?.poolData_0?.toString())}`
                  ) : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className='w-full flex flex-col gap-[10px]'>
            <button className={`font_Inter font-bold py-3 rounded-full bg-[rgba(70,147,163,1)] w-full text-sm text-[rgba(255,255,255,0.8)] flex items-center justify-center border-[1.2px] border-[rgba(255,255,255,0.1)]`}
              onClick={() => {
                setIsBuyFlag(true);
                setIsFavorite(false);
              }}
            >
              Buy Now
            </button>
            <span className='w-full text-center text-xs text-[rgba(100,116,139,1)] font-[Inter]'>
              Listed {new Date(
                Number(singlePoolsData?.poolCreatedTimestamp),
              ).toLocaleDateString('en-US', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              })}
            </span>
          </div>
        </div>
      } 
      
      {isChartFlag &&
      (
        <div className={`customShare customFavorite relative min-w-[458px] w-1/3 h-full flex flex-col gap-4 rounded-2xl p-6 overflow-y-auto`}>
          <div className='w-full flex gap-2 items-center'>
            <Image src={back} alt='back_logo' className='cursor-pointer'
              onClick={() => {
                setIsChartFlag(false);
                setIsFavorite(true);
              }}
            ></Image>
            <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>Chart</p>
          </div>

          <div className='w-full flex justify-between items-center'>
            <div className='flex gap-3 justify-center items-center'>
              <button className='w-14 h-14 rounded-full' onClick={() => handleSearchToken()}>
                {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol === 'QUICKI' ? (
                  <Image className='rounded-full' src={QUICKI_URL} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                ) : tokenOutImage ? (
                  <Image src={tokenOutImage} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                ) : <></>}
              </button>
              <div className='flex flex-col justify-start'>
                <p className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[28px] cursor-pointer' onClick={() => handleSearchToken()}>{modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}</p>
                <p className='text-[rgba(100,116,139,1)] text-lg font-[Inter]'>{chain?.name}</p>
              </div>
            </div>
            <div className='flex justify-center gap-1'>
              <button className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                onClick={() => handleShare(singlePoolsData)}
              >
                <ShareIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
              </button>
              <a
                className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                target="_blank"
                href={`https://arbiscan.io/address/${singlePoolsData?.poolCreator}`}
                rel="noreferrer"
                data-ripple-dark="true">
                <PlusIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
              </a>
            </div>
          </div>

          <div className='w-full flex flex-col gap-3'>
            <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] rounded-lg w-full p-5'>
              <div className='flex gap-1 items-center'>
                <p className='text-[rgba(100,116,139,1)] text-base font-[Inter]'>Buy Price</p>
                <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
              </div>
              {singlePoolsData?.poolData_4?.toString() > '0' ? (
                <>
                  <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>
                    {parseFloat((singlePoolsData.poolData_4?.toString() *
                      utils.formatUnits(singlePoolsData.poolData_5?.toString(), singlePoolsData?.tokenDecimals)) /
                      10 ** 18).toFixed(2)}{' '}
                    {chainSymbol}
                  </p>
                  <div className='flex gap-3'>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      {(
                        Number(
                          ((singlePoolsData.poolData_4?.toString() *
                            utils.formatUnits(
                              singlePoolsData.poolData_5?.toString(),
                              singlePoolsData?.tokenDecimals
                            )) /
                            10 ** 18) *
                          chainTokenPrice
                        )?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      )} USD
                    </p>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>
                    {isEmpty(favValues) ? marketPrices[clickIndex]?.priceNative ? clickBuyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol : favValues?.marketPrices?.priceNative ? favValues?.buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                  </p>
                  <div className='flex gap-3'>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      {isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd ? '$' + clickBuyPrice : '-' : favValues?.marketPrices?.priceUsd ? '$' + favValues?.buyPrice : '-'} USD
                    </p>
                    <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>
                      Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] rounded-t-lg w-full px-5 pt-5'>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-1 items-center'>
                  <p className='text-[rgba(100,116,139,1)] text-base font-[Inter]'>Market Price</p>
                  <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                </div>
                <p className='text-[rgba(255,255,255,0.8)] text-[32px] font-[Abel]'>{parseFloat(isEmpty(favValues) ? clickEthPrice : favValues?.ethPrice).toFixed(4)} ETH</p>
                <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter]'>${parseFloat(isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd : favValues?.marketPrices?.priceUsd).toFixed(2)} USD</p>
              </div>
              <div className='w-full flex flex-col gap-3 justify-center items-center'>
                <Image src={group_chart} alt='group_chart' ></Image>
              </div>
            </div>
          </div>
        </div>
      )} 

      {isBuyFlag &&
      ( 
        <div className={`customShare customFavorite relative min-w-[458px] w-1/3 h-full flex flex-col justify-center gap-4 rounded-2xl px-6 pt-8 pb-6 overflow-y-auto`}>
          <button
            type="button"
            className="absolute top-7 right-5 h-6 w-6 flex items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.2)] text-center"
            onClick={() => {
              setIsBuyFlag(false);
              setIsChartFlag(false);
              setIsFavorite(true);
            }}
          >
            <XMarkIcon className='w-6 h-6 text-[rgba(255,255,255,0.2)] hover:text-white'/>
          </button>
          <div className='w-full flex flex-col justify-center items-center gap-3'>
            <div className="text-[rgba(255,255,255,0.8)] text-2xl font-[Inter] font-semibold">Buy Confirmation</div>
            <div className="text-[rgba(255,255,255,0.6)] text-base font-[Inter]">
              Verify the buy details below to buy {chain?.nativeCurrency?.symbol} for {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}
            </div>
          </div>

          <div className='relative w-full flex flex-col gap-2'>
            <div className={style.sellInput}>
              <div className="flex flex-col gap-5 w-max">
                <div className={style.sellInputText}>You&apos;ll spend:</div>
                <div className="flex items-center">
                  <div className={style.sellInputSelector}>
                    {tokenImage ? (
                      <Image src={tokenImage} alt={`${chain?.nativeCurrency?.symbol}`} height={24} width={24} />
                    ) : (
                      <></>
                    )}
                    <a className="text-[rgba(255,255,255,0.8)] justify-start text-base font-[Inter]">
                      {chain?.nativeCurrency?.symbol}
                    </a>
                    <ChevronRightIcon className="text-[rgba(255,255,255,0.4)] w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className={style.sellInputBalanceContainer}>
                <div className='flex justify-end gap-[4px]'>
                  <div className={style.sellInputBalance}>
                    <Image src={walletIcon} alt="bal_logo" height={12} width={12} className='text-white'></Image>
                    {address && tokenInputBalance ? (
                      <div className='text-[rgba(255,255,255,0.5)] font-[Abel] text-sm'>{Number(parseFloat(tokenInputBalance).toFixed(4))?.toLocaleString()}</div>
                      ) : (
                        <div>-</div>
                      )}
                  </div>
                  <div className={style.sellInputMaxButton}>
                    <button onClick={() => handleClickInputMax()}>MAX</button>
                  </div>
                </div>
                <div className={style.sellInputInputContainer}>
                  <input
                    className={style.sellInputAmount}
                    disabled={modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue == '1'}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder="0.0"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    minLength="1"
                    maxLength="79"
                    value={modalKey !== -1 && singlePoolsData && (singlePoolsData?.poolValue === '1' ?
                      Number((utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) * outputTokenPrice / inputTokenPrice).toString())?.toLocaleString(undefined, { maximumFractionDigits: 10 })
                        : outputTokenMarketAmount ? inputTokenAmount : inputValue)}
                      // value={outputTokenMarketAmount ? inputTokenAmount : inputValue}
                    onChange={address
                      ? event => {
                        setInputTokenAmount(event.target.value);
                        setOutputTokenMarketAmount(true);
                      }
                      : null}
                    onKeyPress={event => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                        event.preventDefault()
                      }
                    } } />
                </div>
                {modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue === '1' ?
                  (
                    <div className={style.sellInputValue}>
                      {'$' + (100 - singlePoolsData?.poolData_3 / 10) / 100 * Number((utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) * outputTokenPrice / inputTokenPrice) * inputTokenPrice).toString()?.toLocaleString(undefined, { maximumFractionDigits: 10 }) + ''}
                    </div>
                  )
                  : modalKey !== -1 && singlePoolsData && outputTokenMarketAmount ? (inputTokenAmount && (
                    <div className={style.sellInputValue}>
                      {'$' + (100 - singlePoolsData?.poolData_3 / 10) / 100 * Number(inputTokenAmount * inputTokenPrice) + ''}
                    </div>
                  )) : (
                    inputValue && (
                      <div className={style.sellInputValue}>
                        {'$' + (100 - singlePoolsData?.poolData_3 / 10) / 100 * Number(inputValue * inputTokenPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ''}
                      </div>
                    )
                  )}
              </div>
            </div>

            <div className='absolute top-[calc(50%-14px)] left-[calc(50%-14px)] flex justify-center items-center bg-[rgba(60,34,40,1)] rounded-[7px] x-7 h-7 p-[7px]'>
              <Image src={Arrow_Icon} alt="arrow_logo" className='w-[14px] h-[14px]'></Image>
            </div>

            <div className={style.sellOutput}>
              <div className="flex flex-col gap-5 w-max">
                <div className={style.sellOutputText}>You&apos;ll receive</div>
                <div className={style.sellOutputSelector}>
                    {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol === 'QUICKI' ? (
                      <Image className='rounded-full' src={QUICKI_URL} alt={`${singlePoolsData?.tokenSymbol}`} height={24} width={24} />
                    ) : tokenOutImage ? (
                      <Image src={tokenOutImage} alt={`${singlePoolsData?.tokenSymbol}`} height={24} width={24} />
                    ) : <></>}
                    <a className="text-[rgba(255,255,255,0.8)] justify-start text-base font-[Inter]">
                      {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}
                    </a>
                    <ChevronRightIcon className="text-[rgba(255,255,255,0.4)] w-3 h-3" />
                </div>
              </div>
              <div className={style.sellOutputBalanceContainer}>
                <div className='flex justify-end gap-[4px]'>
                  <div className={style.sellOutputBalance}>
                    <Image src={walletIcon} alt="bal_logo" height={12} width={12} className='text-white'></Image>
                    {address && tokenOutputBalance ? (
                      <div className='text-[rgba(255,255,255,0.5)] font-[Abel] text-sm'>{Number(parseFloat(tokenOutputBalance).toFixed(4))?.toLocaleString()}</div>
                      ) : (
                        <div>-</div>
                      )}
                  </div>
                </div>
                <div className={style.sellOutputInputContainer}>
                  <input
                    className={style.sellOutputAmount}
                    type="text"
                    disabled={modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue == '1'}
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder="0.0"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    minLength="1"
                    maxLength="79"
                    value={modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue == '1' ? utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) : outputTokenAmount}
                    onChange={
                      event => {
                        setOutputTokenAmount(event.target.value)
                        setOutputTokenMarketAmount(false)
                      } }
                    onKeyPress={event => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                        event.preventDefault()
                      }
                    } } />
                </div>

                <div className='flex justify-end gap-2'>
                  <div className={style.sellOutputValue}>
                    Available:&nbsp;
                    {modalKey !== -1 && singlePoolsData && Number(
                      utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)
                    )?.toLocaleString()}
                  </div>
                  <button 
                    className={style.sellInputMaxButton} 
                    onClick={() => {
                      setOutputTokenAmount(singlePoolsData && utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals))
                      setOutputTokenMarketAmount(false)
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-1 items-center">
              <InformationCircleIcon className="h-3 w-3" color='rgba(255,255,255,0.5)'/>
              <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Output is estimated</p>
            </div>
            <div className="text-[rgba(255,255,255,0.8)] text-[11px] font-[Inter]">
              You will receive at least
              <span className='font-semibold'>&nbsp;{modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue === '1' ? utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) : Number(outputTokenAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}&nbsp;</span>
              {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol} or the transaction will revert.
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Market Price Per Token:</p>
              <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">{'$' + parseFloat(isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd : favValues?.marketPrices?.priceUsd).toFixed(4) + ' USD'} / {parseFloat(marketPrices[clickIndex]?.priceNative).toFixed(4) + ' ETH'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Discount:</p>
              <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">{modalKey !== -1 && singlePoolsData && singlePoolsData?.poolData_3?.toString() > '0' ? singlePoolsData?.poolData_3?.toFixed(2) / 10 + '%' : '-'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Your Price Per Token:</p>
              <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">{'$' + parseFloat(isBuyPrice.buyPrice).toFixed(4) + ' USD'} / {parseFloat(isBuyPrice.buyPriceEth).toFixed(4) + ' ETH'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Vesting:</p>
              <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">
                {modalKey !== -1 && singlePoolsData && singlePoolsData?.poolData_0?.toString() > '0' ? (
                    singlePoolsData?.poolData_2?.toString() / '10' + '%'
                  ) : (
                    '100%'
                )} upfront{' '}
                {modalKey !== -1 && singlePoolsData && singlePoolsData?.poolData_0?.toString() > '0' ? (
                  <>
                    {singlePoolsData?.poolData_1?.toString() / '10'}% /{' '}
                    {getVestingSchedule(singlePoolsData?.poolData_0?.toString())}
                  </>
                ) : (
                  <>-</>
                )}
              </p>
            </div>
          </div>

          <button
            disabled={(modalKey !== -1 && poolType && (poolType == '2' || poolType == '3')
              ? !outputTokenAmount
              : modalKey !== -1 && singlePoolsData && !Number(
                utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)
              )?.toLocaleString()) || (buyFromPoolLoading || buyFromPoolStarted)}
              onClick={() => {
                buyFromPoolWrite?.();
              }}
            className={style.confirmationBuyButton}
          >
            {buyFromPoolLoading && <a className="animate-pulse text-[rgba(255,255,255,0.8)] text-sm font-[Inter]">Waiting for confirmation</a>}
            {!buyFromPoolLoading && !buyFromPoolStarted && <a className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Buy token</a>}
            {buyFromPoolWaitForTransaction.isSuccess && <a className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Buy token</a>}
          </button>
        </div>
      )}

      {!isFavorite && !isChartFlag && !isBuyFlag && (
        <div className={`customShare w-full xl:min-w-[458px] xl:w-1/3 h-full xs:flex-col xl:bg-[rgba(22,41,48,0.8)] rounded-2xl xl:px-4 pt-6 xl:pt-10 overflow-y-auto`}>
        {showShareModal && (
          <ShareModal isOpen={showShareModal} setIsOpen={setShowShareModal} poolInfo={poolInfo} />
        )}
        <div className='flex flex-col gap-2 w-full h-full'>
          <p className='hidden sm:flex text-[rgba(255,255,255,0.8)] text-2xl font-semibold px-4 font-[Inter]'>Favorites</p>
          <div className='flex flex-col w-full h-[calc(100vh-220px)] sm:h-[calc(100vh-300px)] gap-2'>
            {
              favTokenList?.length === 0 && favPoolList?.length === 0? (
                <div className='w-full h-full py-8 sm:py-[50px] px-4 flex flex-col justify-between items-center'>
                  <Image src={Group} alt='empty_logo' ></Image>
                  <p className='text-2xl sm:text-[28px] text-[rgba(100,116,139,0.5)] font-[Inter]'>No listing selected yet</p>
                </div>
            ) : (
                <>
                  <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter] font-semibold px-4 sm:pt-8'>Token</p>
                  <div className='flex flex-col w-full h-2/5 px-4 pt-4 gap-4 sm:gap-6 overflow-y-auto'>
                    {favTokenList?.length === 0 ? (
                      <div className='w-full h-full flex flex-col justify-between items-center'>
                        <Image src={Group} alt='empty_logo' width={140} height={140} ></Image>
                        <p className='text-sm sm:text-lg text-[rgba(100,116,139,0.5)] font-[Inter]'>No Favourite Tokens Yet</p>
                      </div>
                    ) : ( 
                      favTokenList && favTokenList.map((item, index) => {
                        const array = discountListing && discountListing.filter(data => data.tokenAddress.toLowerCase() === item.tokenAddress.toLowerCase());
                        let totalTokens = 0;
                        let totalDiscount = 0;
                        array && array.map(item => {
                          totalTokens = totalTokens + Number(item.poolData_5 / 10 ** 18);
                          totalDiscount = totalDiscount + Number(item.poolData_3 / 10);
                        })
                        return (
                          <div key={index} className='cursor-pointer relative w-full min-h-[70px] text-center gap-2 px-4 flex justify-between items-center rounded-lg border-[0.62px] border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]'
                            // onClick={() => handleTokenClick(item)}
                          >
                            <div className={`bg-[rgba(255,216,13,0.1)] z-20 absolute top-[-13px] left-[-13px] cursor-pointer rounded-full w-7 h-7 flex justify-center items-center shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                              onClick={() => handleDisFavorite(index)}
                            >
                              <Image className='w-3 h-3' src={star_1} alt='star_logo' ></Image>
                            </div>
                            <div className="flex items-center">
                              <button>
                                {item.name === 'QUICKI' ? (
                                  <img className='rounded-full' src={QUICKI_URL} alt={`${item.name}`} height={32} width={32} />
                                ) : item.image !== null ? (
                                  <img className='rounded-full' src={item.image} alt={`${item?.name}`} height={32} width={32} />
                                ) : (
                                  <a className="flex w-auto items-center justify-center text-center text-[6px] text-white">
                                    {item?.name}
                                  </a>
                                )}
                              </button>
                              <div className="flex flex-col justify-center pl-3 text-start">
                                <div className='text-[rgba(255,255,255,0.8)] text-base font-semibold font-[Inter]'>{item?.name}</div>
                                <div className="text-xs text-[rgba(100,116,139,1)] font-[Inter]">{chain?.name}</div>
                              </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                              <div className="inline-flex gap-2 items-center font-[Inter] text-xs text-[rgba(100,116,139,1)]">
                                  Tokens Available
                                <a className='text-[rgba(100,116,139,0.6)]'>
                                  {countLeadingZerosAfterDecimal(totalTokens)}
                                </a>
                              </div>
                              <div className="inline-flex gap-2 items-center font-[Inter] text-xs text-[rgba(100,116,139,1)]">
                                  Average Discount
                                <a className='text-[rgba(100,116,139,0.6)]'>
                                  {array && array.length !== 0 ? parseFloat(totalDiscount / array.length).toFixed(2) : 0}%
                                </a>
                              </div>
                            </div>
                          </div>
                        );}
                        )
                      )
                    }
                  </div>
                  <p className='text-[rgba(255,255,255,0.8)] text-base font-[Inter] font-semibold px-4 sm:pt-4'>Listing</p>
                  <div className={`flex flex-col w-full px-4 pt-4 h-3/5 gap-4 sm:gap-6 overflow-y-auto`}>
                    {favPoolList?.length === 0 ? (
                      <div className='w-full h-full flex flex-col justify-center items-center gap-2'>
                        <Image src={Group} alt='empty_logo' width={200} height={200} ></Image>
                        <p className='text-sm sm:text-lg text-[rgba(100,116,139,0.5)] font-[Inter]'>No Favourite Pools Yet</p>
                      </div>
                    ) : (
                    favPoolList && favPoolList.map((pool, index) => {
                      let tokenImg = getSvgLogoPath(pool.tokenSymbol);
                      const ethPrice = marketPrices[index]?.priceNative;
                      const buyPriceEth = pool.poolData_3 === 0 ? parseFloat(marketPrices[index]?.priceNative).toFixed(4) : parseFloat(marketPrices[index]?.priceNative * (100 - pool.poolData_3 / 10) / 100).toFixed(4);
                      const buyPrice = pool.poolData_3 === 0 ? parseFloat(marketPrices[index]?.priceUsd).toFixed(2) : parseFloat(marketPrices[index]?.priceUsd * (100 - pool.poolData_3 / 10) / 100).toFixed(2);
                      return (
                        <div key={index} className="cursor-pointer relative w-full min-h-[180px] flex text-center border-[0.62px] border-[rgba(255,255,255,0.1)] rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]"
                        >
                          <div className={`bg-[rgba(255,216,13,0.1)] z-20 absolute top-[-13px] left-[-13px] cursor-pointer rounded-full w-7 h-7 flex justify-center items-center shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                            onClick={() => handleDisPoolsFavorite(pool, index)}
                          >
                            <Image className='w-3 h-3' src={star_1} alt='star_logo' ></Image>
                          </div>
                          <div className='absolute w-full flex justify-end'>
                            <div className='flex justify-center items-center bg-[rgba(255,0,0,1)] text-white text-[9px] font_Inter font-bold py-[2px] pl-2 w-[140px] h-4 rounded-tr-lg rounded-bl-2xl'>
                              {pool.listingType ? 'FIXED PRICE LISTING' : 'MARKET PRICE LISTING'}
                            </div>
                          </div>
                          <div className="w-full h-full flex justify-between flex-col gap-2 px-4 py-8"
                            onClick={() => handleListClick(index, pool)}
                          >
                            <div className="flex justify-between">
                              <div className="flex items-center gap-[10px]">
                                {pool.tokenSymbol === 'QUICKI' ? (
                                  <Image className='rounded-full' src={QUICKI_URL} alt={`${pool.tokenSymbol}`} height={32} width={32} />
                                ) : tokenImg != '' ? (
                                  <Image src={tokenImg} alt={`${pool?.tokenSymbol}`} height={32} width={32} />
                                ) : (
                                  <a className="flex w-auto items-center justify-center text-center text-base text-[rgba(255,255,255,0.8)]">
                                    {pool?.tokenSymbol}
                                  </a>
                                )}
                                <div className="flex flex-col justify-start text-start">
                                  <div className={`text-[rgba(255,255,255,0.8)] text-base font-semibold font-[Inter]`}>
                                    {pool?.tokenName}
                                  </div>
                                  <div className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>{chain?.name}</div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-end gap-[6px]">
                                  <div className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>Market Price:</div>
                                  <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>{parseFloat(ethPrice).toFixed(2)} ETH</div>
                                </div>
                                <div className="flex items-center justify-end gap-[6px]">
                                  <div className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>Discount:</div>
                                  {pool.poolData_3?.toString() > '0' ? (
                                    <a className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                  ) : (
                                    <a className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>-</a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="flex flex-col gap-2">
                                <div className={`text-[rgba(100,116,139,1)] text-start text-xs font-[Inter]`}>Buy Price:</div>
                                {pool.poolData_4?.toString() > '0' ? (
                                  <div className="flex items-center gap-1">
                                    <a className="font-[Abel] text-lg text-[rgba(255,255,255,1)]">
                                      {parseFloat((pool.poolData_4?.toString() *
                                        utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                        10 ** 18).toFixed(2)}{' '}
                                      {chainSymbol}
                                    </a>
                                    <a className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter]">
                                      ($
                                      {(
                                        Number(
                                          ((pool.poolData_4?.toString() *
                                            utils.formatUnits(
                                              pool.poolData_5?.toString(),
                                              pool?.tokenDecimals
                                            )) /
                                            10 ** 18) *
                                          chainTokenPrice
                                        )?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                      )} USD)
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <a className="font-[Abel] text-lg text-[rgba(255,255,255,1)]">
                                      {marketPrices[index]?.priceNative ? buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                                    </a>
                                    <a className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter]">
                                      (${marketPrices[index]?.priceUsd ? buyPrice : '-'} USD)
                                    </a>
                                  </div>
                                )}
                                <div className='flex gap-4'>
                                  <div className='flex gap-1'>
                                    <a className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>
                                      Tokens:{' '}
                                    </a>
                                    <a className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                      {parseFloat(
                                        utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                      )?.toFixed(2)}
                                    </a>
                                  </div>
                                  <div className='flex gap-2'>
                                    <div className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>Vesting:</div>
                                    {pool.poolData_0?.toString() > '0' ? (
                                      <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                        {pool.poolData_2?.toString() / '10'}% released
                                      </div>
                                    ) : (
                                      <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>100% released</div>
                                    )}
                                    {pool.poolData_0?.toString() > '0' ? (
                                      <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                        +{pool.poolData_1?.toString() / '10'}% /{' '}
                                        {getVestingSchedule(pool.poolData_0?.toString())}
                                      </div>
                                    ) : (
                                      <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>-</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {viewIndex === index && showButton === true && (
                            <>
                              <button
                              onClick={() => {
                                if (isConnected) {
                                  setModalKey(index);
                                } else {
                                  toast.error('Please connect to your wallet', {
                                    style: {
                                      border: '1px solid #713200',
                                      padding: '16px',
                                      color: '#000000',
                                    },
                                    iconTheme: {
                                      primary: '#713200',
                                      secondary: '#FFFAEE',
                                    },
                                  });
                                }
                              } }
                              className={`text-xs font-roboto py-3 rounded-[14.50px] bg-[#1B75FF] w-full text-white flex items-center justify-center`}>
                              Buy Now
                              </button>
                              <div className='w-full flex justify-center items-center gap-2'>
                                <button
                                  className="flex h-6 items-center gap-1 rounded-full bg-[#1B75FF] px-4 text-white transition duration-300 hover:bg-sea-300/60"
                                  type="button"
                                  data-ripple-dark="true"
                                  onClick={() => handleShare(pool)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path></svg>
                                  <span className='font-[Inter] text-xs font-bold'>Share</span>
                                </button>
                                <a
                                  target="_blank"
                                  href={`https://arbiscan.io/address/${pool?.poolCreator}`}
                                  className="flex h-6 items-center gap-1 rounded-full bg-[#1B75FF] px-4 text-white transition duration-300 hover:bg-sea-300/60"
                                  rel="noreferrer"
                                  data-ripple-dark="true">
                                  <PlusCircleIcon className='w-3.5 h-3.5' />
                                  <span className='font-[Inter] text-xs font-bold'>Creator</span>
                                </a>
                                <a
                                  target="_blank"
                                  href={`https://www.dextools.io/app/en/arbitrum/pair-explorer/${pool?.tokenAddress}?t=1710741357763`}
                                  className="flex h-6 items-center gap-1 rounded-full bg-[#1B75FF] px-4 text-white transition duration-300 hover:bg-sea-300/60"
                                  rel="noreferrer"
                                  data-ripple-dark="true">
                                  <ChartBarIcon className='w-3.5 h-3.5' />
                                  <span className='font-[Inter] text-xs font-bold'>Chart</span>
                                </a>
                              </div>
                            </>
                            )}
                          </div>
                        </div>
                      );
                    }))}
                  </div>
                </>
              )
            }
          </div>
        </div>
        </div>
      )}

      {isFavMobile && <Transition appear show={isFavMobile} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => setIsFavMobile(false)}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex h-screen w-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="customShare bg-[rgba(22,41,48,1)] w-full h-screen flex flex-col p-5 pb-10">
                    <div className='w-full flex gap-2 items-center justify-between'>
                      <button className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                        onClick={() => {
                          setIsFavMobile(false);
                          setIsFavorite(false);
                        }}
                      >
                        <ArrowLeftIcon className='w-5 h-5' color='rgba(255,255,255,0.8)' />
                      </button>
                      <div className='flex gap-1'>
                        <button className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                          onClick={() => handleShare(singlePoolsData)}
                        >
                          <ShareIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
                        </button>
                        <a
                          className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                          target="_blank"
                          href={`https://arbiscan.io/address/${singlePoolsData?.poolCreator}`}
                          rel="noreferrer"
                          data-ripple-dark="true">
                          <PlusIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
                        </a>
                      </div>
                    </div>

                    <div className='flex flex-col justify-between h-full'>
                      <div className='flex flex-col gap-6'>
                        <div className='w-full flex flex-col gap-3 justify-center items-center'>
                          <button className='w-14 h-14 rounded-full'>
                            {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol === 'QUICKI' ? (
                              <Image className='rounded-full' src={QUICKI_URL} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                            ) : tokenOutImage ? (
                              <Image src={tokenOutImage} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                            ) : <></>}
                          </button>
                          <div className='flex flex-col'>
                            <p className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[28px]'>{modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}</p>
                            <p className='text-[rgba(100,116,139,1)] text-lg font-[Inter]'>{chain?.name}</p>
                          </div> 
                        </div>

                        <div className='w-full flex flex-col gap-3'>
                          <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] text-left rounded-lg w-full p-5'>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>Buy Price</p>
                              <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                            </div>
                            {singlePoolsData?.poolData_4?.toString() > '0' ? (
                              <>
                                <p className='text-[rgba(255,255,255,0.8)] text-[28px] font-[Abel]'>
                                  {parseFloat((singlePoolsData.poolData_4?.toString() *
                                    utils.formatUnits(singlePoolsData.poolData_5?.toString(), singlePoolsData?.tokenDecimals)) /
                                    10 ** 18).toFixed(2)}{' '}
                                  {chainSymbol}
                                </p>
                                <div className='flex gap-3'>
                                  <p className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                                    {(
                                      Number(
                                        ((singlePoolsData.poolData_4?.toString() *
                                          utils.formatUnits(
                                            singlePoolsData.poolData_5?.toString(),
                                            singlePoolsData?.tokenDecimals
                                          )) /
                                          10 ** 18) *
                                        chainTokenPrice
                                      )?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    )} USD
                                  </p>
                                  <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                    Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className='text-[rgba(255,255,255,0.8)] text-[28px] font-[Abel]'>
                                  {isEmpty(favValues) ? marketPrices[clickIndex]?.priceNative ? clickBuyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol : favValues?.marketPrices?.priceNative ? favValues?.buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                                </p>
                                <div className='flex gap-3'>
                                  <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                    {isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd ? '$' + clickBuyPriceEth : '- ' : favValues?.marketPrices?.priceUsd ? '$' + favValues?.buyPrice : '-'} USD
                                  </p>
                                  <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                    Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className='flex justify-between bg-[rgba(255,255,255,0.05)] rounded-lg w-full p-5'>
                            <div className='flex flex-col gap-2 text-left w-1/2'>
                              <div className='flex gap-1 items-center'>
                                <p className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>Market Price</p>
                                <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                              </div>
                              <p className='text-[rgba(255,255,255,0.8)] text-xl font-[Abel]'>{parseFloat(isEmpty(favValues) ? clickBuyPriceEth : favValues?.ethPrice).toFixed(4)} ETH</p>
                              <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>${parseFloat(isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd : favValues?.marketPrices?.priceUsd).toFixed(2)} USD</p>
                            </div>
                            <div className='flex flex-col gap-3 justify-center items-center w-1/2'>
                              <button className='text-[rgba(70,147,163,1)] text-xs font-[Inter] cursor-pointer'
                                onClick={() => {
                                  setIsChartMobile(true);
                                }}
                              >See chart</button>
                            </div>
                          </div>

                          <div className='flex gap-3'>
                            <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] text-left rounded-lg w-full p-5'>
                              <div className='flex gap-1 items-center'>
                                <p className='text-[rgba(100,116,139,1)] text-[13px] font-[Inter]'>Tokens Remaining</p>
                                <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                              </div>
                              <p className='text-[rgba(255,255,255,0.8)] text-lg font-[Abel]'>
                                {Number(
                                  utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)
                                )?.toLocaleString()}
                              </p>
                              <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>Partial buys allowed</p>
                            </div>
                            <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] text-left rounded-lg w-full p-5'>
                              <div className='flex gap-1 items-center'>
                                <p className='text-[rgba(100,116,139,1)] text-[13px] font-[Inter]'>Vesting Schedule</p>
                                <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                              </div>
                              <p className='text-[rgba(255,255,255,0.8)] text-lg font-[Abel]'>
                                {singlePoolsData?.poolData_2?.toString() > '0' ? (
                                  singlePoolsData?.poolData_2?.toString() / '10' + '% upfront'
                                ) : '-'}
                              </p>
                              <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                {singlePoolsData?.poolData_1?.toString() > '0' ? (
                                  `Then, ${singlePoolsData?.poolData_1?.toString() / '10'}%/ ${getVestingSchedule(singlePoolsData?.poolData_0?.toString())}`
                                ) : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='w-full flex flex-col gap-[10px]'>
                        <button className={`font_Inter font-bold py-3 rounded-full bg-[rgba(70,147,163,1)] w-full text-sm text-[rgba(255,255,255,0.8)] flex items-center justify-center border-[1.2px] border-[rgba(255,255,255,0.1)]`}
                          onClick={() => {
                            setIsBuyMobile(true);
                          }}
                        >
                          Buy Now
                        </button>
                        <span className='w-full text-center text-xs text-[rgba(100,116,139,1)] font-[Inter]'>
                          Listed {new Date(
                            Number(singlePoolsData?.poolCreatedTimestamp),
                          ).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>}

      {isBuyMobile && <Transition appear show={isBuyMobile} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => setIsBuyMobile(false)}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex h-screen w-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="customShare bg-[rgba(22,41,48,1)] w-full h-screen flex flex-col justify-between p-5 py-10 overflow-y-auto">
                  <button
                    type="button"
                    className="absolute top-7 right-5 h-6 w-6 flex items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.2)] text-center"
                    onClick={() => {
                      setIsBuyMobile(false);
                    }}
                  >
                    <XMarkIcon className='w-6 h-6 text-[rgba(255,255,255,0.2)] hover:text-white'/>
                  </button>
                  <div className='w-full flex flex-col justify-center items-center gap-3'>
                    <div className="text-[rgba(255,255,255,0.8)] text-xl font-[Inter] font-semibold">Buy Confirmation</div>
                    <div className="text-[rgba(255,255,255,0.6)] text-xs font-[Inter]">
                      Verify the buy details below to buy {chain?.nativeCurrency?.symbol} for {singlePoolsData?.tokenSymbol}
                    </div>
                  </div>

                  <div className='flex flex-col gap-6'>
                    <div className='relative w-full flex flex-col gap-2'>
                      <div className={style.sellInput}>
                        <div className="flex flex-col gap-5 w-max">
                          <div className={style.sellInputText}>You&apos;ll spend:</div>
                          <div className="flex items-center">
                            <div className={style.sellInputSelector}>
                              {tokenImage ? (
                                <Image src={tokenImage} alt={`${chain?.nativeCurrency?.symbol}`} height={24} width={24} />
                              ) : (
                                <></>
                              )}
                              <a className="text-[rgba(255,255,255,0.8)] justify-start text-base font-[Inter]">
                                {chain?.nativeCurrency?.symbol}
                              </a>
                              <ChevronRightIcon className="text-[rgba(255,255,255,0.4)] w-3 h-3" />
                            </div>
                          </div>
                        </div>
                        <div className={style.sellInputBalanceContainer}>
                          <div className='flex justify-end gap-[4px]'>
                            <div className={style.sellInputBalance}>
                              <Image src={walletIcon} alt="bal_logo" height={12} width={12} className='text-white'></Image>
                              {address && tokenInputBalance ? (
                                <div className='text-[rgba(255,255,255,0.5)] font-["Abel"] text-sm'>{Number(parseFloat(tokenInputBalance).toFixed(4))?.toLocaleString()}</div>
                                ) : (
                                  <div>-</div>
                                )}
                            </div>
                            <div className={style.sellInputMaxButton}>
                              <button onClick={() => handleClickInputMax()}>MAX</button>
                            </div>
                          </div>
                          <div className={style.sellInputInputContainer}>
                            <input
                              className={style.sellInputAmount}
                              disabled={modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue == '1'}
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              autoCorrect="off"
                              spellCheck="false"
                              placeholder="0.0"
                              pattern="^[0-9]*[.,]?[0-9]*$"
                              minLength="1"
                              maxLength="79"
                              value={modalKey !== -1 && singlePoolsData && (singlePoolsData?.poolValue === '1' ?
                                Number((utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) * outputTokenPrice / inputTokenPrice).toString())?.toLocaleString(undefined, { maximumFractionDigits: 10 })
                                  : outputTokenMarketAmount ? inputTokenAmount : inputValue)}
                                // value={outputTokenMarketAmount ? inputTokenAmount : inputValue}
                              onChange={address
                                ? event => {
                                  setInputTokenAmount(event.target.value);
                                  setOutputTokenMarketAmount(true);
                                }
                                : null}
                              onKeyPress={event => {
                                if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                  event.preventDefault()
                                }
                              } } />
                          </div>
                          {modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue === '1' ?
                            (
                              <div className={style.sellInputValue}>
                                {'$' + (100 - singlePoolsData?.poolData_3 / 10) / 100 * Number((utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) * outputTokenPrice / inputTokenPrice) * inputTokenPrice).toString()?.toLocaleString(undefined, { maximumFractionDigits: 10 }) + ''}
                              </div>
                            )
                            : modalKey !== -1 && singlePoolsData && outputTokenMarketAmount ? (inputTokenAmount && (
                              <div className={style.sellInputValue}>
                                {'$' + (100 - singlePoolsData?.poolData_3 / 10) / 100 * Number(inputTokenAmount * inputTokenPrice) + ''}
                              </div>
                            )) : (
                              inputValue && (
                                <div className={style.sellInputValue}>
                                  {'$' + (100 - singlePoolsData?.poolData_3 / 10) / 100 * Number(inputValue * inputTokenPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ''}
                                </div>
                              )
                            )}
                        </div>
                      </div>

                      <div className='absolute top-[calc(50%-14px)] left-[calc(50%-14px)] flex justify-center items-center bg-[rgba(23,38,44,1)] rounded-[7px] x-7 h-7 p-[7px]'>
                        <Image src={Arrow_Icon} alt="arrow_logo" className='w-[14px] h-[14px]'></Image>
                      </div>

                      <div className={style.sellOutput}>
                        <div className="flex flex-col gap-5 w-max">
                          <div className={style.sellOutputText}>You&apos;ll receive</div>
                          <div className={style.sellOutputSelector}>
                              {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol === 'QUICKI' ? (
                                <Image className='rounded-full' src={QUICKI_URL} alt={`${singlePoolsData?.tokenSymbol}`} height={24} width={24} />
                              ) : tokenOutImage ? (
                                <Image src={tokenOutImage} alt={`${singlePoolsData?.tokenSymbol}`} height={24} width={24} />
                              ) : <></>}
                              <a className="text-[rgba(255,255,255,0.8)] justify-start text-base font-[Inter]">
                                {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}
                              </a>
                              <ChevronRightIcon className="text-[rgba(255,255,255,0.4)] w-3 h-3" />
                          </div>
                        </div>
                        <div className={style.sellOutputBalanceContainer}>
                          <div className='flex justify-end gap-[4px]'>
                            <div className={style.sellOutputBalance}>
                              <Image src={walletIcon} alt="bal_logo" height={12} width={12} className='text-white'></Image>
                              {address && tokenOutputBalance ? (
                                <div className='text-[rgba(255,255,255,0.5)] font-["Abel"] text-sm'>{Number(parseFloat(tokenOutputBalance).toFixed(4))?.toLocaleString()}</div>
                                ) : (
                                  <div>-</div>
                                )}
                            </div>
                          </div>
                          <div className={style.sellOutputInputContainer}>
                            <input
                              className={style.sellOutputAmount}
                              type="text"
                              disabled={modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue == '1'}
                              inputMode="decimal"
                              autoComplete="off"
                              autoCorrect="off"
                              spellCheck="false"
                              placeholder="0.0"
                              pattern="^[0-9]*[.,]?[0-9]*$"
                              minLength="1"
                              maxLength="79"
                              value={modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue == '1' ? utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) : outputTokenAmount}
                              onChange={
                                event => {
                                  setOutputTokenAmount(event.target.value)
                                  setOutputTokenMarketAmount(false)
                                } }
                              onKeyPress={event => {
                                if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                  event.preventDefault()
                                }
                              } } />
                          </div>

                          <div className='flex justify-end gap-2'>
                            <div className={style.sellOutputValue}>
                              Available:&nbsp;
                              {modalKey !== -1 && singlePoolsData && Number(
                                utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)
                              )?.toLocaleString()}
                            </div>
                            <button 
                              className={style.sellInputMaxButton} 
                              onClick={() => {
                                setOutputTokenAmount(singlePoolsData && utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals))
                                setOutputTokenMarketAmount(false)
                              }}
                            >
                              MAX
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1 items-center">
                        <InformationCircleIcon className="h-3 w-3" color='rgba(255,255,255,0.5)'/>
                        <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Output is estimated</p>
                      </div>
                      <div className="text-[rgba(255,255,255,0.8)] text-[11px] font-[Inter] text-left">
                        You will receive at least
                        <span className='font-semibold'>&nbsp;{modalKey !== -1 && singlePoolsData && singlePoolsData?.poolValue === '1' ? utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals) : Number(outputTokenAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}&nbsp;</span>
                        {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol} or the transaction will revert.
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex flex-col gap-2">
                        <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Market Price Per Token:</p>
                        <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">{'$' + parseFloat(isEmpty(favValues) ? marketPrices[clickIndex]?.priceUsd : favValues?.marketPrices?.priceUsd).toFixed(4) + ' USD'} / {parseFloat(isEmpty(favValues) ? marketPrices[clickIndex]?.priceNative : favValues?.marketPrices?.priceNative).toFixed(4) + ' ETH'}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Discount:</p>
                        <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">{modalKey !== -1 && singlePoolsData && singlePoolsData?.poolData_3?.toString() > '0' ? singlePoolsData?.poolData_3?.toFixed(2) / 10 + '%' : '-'}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Your Price Per Token:</p>
                        <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">{'$' + parseFloat(isBuyPrice.buyPrice).toFixed(4) + ' USD'} / {parseFloat(isBuyPrice.buyPriceEth).toFixed(4) + ' ETH'}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className='text-[rgba(255,255,255,0.5)] text-xs font-[Inter]'>Vesting:</p>
                        <p className="text-xs text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">
                          {modalKey !== -1 && singlePoolsData && singlePoolsData?.poolData_0?.toString() > '0' ? (
                              singlePoolsData?.poolData_2?.toString() / '10' + '%'
                            ) : (
                              '100%'
                          )} upfront{' '}
                          {modalKey !== -1 && singlePoolsData && singlePoolsData?.poolData_0?.toString() > '0' ? (
                            <>
                              {singlePoolsData?.poolData_1?.toString() / '10'}% /{' '}
                              {getVestingSchedule(singlePoolsData?.poolData_0?.toString())}
                            </>
                          ) : (
                            <>-</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={(modalKey !== -1 && poolType && (poolType == '2' || poolType == '3')
                      ? !outputTokenAmount
                      : modalKey !== -1 && singlePoolsData && !Number(
                        utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)
                      )?.toLocaleString()) || (buyFromPoolLoading || buyFromPoolStarted)}
                      onClick={() => {
                        buyFromPoolWrite?.();
                      }}
                    className={style.confirmationBuyButton}
                  >
                    {buyFromPoolLoading && <a className="animate-pulse text-[rgba(255,255,255,0.8)] text-sm font-[Inter]">Waiting for confirmation</a>}
                    {!buyFromPoolLoading && !buyFromPoolStarted && <a className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Buy token</a>}
                    {buyFromPoolWaitForTransaction.isSuccess && <a className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Buy token</a>}
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>}

      {isChartMobile && <Transition appear show={isChartMobile} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={() => setIsChartMobile(false)}>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex h-screen w-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="customShare bg-[rgba(22,41,48,1)] w-full h-screen flex flex-col pt-5 pb-10 overflow-y-auto">
                  <div className='w-full flex gap-2 items-center justify-between px-5'>
                    <button className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                      onClick={() => {
                        setIsChartMobile(false);
                        setIsFavMobile(true);
                      }}
                    >
                      <ArrowLeftIcon className='w-5 h-5' color='rgba(255,255,255,0.8)' />
                    </button>
                    <div className='flex gap-1'>
                      <button className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                        onClick={() => handleShare(singlePoolsData)}
                      >
                        <ShareIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
                      </button>
                      <a
                        className='customShare flex justify-center items-center w-11 h-11 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] rounded-full border-[1.2px] border-[rgba(255,255,255,0.1)]'
                        target="_blank"
                        href={`https://arbiscan.io/address/${singlePoolsData?.poolCreator}`}
                        rel="noreferrer"
                        data-ripple-dark="true">
                        <PlusIcon className='w-5 h-5' color='rgba(255,255,255,0.8)'/>
                      </a>
                    </div>
                  </div>

                  <div className='flex flex-col gap-6 h-[calc(100vh-102px)] overflow-y-auto px-5'>
                    <div className='flex flex-col gap-6'>
                      <div className='w-full flex flex-col gap-3 justify-center items-center'>
                        <button className='w-14 h-14 rounded-full'>
                          {modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol === 'QUICKI' ? (
                            <Image className='rounded-full' src={QUICKI_URL} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                          ) : tokenOutImage ? (
                            <Image src={tokenOutImage} alt={`${singlePoolsData?.tokenSymbol}`} height={56} width={56} />
                          ) : <></>}
                        </button>
                        <div className='flex flex-col'>
                          <p className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[28px]'>{modalKey !== -1 && singlePoolsData && singlePoolsData?.tokenSymbol}</p>
                          <p className='text-[rgba(100,116,139,1)] text-lg font-[Inter]'>{chain?.name}</p>
                        </div> 
                      </div>

                      <div className='w-full flex flex-col gap-3'>
                        <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] text-left rounded-lg w-full p-5'>
                          <div className='flex gap-1 items-center'>
                            <p className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>Buy Price</p>
                            <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                          </div>
                          {singlePoolsData?.poolData_4?.toString() > '0' ? (
                            <>
                              <p className='text-[rgba(255,255,255,0.8)] text-[28px] font-[Abel]'>
                                {parseFloat((singlePoolsData.poolData_4?.toString() *
                                  utils.formatUnits(singlePoolsData.poolData_5?.toString(), singlePoolsData?.tokenDecimals)) /
                                  10 ** 18).toFixed(2)}{' '}
                                {chainSymbol}
                              </p>
                              <div className='flex gap-3'>
                                <p className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                                  {(
                                    Number(
                                      ((singlePoolsData.poolData_4?.toString() *
                                        utils.formatUnits(
                                          singlePoolsData.poolData_5?.toString(),
                                          singlePoolsData?.tokenDecimals
                                        )) /
                                        10 ** 18) *
                                      chainTokenPrice
                                    )?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                  )} USD
                                </p>
                                <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                  Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className='text-[rgba(255,255,255,0.8)] text-[28px] font-[Abel]'>
                                {favValues?.marketPrices?.priceNative ? favValues?.buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                              </p>
                              <div className='flex gap-3'>
                                <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                  {favValues?.marketPrices?.priceUsd ? '$' + favValues?.buyPrice : '-'} USD
                                </p>
                                <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                                  Discount: {singlePoolsData?.poolData_3?.toString() > '0' ? (singlePoolsData?.poolData_3?.toFixed(2) / 10) + '%' : '-'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] rounded-t-lg w-full px-5 pt-5'>
                          <div className='flex flex-col gap-2 text-left'>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>Market Price</p>
                              <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                            </div>
                            <p className='text-[rgba(255,255,255,0.8)] text-[20px] font-[Abel]'>{parseFloat(favValues?.ethPrice).toFixed(4)} ETH</p>
                            <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>${parseFloat(favValues?.marketPrices?.priceUsd).toFixed(2)} USD</p>
                          </div>
                          <div className='w-full flex flex-col gap-3 justify-center items-center'>
                            <Image src={group_chart} alt='group_chart' ></Image>
                          </div>
                        </div>

                        <div className='flex gap-3'>
                          <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] text-left rounded-lg w-full p-5'>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-[13px] font-[Inter]'>Tokens Remaining</p>
                              <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                            </div>
                            <p className='text-[rgba(255,255,255,0.8)] text-lg font-[Abel]'>
                              {Number(
                                utils.formatUnits(singlePoolsData?.poolData_5?.toString(), singlePoolsData?.tokenDecimals)
                              )?.toLocaleString()}
                            </p>
                            <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>Partial buys allowed</p>
                          </div>
                          <div className='flex flex-col gap-2 bg-[rgba(255,255,255,0.05)] text-left rounded-lg w-full p-5'>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-[13px] font-[Inter]'>Vesting Schedule</p>
                              <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,0.5)'/>
                            </div>
                            <p className='text-[rgba(255,255,255,0.8)] text-lg font-[Abel]'>
                              {singlePoolsData?.poolData_2?.toString() > '0' ? (
                                singlePoolsData?.poolData_2?.toString() / '10' + '% upfront'
                              ) : '-'}
                            </p>
                            <p className='text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'>
                              {singlePoolsData?.poolData_1?.toString() > '0' ? (
                                `Then, ${singlePoolsData?.poolData_1?.toString() / '10'}%/ ${getVestingSchedule(singlePoolsData?.poolData_0?.toString())}`
                              ) : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='w-full flex flex-col gap-[10px]'>
                      <button className={`font_Inter font-bold py-3 rounded-full bg-[rgba(70,147,163,1)] w-full text-sm text-[rgba(255,255,255,0.8)] flex items-center justify-center border-[1.2px] border-[rgba(255,255,255,0.1)]`}
                        onClick={() => {
                          setIsBuyMobile(true);
                        }}
                      >
                        Buy Now
                      </button>
                      <span className='w-full text-center text-xs text-[rgba(100,116,139,1)] font-[Inter]'>
                        Listed {new Date(
                          Number(singlePoolsData?.poolCreatedTimestamp),
                        ).toLocaleDateString('en-US', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>}

      {<Transition appear show={buyFromPoolStarted && isConfirmation} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {
          setIsConfirmation(false);
          setIsBuyMobile(true);
        }}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[12px]" aria-hidden="true" />
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
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
                <Dialog.Panel className={`${buyFromPoolStarted && !buyFromPoolWaitForTransaction.isSuccess || buyFromPoolWaitForTransaction.isSuccess ? 'h-[418px] sm:h-[640px]' : 'max-h-[626px] sm:max-h-[754px]'} min-w-[350px] w-full sm:w-[720px] transform rounded-2xl border-[1.2px] border-[rgba(255,255,255,0.1)] bg-[rgba(6,11,39,0.8)] p-1 pt-5 sm:p-6 shadow-[rgba(0,0,0,0.16)] transition-all`}>
                  <Dialog.Title
                    as="h3"
                    className={`${buyFromPoolStarted && !buyFromPoolWaitForTransaction.isSuccess ? 'hidden' : 'flex'} flex-col gap-4 relative w-full justify-center items-center px-4`}
                  >
                    <span className='text-[rgba(255,255,255,0.8)] text-[20px] sm:text-[28px] pt-5 font-[Inter] font-semibold'>
                      {buyFromPoolWaitForTransaction.isSuccess ? 'Transaction Successful' : 'Transaction Processing'}
                    </span>
                    <span className={`${buyFromPoolWaitForTransaction.isSuccess ? '' : 'border-b-[1px] border-[rgba(255,255,255,0.1)]'} w-full text-xs sm:text-lg text-[rgba(255,255,255,0.6)] font-[Inter] pb-6`}>
                      Listing {singlePoolsData?.tokenSymbol} for {chain?.nativeCurrency?.symbol} for {countLeadingZerosAfterDecimal(outputTokenAmount)} {singlePoolsData?.tokenSymbol}
                    </span>
                    <button
                      type="button"
                      className="absolute right-2 sm:right-0 top-0 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.2)] text-center"
                      onClick={() => {
                        setIsConfirmation(false);
                        setIsBuyMobile(true);
                      }}
                    >
                      <XMarkIcon className='h-6 w-6 sm:w-8 sm:h-8 text-[rgba(255,255,255,0.2)] hover:text-white'/>
                    </button>
                  </Dialog.Title>
                  <div className="flex justify-center text-center">
                    {buyFromPoolStarted && !buyFromPoolWaitForTransaction.isSuccess && (
                      <div>
                        <div className="flex flex-col pt-5 sm:pt-10">
                          <div className="py-2 text-[rgba(255,255,255,0.8)] text-xl sm:text-[28px] font-[Inter] font-semibold">Transaction Processing</div>
                          <div className="py-2 text-[rgba(255,255,255,0.6)] text-xs sm:text-lg font-[Inter]">
                            Listing {singlePoolsData?.tokenSymbol} for {chain?.nativeCurrency?.symbol} for {countLeadingZerosAfterDecimal(outputTokenAmount)} {singlePoolsData?.tokenSymbol}
                          </div>
                          <video className="-mt-[72px] h-auto w-full max-w-full" autoPlay muted loop>
                            <source src="/videos/dswap_loader.webm" type="video/webm" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}
                    {buyFromPoolWaitForTransaction.isSuccess && (
                      <>
                        <div className="flex flex-col justify-center pt-4 gap-8 text-center">
                          <Image src={checkLogo} alt='check_logo' className='w-[148px] h-[148px] sm:w-[290px] sm:h-[290px]'></Image>
                          <div className='flex flex-col gap-4'>
                            <div className="flex gap-2 justify-center">
                              <a className='text-[rgba(255,255,255,0.6)] text-xs sm:text-lg font-[Inter]'>Transaction Details</a>
                              <a
                                className="flex items-center"
                                href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ArrowUpRightIcon className="h-4 w-4 sm:h-5 sm:w-5 items-center" color='rgba(255,255,255,0.6)'/>
                              </a>
                            </div>
                            <button
                              className="w-full text-center text-xs sm:text-lg font-[Inter] font-semibold rounded-full bg-[rgba(255,255,255,0.2)] py-3 sm:py-4 text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.6)] hover:text-white"
                              onClick={e => {
                                  setIsConfirmation(false);
                                  router.push('/pending');
                                }
                              }
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {buyFromPoolWaitForTransaction.isError && (
                      <div>
                        <div className="flex-col justify-center p-4 text-center">
                          <div className="py-2 text-[rgba(255,255,255,0.6)] text-lg font-[Inter]">Listing {chain?.nativeCurrency?.symbol} Failure</div>
                          <XCircleIcon className="h-[290px] w-[290px] text-red-400" />
                          <div className="flex justify-center">
                            <a className='text-[rgba(255,255,255,0.6)] text-lg font-[Inter]'>Transaction Details</a>
                            <div
                              className="flex items-center"
                              href={
                                chain ? `${chain?.blockExplorers?.default.url}/tx/${buyFromPoolTokenData?.hash}` : 'N/A'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowUpRightIcon className="h-5 w-5 items-center" color='rgba(255,255,255,0.6)'/>
                              {buyFromPoolTokenData?.hash}
                            </div>
                          </div>
                          <button
                            className="w-full text-center text-lg font-[Inter] rounded-full bg-[rgba(255,255,255,0.2)] px-6 py-4 text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.6)] hover:text-white"
                            onClick={() => {
                              setIsConfirmation(false);
                              setIsBuyMobile(true);
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>}
    </div>
  );
}