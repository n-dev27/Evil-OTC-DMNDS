import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { utils } from 'ethers';
import { useAccount } from 'wagmi';
import { countLeadingZerosAfterDecimal } from '../../utils/countDecimals'
import { PlusCircleIcon, ChartBarIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { toast } from "react-hot-toast";
import ShareModal from './ShareModal';
import { getSvgLogoPath } from '../../assets/symbol/svgIcons';
import BuyConfirmationModal from './BuyConfirmationModal';
import { getVestingSchedule } from '../../utils/getVestingSchedule';
import { createList, getOneList, deleteList } from '../../services/favListServices';
import { getTokenPair } from '../../services/tokenInfoServices';
import { LayoutContext } from '../layout/layout';
import star_1 from '../../assets/star_1.svg'
import star_2 from '../../assets/star_2.svg'

const SearchedTokenPools = ({
  setIsBuyFlag,
  setIsChartFlag,
  setIsFavorite,
  setIsFavMobile,
  chain,
  token,
  poolOption,
  isConnected,
  showShareModal,
  setShowShareModal,
  poolInfo,
  setPoolInfo,
  setFavArray,
  setModalKey,
  setIsFlipped,
  setSearchToken,
  tokenImage,
  data,
  usdTokenPrice,
  nativeTokenPrice,
  chainTokenPrice,
  chainSymbol,
  chainDecimals,
  }) => {
  let QUICKI_URL = "https://coinando.com/static/assets/coins/quick-intel-logo.png";

  const { address } = useAccount();

  const { setFavValues, poolListFlag } = useContext(LayoutContext);
  const [marketPrices, setMarketPrices] = useState([]);
  const [values, setValues] = useState([0, 25]);
  const [viewIndex, setViewIndex] = useState(false);
  const [shareView, setShareView] = useState(false);
  const [favPoolList, setFavPoolList] = useState([]);
  const [newFormattedPoolsData, setNewFormattedPoolsData] = useState([]);

  useEffect(() => {
    const poolData = data?.pools && data?.pools
      .filter(pool => {
        const filterResult = pool?.tokenSelling?.amountAvailable > '0' && pool?.tokenSelling.tokenAddress.toLowerCase() === token.toLowerCase(); 
        return filterResult;
      })
      .map((pool, index) => {
        return {
          poolHidden: pool?.visibility,
          poolAddress: pool?.poolAddress,
          poolCreator: pool?.poolCreator,
          poolType: pool?.poolType,
          poolValue: pool?.poolValue,
          poolCreatedTimestamp: Number(Number(pool?.detail?.blockTimestamp) * 1000),
          poolData_0: pool?.poolOptions?.vestingOptions?.vestingPercentPerPeriod,
          poolData_1: pool?.poolOptions?.vestingOptions?.vestingPeriod,
          poolData_2: pool?.poolOptions?.vestingOptions?.initialReleasePercent,
          poolData_3: parseInt(pool?.poolOptions?.discountPercent),
          poolData_4: pool?.fixedPricePerToken,
          poolData_5: pool?.tokenSelling?.amountAvailable,
          tokenName: pool?.tokenSelling?.tokenName,
          tokenSymbol: pool?.tokenSelling?.tokenSymbol,
          tokenAddress: pool?.tokenSelling?.tokenAddress, 
          tokenDecimals: pool?.tokenSelling?.decimals,
          listingType: pool?.fixedPrice,
        };
      });


    const fetchMarketPrices = async () => {
      const favList = await getOneList(address);
      setFavArray(favList?.data.data)
      
      if (poolData) {
        poolData.sort((a, b) => (a.poolCreatedTimestamp < b.poolCreatedTimestamp) ? 1 : (a.poolCreatedTimestamp > b.poolCreatedTimestamp) ? -1 : 0);
        if (favList?.data.data !== null) {
          const newArray = poolData.map(item => favList?.data.data?.pool_list.includes(item.poolAddress))
          setFavPoolList(newArray)
        };
        setNewFormattedPoolsData(poolData);
      }

      if (Array.isArray(poolData)) {
        const tokenList = poolData.map((data) => data.tokenAddress).filter((value, index, array) => array.indexOf(value) === index);
        const newList = [
          '0x539bde0d7dbd336b79148aa742883198bbf60342', '0x912CE59144191C1204E64559FE8253a0e49E6548'
        ]
        const marketPrice = await getTokenPair(tokenList);
        setMarketPrices(marketPrice?.data)
      }
      // const updatedMarketPrices = [];

      // if (Array.isArray(poolData)) {
      //   for (const pool of poolData) {
      //     const marketPrice = await getTokenPair(pool.tokenAddress);
      //     const updatedPool = marketPrice?.data === null ? 
      //     { 
      //       priceUsd: 0,
      //       priceNative: 0,
      //     } : 
      //     { 
      //       priceUsd: parseFloat(marketPrice?.data[0]?.priceUsd),
      //       priceNative: parseFloat(marketPrice?.data[0]?.priceNative)
      //     };
      //     updatedMarketPrices.push(updatedPool);
      //   }
      // }
      // setMarketPrices(updatedMarketPrices);
    };

    fetchMarketPrices();
  }, [data, token, poolListFlag]);  

  const handleFavorite = async(index, pool) => {
    let newFavPoolList = [...favPoolList];

    if (newFavPoolList[index]) {
      newFavPoolList[index] = false;
      const response = await deleteList(address, '', pool.poolAddress);
      console.log('delete response == ', response)
    } else {
      newFavPoolList[index] = true;

      const data = {
        userWalletAddr: address,
        tokenAddr: '',
        poolAddr: pool.poolAddress
      }

      const response = await createList(data)
      console.log('create response == ',response)
    }

    setFavPoolList(newFavPoolList)

    // Fetch the updated list after delete/create operation
    const favList = await getOneList(address);
    setFavArray(favList?.data.data);
  };

  const handleShareClick = (index) => {
    setViewIndex(index);
    setShareView(viewIndex === index ? !shareView : true);
  }

  const handleShare = (pool) => {
    setShowShareModal(true);
    setPoolInfo(pool);
  };
  
  return (
    <>
      {data?.pools && data?.pools?.length > 0 ? newFormattedPoolsData && (
        <div className={`${newFormattedPoolsData.length === 0 ? 'px-4 sm:px-8' : ''} flex flex-col`}>
        {showShareModal && (
          <ShareModal isOpen={showShareModal} setIsOpen={setShowShareModal} poolInfo={poolInfo} />
        )}
          {newFormattedPoolsData && newFormattedPoolsData.length === 0 ? (
            <div
              className="flex justify-center rounded-xl bg-[rgba(255,255,255,0.05)] py-4 sm:py-2 mt-5 text-center"
              role="alert"
            >
              <div className='font-[Inter] font-semibold text-lg sm:text-xl text-[rgba(255,255,255,0.6)]'>No pools available for purchase</div>
            </div>
          ) : (
            <>
              <div className="h-[calc(100vh-680px)] hidden sm:flex flex-col px-8 overflow-y-auto">
                {newFormattedPoolsData && newFormattedPoolsData.map((pool, index) => {
                    let tokenImage = getSvgLogoPath(pool.tokenSymbol);
                    const marketValue = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceUsd;
                    const ethPrice = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceNative;
                    const buyPriceEth = pool?.poolData_3 === 0 ? parseFloat(ethPrice).toFixed(4) : parseFloat(ethPrice * (100 - pool?.poolData_3 / 10) / 100).toFixed(4);
                    const buyPrice = pool?.poolData_3 === 0 ? parseFloat(marketValue).toFixed(2) : parseFloat(marketValue * (100 - pool?.poolData_3 / 10) / 100).toFixed(2);

                    if (poolOption) {
                      if (pool?.poolValue === '2' || pool?.poolValue === '3') {
                        return (
                          <div key={index} className={`${
                            (pool.poolData_4
                              ?.toString() *
                              utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                              10 ** chainDecimals >=
                              values[0] &&
                            (pool.poolData_4?.toString() *
                              utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                              10 ** chainDecimals <=
                              values[1]
                              ? ''
                              : 'hidden'
                          } relative min-h-[107px] text-center gap-2 mt-5 flex flex-col rounded-xl border border-[rgba(255,255,255,0.1)] border-solid bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] hover:border-[rgba(255,0,0,1)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]`}
                          >
                            <div className={`${favPoolList[index] === true ? 'bg-[rgba(255,216,13,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'} z-20 absolute top-[-16px] left-[-16px] cursor-pointer rounded-full w-9 h-9 flex justify-center items-center shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                              onClick={() => handleFavorite(index, pool)}
                            >
                              <Image className='w-4 h-4' src={favPoolList[index] === true ? star_1 : star_2} alt='star_logo' ></Image>
                            </div>
                            <div className='absolute w-full flex justify-end'>
                              <div className='flex justify-center items-center bg-[rgba(255,0,0,1)] text-white text-[9px] font_Inter font-bold py-[2px] pl-2 w-[140px] h-4 rounded-tr-xl rounded-bl-xl'>
                                {pool.listingType ? 'FIXED PRICE LISTING' : 'MARKET PRICE LISTING'}
                              </div>
                            </div>
                            <div className='w-full h-full flex items-center justify-center px-8 cursor-pointer'
                              onClick={() => {
                                setModalKey(index);
                                setIsFavorite(true);
                                setIsChartFlag(false);
                                setIsBuyFlag(false);
                                setFavValues({
                                  marketPrices: marketPrices[index],
                                  buyPriceEth: buyPriceEth,
                                  buyPrice: buyPrice,
                                  ethPrice: ethPrice
                                })
                              }}
                            >
                              <div className='grid grid-cols-5 w-full'
                                // onClick={() => handleShareClick(index)}
                              >
                                <div className='col-span-1 text-start flex items-center'>
                                  <div className="flex w-auto items-center">
                                    <button>
                                      {pool.tokenSymbol === 'QUICKI' ? (
                                        <Image className='rounded-full' src={QUICKI_URL} alt={`${pool.tokenSymbol}`} height={32} width={32} />
                                      ) : tokenImage != '' ? (
                                        <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={32} width={32} />
                                      ) : (
                                        <a className="flex w-auto items-center justify-center text-center text-[7px] text-white">
                                          {pool?.tokenSymbol}
                                        </a>
                                      )}
                                    </button>
                                    <div className="flex flex-col justify-center pl-3 text-start">
                                      <div className='text-[rgba(255,255,255,0.8)] text-lg font-[Inter]'>{pool?.tokenSymbol}</div>
                                      <div className="text-xs text-[rgba(100,116,139,1)] font-[Inter]">{chain?.name}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 items-center font-[Inter] text-xs text-[rgba(100,116,139,1)]">
                                    Tokens Remaining
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] text-[14px] font-[Inter]'>
                                    {Number(
                                      utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                    )?.toLocaleString()}
                                  </div>
                                  <div className="text-[rgba(100,116,139,1)] text-xs font-[Inter]">Partial Buys Allowed</div>
                                  </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 items-center font-[Inter] text-xs text-[rgba(100,116,139,1)]">
                                    Market Price
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[14px]'>{parseFloat(ethPrice).toFixed(4)} ETH&nbsp;</div>
                                  <div className='text-[rgba(100,116,139,1)] font-[Inter] text-xs'>${parseFloat(marketValue).toFixed(2)} USD</div>
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 text-[rgba(100,116,139,1)] text-xs items-center font-[Inter]">
                                    BUY PRICE
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  {pool.poolData_4?.toString() > '0' ? (
                                    <div className='flex flex-col gap-1'>
                                      <div className='text-[rgba(255,0,0,1)] text-[14px] font-semibold'>
                                        {parseFloat((pool.poolData_4?.toString() *
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                          10 ** 18).toFixed(2)}{' '}
                                        {chainSymbol}&nbsp;
                                      </div>
                                      <div className='flex gap-2'>
                                        <div className='text-[rgba(100,116,139,1)] text-xs'>
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
                                        </div>
                                        <div className='flex justify-start items-center text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                          <div>Discount: {pool.poolData_3?.toString() > '0' ? (
                                          <a>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                          ) : (
                                            <a>-</a>
                                          )}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                      <div className='flex flex-col gap-1'>
                                        <div className='text-[rgba(255,0,0,1)] text-[14px] font-[Inter] font-semibold'>
                                          {marketPrices[index]?.priceNative ? buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}&nbsp;
                                        </div>
                                        <div className='flex gap-2'>
                                          <div className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                            {/* {marketPrices[index]?.priceUsd
                                                ? '($' + parseFloat(utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals) * marketPrices[index]?.priceUsd).toFixed(2)?.toLocaleString() + ')'
                                                : '-'} USD */}
                                              {marketPrices[index]?.priceUsd ? '($' + buyPrice + ')' : '-'} USD&nbsp;
                                          </div>
                                          <div className='flex justify-start items-center text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                            <div>Discount: {pool.poolData_3?.toString() > '0' ? (
                                            <a>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                            ) : (
                                              <a>-</a>
                                            )}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 text-xs text-[rgba(100,116,139,1)] items-center font-[Inter]">
                                    Vesting Schedule
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] text-[14px] font-[Inter]'>
                                    {pool.poolData_2?.toString() > '0' ? (
                                      <div>{pool.poolData_2?.toString() / '10'}% Upfront</div>
                                    ) : (
                                      <div className='text-[rgba(255,255,255,0.6)]'>-</div>
                                    )}
                                  </div>
                                  <div className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                    {pool.poolData_1?.toString() > '0' ?
                                    <div>
                                    Then, {pool.poolData_1?.toString() / '10'}% / {getVestingSchedule(pool.poolData_0?.toString())}
                                    </div>
                                    :
                                    <div className='text-[rgba(255,255,255,0.6)]'>-</div>}
                                  </div>
                                </div>
                                {/* <div className='col-span-1 flex flex-col gap-[6px] justify-center items-center '>
                                  <button 
                                    onClick={() => {
                                      if (isConnected) {
                                        setModalKey(index);
                                        setIsFlipped(true);
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
                                    }} 
                                    className={`text-[7px] font-bold font_Inter px-4 py-1 rounded-3xl bg-[#1B75FF] w-full text-white flex items-center justify-center`}>
                                    Buy Now
                                  </button>
                                  <span className='text-[7px] text-[#F6F6F6]'>
                                    Listed {new Date(
                                      Number(pool?.poolCreatedTimestamp),
                                    ).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'short',
                                      year: '2-digit',
                                    })}
                                  </span>
                                </div> */}
                              </div>
                              {/* {shareView && viewIndex === index && (
                                <div className='w-full flex justify-center items-center gap-8'>
                                  <button
                                    className="flex h-6 items-center gap-1 rounded-full bg-[#1B75FF] px-4 text-white transition duration-300 hover:bg-sea-300/60"
                                    type="button"
                                    data-ripple-dark="true"
                                    onClick={() => handleShare(pool)}
                                  >
                                    <LinkIcon className='w-3.5 h-3.5' />
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
                                )
                              } */}
                            </div>
                          </div>
                        )
                      }
                    } else {
                      if (pool?.poolValue === '1') {
                        return (
                          <div key={index} className={`${
                            (pool.poolData_4
                              ?.toString() *
                              utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                              10 ** chainDecimals >=
                              values[0] &&
                            (pool.poolData_4?.toString() *
                              utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                              10 ** chainDecimals <=
                              values[1]
                              ? ''
                              : 'hidden'
                          } relative min-h-[107px] text-center gap-2 mt-5 flex flex-col rounded-xl border border-[rgba(255,255,255,0.1)] border-solid bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] hover:border-[rgba(255,0,0,1)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]`}
                          >
                            <div className={`${favPoolList[index] === true ? 'bg-[rgba(255,216,13,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'} z-20 absolute top-[-16px] left-[-16px] cursor-pointer rounded-full w-9 h-9 flex justify-center items-center shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                              onClick={() => handleFavorite(index, pool)}
                            >
                              <Image className='w-4 h-4' src={favPoolList[index] === true ? star_1 : star_2} alt='star_logo' ></Image>
                            </div>
                            <div className='absolute w-full flex justify-end'>
                              <div className='flex justify-center items-center bg-[rgba(255,0,0,1)] text-white text-[9px] font_Inter font-bold py-[2px] pl-2 w-[140px] h-4 rounded-tr-xl rounded-bl-2xl'>
                                {pool.listingType ? 'FIXED PRICE LISTING' : 'MARKET PRICE LISTING'}
                              </div>
                            </div>
                            <div className='w-full h-full flex items-center justify-center px-8 cursor-pointer'
                              onClick={() => {
                                setModalKey(index);
                                setIsFavorite(true);
                                setIsChartFlag(false);
                                setIsBuyFlag(false);
                                setFavValues({
                                  marketPrices: marketPrices[index],
                                  buyPriceEth: buyPriceEth,
                                  buyPrice: buyPrice,
                                  ethPrice: ethPrice
                                })
                              }}
                            >
                              <div className='grid grid-cols-5 w-full'
                                // onClick={() => handleShareClick(index)}
                              >
                                <div className='col-span-1 text-start flex items-center'>
                                  <div className="flex w-auto items-center">
                                    <button>
                                        {pool.tokenSymbol === 'QUICKI' ? (
                                          <Image className='rounded-full' src={QUICKI_URL} alt={`${pool.tokenSymbol}`} height={32} width={32} />
                                        ) : tokenImage != '' ? (
                                          <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={32} width={32} />
                                        ) : (
                                          <a className="flex w-auto items-center justify-center text-center text-[7px] text-white">
                                            {pool?.tokenSymbol}
                                          </a>
                                        )}
                                    </button>
                                    <div className="flex flex-col justify-center pl-3 text-start">
                                      <div className='text-[rgba(255,255,255,0.8)] text-lg font-[Inter]'>{pool?.tokenSymbol}</div>
                                      <div className="text-xs text-[rgba(100,116,139,1)] font-[Inter]">{chain?.name}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 items-center font-[Inter] text-xs text-[rgba(100,116,139,1)]">
                                    Tokens Remaining
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] text-[14px] font-[Inter]'>
                                    {Number(
                                      utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                    )?.toLocaleString()}
                                  </div>
                                  <div className="text-[rgba(100,116,139,1)] text-xs font-[Inter]">Partial Buys Allowed</div>
                                  </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 items-center font-[Inter] text-xs text-[rgba(100,116,139,1)]">
                                    Market Price
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[14px]'>{parseFloat(ethPrice).toFixed(4)} ETH&nbsp;</div>
                                  <div className='text-[rgba(100,116,139,1)] font-[Inter] text-xs'>(${parseFloat(marketValue).toFixed(2)} USD)</div>
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 text-[rgba(100,116,139,1)] text-xs items-center font-[Inter]">
                                    BUY PRICE
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  {pool.poolData_4?.toString() > '0' ? (
                                    <div className='flex flex-col gap-1'>
                                      <div className='text-[rgba(255,0,0,1)] text-[14px] font-semibold'>
                                        {parseFloat((pool.poolData_4?.toString() *
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                          10 ** 18).toFixed(2)}{' '}
                                        {chainSymbol}&nbsp;
                                      </div>
                                      <div className='flex gap-2'>
                                        <div className='text-[rgba(100,116,139,1)] text-xs'>
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
                                        </div>
                                        <div className='flex justify-start items-center text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                          <div>Discount: {pool.poolData_3?.toString() > '0' ? (
                                          <a>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                          ) : (
                                            <a>-</a>
                                          )}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                      <div className='flex flex-col gap-1'>
                                        <div className='text-[rgba(255,0,0,1)] text-[14px] font-[Inter] font-semibold'>
                                          {marketPrices[index]?.priceNative ? buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}&nbsp;
                                        </div>
                                        <div className='flex gap-2'>
                                          <div className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                            {/* {marketPrices[index]?.priceUsd
                                                ? '($' + parseFloat(utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals) * marketPrices[index]?.priceUsd).toFixed(2)?.toLocaleString() + ')'
                                                : '-'} USD */}
                                              {marketPrices[index]?.priceUsd ? '($' + buyPrice + ')' : '-'} USD&nbsp;
                                          </div>
                                          <div className='flex justify-start items-center text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                            <div>Discount: {pool.poolData_3?.toString() > '0' ? (
                                            <a>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                            ) : (
                                              <a>-</a>
                                            )}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 text-xs text-[rgba(100,116,139,1)] items-center font-[Inter]">
                                    Vesting Schedule
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] text-[14px] font-[Inter]'>
                                    {pool.poolData_2?.toString() > '0' ? (
                                      <div>{pool.poolData_2?.toString() / '10'}% Upfront</div>
                                    ) : (
                                      <div className='text-[rgba(255,255,255,0.6)]'>-</div>
                                    )}
                                  </div>
                                  <div className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                    {pool.poolData_1?.toString() > '0' ?
                                    <div>
                                    Then, {pool.poolData_1?.toString() / '10'}% / {getVestingSchedule(pool.poolData_0?.toString())}
                                    </div>
                                    :
                                    <div className='text-[rgba(255,255,255,0.6)]'>-</div>}
                                  </div>
                                </div>
                                {/* <div className='col-span-1 flex flex-col gap-1 justify-center items-center '>
                                  <button 
                                    onClick={() => {
                                      if (isConnected) {
                                        setModalKey(index);
                                        setIsFlipped(true);
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
                                    }} 
                                    className={`text-[7px] font-bold font_Inter px-4 py-1 rounded-3xl bg-[#1B75FF] w-full text-white flex items-center justify-center`}>
                                    Buy Now
                                  </button>
                                  <span className='text-[7px] text-[#F6F6F6]'>
                                    Listed {new Date(
                                      Number(pool?.poolCreatedTimestamp),
                                    ).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'short',
                                      year: '2-digit',
                                    })}
                                  </span>
                                </div> */}
                              </div>
                              {shareView && viewIndex === index && (
                                <div className='w-full flex justify-center items-center gap-8'>
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
                                )
                              }
                            </div>
                          </div>
                        )
                      }
                    }
                  })}
              </div>
              <div className="flex w-full flex-col gap-[6px] px-4 sm:hidden">
                {newFormattedPoolsData?.map((pool, index) => {
                  let tokenImage = getSvgLogoPath(pool.tokenSymbol)
                  const marketValue = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceUsd;
                  const ethPrice = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceNative;
                  const buyPriceEth = pool.poolData_3 === 0 ? parseFloat(ethPrice).toFixed(4) : parseFloat(ethPrice * (100 - pool.poolData_3 / 10) / 100).toFixed(4);
                  const buyPrice = pool.poolData_3 === 0 ? parseFloat(marketValue).toFixed(2) : parseFloat(marketValue * (100 - pool.poolData_3 / 10) / 100).toFixed(2);
                  if (poolOption) {
                    if (pool?.poolValue === '2' || pool?.poolValue === '3') {
                      return (
                        <div
                          key={index}
                          className={`${
                            (pool.poolData_4?.toString() *
                              utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                              10 ** 18 >=
                              values[0] &&
                            (pool.poolData_4?.toString() *
                              utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                              10 ** 18 <=
                              values[1]
                              ? ''
                              : 'hidden'
                          } bg-[rgba(255,255,255,0.05)] relative w-full text-center flex flex-col gap-2 rounded-lg border-[0.62px] border-[rgba(255,255,255,0.1)] customShare`}
                        >
                          <div className={`${favPoolList[index] === true ? 'bg-[rgba(255,216,13,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'} z-20 absolute top-[-14px] left-[-14px] cursor-pointer rounded-full w-7 h-7 flex justify-center items-center shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                            onClick={() => handleFavorite(index, pool)}>
                            <Image className='w-3 h-3' src={favPoolList[index] === true ? star_1 : star_2} alt='star_logo' ></Image>
                          </div>
                          <div className='absolute w-full flex justify-end'>
                            <div className='flex justify-center items-center bg-[rgba(255,0,0,1)] text-white text-[9px] font_Inter font-bold py-[2px] pl-2 w-[140px] h-4 rounded-tr-lg rounded-bl-xl'>
                              {pool.listingType ? 'FIXED PRICE LISTING' : 'MARKET PRICE LISTING'}
                            </div>
                          </div>
                          <div className="px-4 pb-4 pt-7 w-full flex flex-col gap-3">
                            <div className='flex flex-col gap-3 cursor-pointer'
                              onClick={() => {
                                setModalKey(index);
                                setIsFavMobile(true);
                                setIsFavorite(false);
                                setIsChartFlag(false);
                                setIsBuyFlag(false);
                                setFavValues({
                                  marketPrices: marketPrices[index],
                                  buyPriceEth: buyPriceEth,
                                  buyPrice: buyPrice,
                                  ethPrice: ethPrice
                                })
                              }}
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                  {pool.tokenSymbol === 'QUICKI' ? (
                                    <Image className='rounded-full' src={QUICKI_URL} alt={`${pool.tokenSymbol}`} height={32} width={32} />
                                  ) : tokenImage != '' ? (
                                    <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={32} width={32} />
                                  ) : (
                                    <a className="flex w-auto items-center justify-center text-center text-xs text-white">
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
                                <div className="flex flex-col justify-center gap-1">
                                  <div className="flex items-center justify-end gap-1">
                                    <div className={`text-[rgba(100,116,139,1)] flex text-xs font-[Inter]`}>Market Price:</div>
                                    <div className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>{ethPrice ? countLeadingZerosAfterDecimal(ethPrice) + ' ETH' : '-'}</div>
                                  </div>
                                  <div className="flex items-center justify-end gap-1">
                                    <div className={`text-[rgba(100,116,139,1)] flex justify-end font-[Inter] text-[#C4D0E4] text-xs`}>Discount:</div>
                                    {pool.poolData_3?.toString() > '0' ? (
                                      <a className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                      ) : (
                                      <a className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>-</a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex">
                                <div className="w-full flex flex-col gap-[6px]">
                                  <div className={`text-[rgba(100,116,139,1)] text-start text-xs font-[Inter]`}>Buy Price:</div>
                                  {pool.poolData_4?.toString() > '0' ? (
                                    <div className="flex items-center justify-start gap-[6px]">
                                      <a className="text-lg font-[Inter] font-semibold text-[rgba(255,255,255,1)]">
                                        {countLeadingZerosAfterDecimal((pool.poolData_4?.toString() *
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                          10 ** 18)}{' '}
                                        {chainSymbol}
                                      </a>
                                      <a className="text-xs text-[rgba(255,255,255,0.8)] font-roboto">
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
                                          )?.toLocaleString(undefined, {maximumFractionDigits: 2})
                                        )} USD)
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-start gap-[6px]">
                                      <a className="text-lg font-[Inter] font-semibold text-[rgba(255,255,255,1)]">
                                        {marketPrices[index]?.priceNative ? buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                                      </a>
                                      <a className="text-xs text-[rgba(255,255,255,0.8)] font-roboto">
                                        {marketPrices[index]?.priceUsd ? '($' + buyPrice + ' USD)' : '(- USD)'}
                                      </a>
                                    </div>
                                  )}
                                  <div className='w-full flex gap-3 items-center'>
                                    <div className='flex items-center gap-1'>
                                      <a className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>
                                        Tokens:
                                      </a>
                                      <a className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                        {(
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                        )?.toLocaleString()}
                                      </a>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                      <a className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Vesting:</a>
                                      {pool.poolData_0?.toString() > '0' ? (
                                        <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                          {pool.poolData_2?.toString() / '10'}% released
                                        </div>
                                      ) : (
                                        <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>100% released</div>
                                      )}

                                      {pool.poolData_0?.toString() > '0' ? (
                                        <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                          +{pool.poolData_1?.toString() / '10'}% /{getVestingSchedule(pool.poolData_0?.toString())}
                                        </div>
                                      ) : (
                                        <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>-</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {                        
                                if (isConnected) {
                                  setModalKey(index);
                                  setIsBuyMobile(true);
                                  setIsFavorite(false);
                                  setIsChartFlag(false);
                                  setIsBuyFlag(false);
                                  setFavValues({
                                    marketPrices: marketPrices[index],
                                    buyPriceEth: buyPriceEth,
                                    buyPrice: buyPrice,
                                    ethPrice: ethPrice
                                  })
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
                                const resizeEvent = new Event('resize');
                                window.dispatchEvent(resizeEvent);      
                              }} 
                              className={`customShare text-sm font-bold font_Inter py-2 rounded-full bg-[rgba(70,147,163,1)] w-full text-[rgba(255,255,255,0.8)] flex items-center justify-center border-[1.2px] border-[rgba(255,255,255,0.1)]`}>
                              Buy Now
                            </button>
                          </div>
                        </div>
                      )
                    } 
                    } else {
                      if (pool?.poolValue === '1') {
                        return (
                          <div
                            key={index}
                            className={`${
                              (pool.poolData_4?.toString() *
                                utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                10 ** 18 >=
                                values[0] &&
                              (pool.poolData_4?.toString() *
                                utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                10 ** 18 <=
                                values[1]
                                ? ''
                                : 'hidden'
                            } bg-[rgba(255,255,255,0.05)] relative w-full text-center flex flex-col gap-2 rounded-lg border-[0.62px] border-[rgba(255,255,255,0.1)] customShare`}
                          >
                            <div className={`${favPoolList[index] === true ? 'bg-[rgba(255,216,13,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'} z-20 absolute top-[-14px] left-[-14px] cursor-pointer rounded-full w-7 h-7 flex justify-center items-center shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                              onClick={() => handleFavorite(index, pool)}>
                              <Image className='w-3 h-3' src={favPoolList[index] === true ? star_1 : star_2} alt='star_logo' ></Image>
                            </div>
                            <div className='absolute w-full flex justify-end'>
                              <div className='flex justify-center items-center bg-[rgba(255,0,0,1)] text-white text-[9px] font_Inter font-bold py-[2px] pl-2 w-[140px] h-4 rounded-tr-lg rounded-bl-xl'>
                                {pool.listingType ? 'FIXED PRICE LISTING' : 'MARKET PRICE LISTING'}
                              </div>
                            </div>
                            <div className="px-4 pb-4 pt-7 w-full flex flex-col gap-3 cursor-pointer">
                            <div className='flex flex-col gap-3 cursor-pointer'
                                onClick={() => {
                                  setModalKey(index);
                                  setIsFavMobile(true);
                                  setIsFavorite(false);
                                  setIsChartFlag(false);
                                  setIsBuyFlag(false);
                                  setFavValues({
                                    marketPrices: marketPrices[index],
                                    buyPriceEth: buyPriceEth,
                                    buyPrice: buyPrice,
                                    ethPrice: ethPrice
                                  })
                                }}
                              >
                                <div className="flex justify-between">
                                  <div className="flex items-center gap-3">
                                    {pool.tokenSymbol === 'QUICKI' ? (
                                      <Image className='rounded-full' src={QUICKI_URL} alt={`${pool.tokenSymbol}`} height={32} width={32} />
                                    ) : tokenImage != '' ? (
                                      <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={32} width={32} />
                                    ) : (
                                      <a className="flex w-auto items-center justify-center text-center text-xs text-white">
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
                                  <div className="flex flex-col justify-center gap-1">
                                    <div className="flex items-center justify-end gap-1">
                                      <div className={`text-[rgba(100,116,139,1)] flex text-xs font-[Inter]`}>Market Price:</div>
                                      <div className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>{ethPrice ? countLeadingZerosAfterDecimal(ethPrice) + ' ETH' : '-'}</div>
                                    </div>
                                    <div className="flex items-center justify-end gap-1">
                                      <div className={`text-[rgba(100,116,139,1)] flex justify-end font-[Inter] text-[#C4D0E4] text-xs`}>Discount:</div>
                                      {pool.poolData_3?.toString() > '0' ? (
                                        <a className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>{pool.poolData_3?.toFixed(2) / 10}%</a>
                                        ) : (
                                        <a className={`text-[rgba(255,255,255,0.6)] font-[Inter] text-xs`}>-</a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex">
                                  <div className="w-full flex flex-col gap-[6px]">
                                    <div className={`text-[rgba(100,116,139,1)] text-start text-xs font-[Inter]`}>Buy Price:</div>
                                    {pool.poolData_4?.toString() > '0' ? (
                                      <div className="flex items-center justify-start gap-[6px]">
                                        <a className="text-lg font-[Inter] font-semibold text-[rgba(255,255,255,1)]">
                                          {countLeadingZerosAfterDecimal((pool.poolData_4?.toString() *
                                            utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                            10 ** 18)}{' '}
                                          {chainSymbol}
                                        </a>
                                        <a className="text-xs text-[rgba(255,255,255,0.8)] font-roboto">
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
                                            )?.toLocaleString(undefined, {maximumFractionDigits: 2})
                                          )} USD)
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-start gap-[6px]">
                                        <a className="text-lg font-[Inter] font-semibold text-[rgba(255,255,255,1)]">
                                          {marketPrices[index]?.priceNative ? buyPriceEth + ' ' + chainSymbol : '- ' + chainSymbol}
                                        </a>
                                        <a className="text-xs text-[rgba(255,255,255,0.8)] font-roboto">
                                          {marketPrices[index]?.priceUsd ? '($' + buyPrice + ' USD)' : '(- USD)'}
                                        </a>
                                      </div>
                                    )}
                                    <div className='w-full flex gap-3 items-center'>
                                      <div className='flex items-center gap-1'>
                                        <a className={`text-[rgba(100,116,139,1)] text-xs font-[Inter]`}>
                                          Tokens:
                                        </a>
                                        <a className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                          {(
                                            utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                          )?.toLocaleString()}
                                        </a>
                                      </div>

                                      <div className='flex items-center gap-1'>
                                        <a className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Vesting:</a>
                                        {pool.poolData_0?.toString() > '0' ? (
                                          <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                            {pool.poolData_2?.toString() / '10'}% released
                                          </div>
                                        ) : (
                                          <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>100% released</div>
                                        )}

                                        {pool.poolData_0?.toString() > '0' ? (
                                          <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>
                                            +{pool.poolData_1?.toString() / '10'}% /{getVestingSchedule(pool.poolData_0?.toString())}
                                          </div>
                                        ) : (
                                          <div className={`text-[rgba(255,255,255,0.6)] text-xs font-[Inter]`}>-</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (isConnected) {
                                    setModalKey(index);
                                    setIsBuyMobile(true);
                                    setIsFavorite(false);
                                    setIsChartFlag(false);
                                    setIsBuyFlag(false);
                                    setFavValues({
                                      marketPrices: marketPrices[index],
                                      buyPriceEth: buyPriceEth,
                                      buyPrice: buyPrice,
                                      ethPrice: ethPrice
                                    })
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
                                  const resizeEvent = new Event('resize');
                                  window.dispatchEvent(resizeEvent);
                                }} 
                                className={`customShare text-sm font-bold font_Inter py-2 rounded-full bg-[rgba(70,147,163,1)] w-full text-[rgba(255,255,255,0.8)] flex items-center justify-center border-[1.2px] border-[rgba(255,255,255,0.1)]`}>
                                Buy Now
                              </button>
                            </div>
                          </div>
                        )
                      }
                    }
                  })}
              </div>
              {!poolOption && (
                <div className="flex w-full text-xs text-[#8295B3] dark:text-gray-400 md:hidden">
                  <div className="w-full">
                    {newFormattedPoolsData
                      ?.filter(pool => pool.poolType.toString().includes('2') || pool.poolType.toString().includes('3'))
                      .map((pool, index) => {
                        return (
                          <div
                            key={index}
                            className={`${
                              (pool.poolData_4?.toString() *
                                utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                10 ** 18 >=
                                values[0] &&
                              (pool.poolData_4?.toString() *
                                utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                10 ** 18 <=
                                values[1]
                                ? ''
                                : 'hidden'
                            } py-2`}
                          >
                            <div className="w-full rounded-xl bg-white p-2 dark:bg-gray-500/30">
                              <div className="w-full flex-col">
                                <div className="flex justify-between">
                                  <div className="flex">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#374D77] to-[#7993BD] text-center">
                                      {tokenImage != '/App_Logo.png' ? (
                                        <img
                                          src={tokenImage}
                                          className="h-12 w-12 items-center justify-center rounded-full text-center"
                                        />
                                      ) : (
                                        <a className="flex w-auto items-center justify-center text-center text-xs text-white">
                                          {pool?.tokenSymbol}
                                        </a>
                                      )}
                                    </div>
                                    <div className="flex-col justify-start px-2 text-start ">
                                      <div className="text-sm font-semibold text-[#566C90] dark:text-white">
                                        {pool?.tokenName}
                                      </div>
                                      <div className="text-xs">{pool?.tokenSymbol}</div>
                                    </div>
                                  </div>
                                  <div className="flex-col">
                                    <div className="flex items-center justify-between">
                                      <div className="flex justify-end px-1">Market Price:</div>
                                      <div className="flex-col text-[#566C90] dark:text-white">
                                        <div>
                                          {nativeTokenPrice
                                            ? parseFloat(
                                                (pool.poolData_5?.toString() * nativeTokenPrice) / 10 ** 18 / 10 ** 18
                                              ).toFixed(4) +
                                              ' ' +
                                              chainSymbol
                                            : '-'}
                                        </div>
                                        <div className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                          {usdTokenPrice
                                            ? '~$' +
                                              parseFloat(
                                                utils.formatUnits(
                                                  pool.poolData_5?.toString(),
                                                  pool?.tokenDecimals
                                                ) * usdTokenPrice
                                              ).toLocaleString(undefined, {maximumFractionDigits: 2})
                                            : '-'}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                      <div className="flex justify-end px-1">Discount:</div>
                                      {pool.poolData_3?.toString() > '0' ? (
                                        <div className="text-[#566C90] dark:text-white">
                                          {pool.poolData_3?.toString() / '10'}%
                                        </div>
                                      ) : (
                                        <div className="text-[#566C90] dark:text-white">-</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between py-1">
                                  <div className="flex-col">
                                    <div className="py-1">Buy Price</div>
                                    {pool.poolData_4?.toString() > '0' ? (
                                      <div className="flex items-center">
                                        <a className="text-lg font-semibold text-[#566C90] dark:text-white">
                                          {parseFloat((pool.poolData_4?.toString() *
                                            utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                            10 ** 18).toFixed(2)}{' '}
                                          {chainSymbol}
                                        </a>
                                        <div className="flex-col px-1">
                                          <a className="mb-1 flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            ~$
                                            {Number(
                                              parseFloat(
                                                ((pool.poolData_4?.toString() *
                                                  utils.formatUnits(
                                                    pool.poolData_5?.toString(),
                                                    pool?.tokenDecimals
                                                  )) /
                                                  10 ** 18) *
                                                  chainTokenPrice
                                              ).toLocaleString(undefined, {maximumFractionDigits: 2})
                                            )}
                                          </a>
                                          <a className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            Fixed
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <a className="text-lg font-semibold text-[#566C90]">
                                          {parseFloat(
                                            (pool.poolData_5?.toString() * nativeTokenPrice) / 10 ** 18 / 10 ** 18
                                          ).toLocaleString(undefined, {maximumFractionDigits: 2})}{' '}
                                          {chainSymbol}
                                        </a>
                                        <div className="flex-col px-1">
                                          <a className="mb-1 flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            ~$
                                            {Number(
                                              parseFloat(
                                                ((pool.poolData_5?.toString() * nativeTokenPrice) /
                                                  10 ** 18 /
                                                  10 ** 18) *
                                                  chainTokenPrice
                                              ).toLocaleString(undefined, {maximumFractionDigits: 2})
                                            )}
                                          </a>
                                          <a className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            Market
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <a>
                                        Tokens:{' '}
                                        {Number(
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                        )}
                                      </a>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex-col items-end">
                                    <div className="flex justify-end">Vesting</div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex justify-end px-1">Schedule:</div>
                                      {pool.poolData_0?.toString() > '0' ? (
                                        <div className="text-[#566C90] dark:text-white">
                                          <div>
                                            {pool.poolData_1?.toString() / '10'}% /{' '}
                                            {getVestingSchedule(pool.poolData_0?.toString())}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[#566C90] dark:text-white">-</div>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                      <div className="flex justify-end px-1">Initial Release:</div>
                                      {pool.poolData_0?.toString() > '0' ? (
                                        <div className="text-[#566C90] dark:text-white">
                                          <div className="text-xs text-[#566C90] dark:text-white">
                                            {pool.poolData_2?.toString() / '10'}%
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[#566C90] dark:text-white">100%</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="">
                                <BuyConfirmationModal
                                  modalKey={index}
                                  buyType={pool.poolType?.toString()}
                                  buyTokenAddress={pool?.tokenAddress}
                                  buyTokenName={pool?.tokenName}
                                  buyTokenDecimals={pool?.tokenDecimals}
                                  buyTokenSymbol={pool?.tokenSymbol}
                                  buyTokenPoolAddress={pool.poolAddress?.toString()}
                                  buyTokenAmountAvailable={parseFloat(
                                    utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                  ).toFixed(0)}
                                  buyTokenPrice={pool.poolData_4?.toString()}
                                  buyTokenFixedPrice={
                                    (pool.poolData_4?.toString() *
                                      utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                    10 ** chainDecimals
                                  }
                                  buyTokenNativePrice={nativeTokenPrice}
                                  buyTokenUsdPrice={usdTokenPrice}
                                  payTokenSymbol={chainSymbol}
                                  payTokenDecimals={chainDecimals}
                                  buyDiscount={pool.poolData_3?.toString() / '10'}
                                  buyVestingInitialAmount={pool.poolData_2?.toString() / '10'}
                                  buyVestingSchedulePercent={pool.poolData_1?.toString() / '10'}
                                  buyVestingScheduleTimeframe={getVestingSchedule(pool.poolData_0?.toString())}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
              {poolOption && (
                <div className="flex w-full text-xs text-[#8295B3] dark:text-gray-400 md:hidden">
                  <div className="w-full">
                    {newFormattedPoolsData
                      ?.filter(pool => pool.poolType.toString().includes('1'))
                      .map((pool, index) => {
                        return (
                          <div
                            key={index}
                            className={`${
                              (pool.poolData_4?.toString() *
                                utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                10 ** 18 >=
                                values[0] &&
                              (pool.poolData_4?.toString() *
                                utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                10 ** 18 <=
                                values[1]
                                ? ''
                                : 'hidden'
                            } py-2`}
                          >
                            <div className="w-full rounded-xl bg-white p-2 dark:bg-gray-500/30">
                              <div className="w-full flex-col">
                                <div className="flex justify-between">
                                  <div className="flex">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#374D77] to-[#7993BD] text-center">
                                      {tokenImage != '/App_Logo.png' ? (
                                        <img
                                          src={tokenImage}
                                          className="h-12 w-12 items-center justify-center rounded-full text-center"
                                        />
                                      ) : (
                                        <a className="flex w-auto items-center justify-center text-center text-xs text-white">
                                          {pool?.tokenSymbol}
                                        </a>
                                      )}
                                    </div>
                                    <div className="flex-col justify-start px-2 text-start ">
                                      <div className="text-sm font-semibold text-[#566C90] dark:text-white">
                                        {pool?.tokenName}
                                      </div>
                                      <div className="text-xs">{pool?.tokenSymbol}</div>
                                    </div>
                                  </div>
                                  <div className="flex-col">
                                    <div className="flex items-center justify-between">
                                      <div className="flex justify-end px-1">Market Price:</div>
                                      <div className="flex-col text-[#566C90] dark:text-white">
                                        <div>
                                          {nativeTokenPrice
                                            ? parseFloat(
                                                (pool.poolData_5?.toString() * nativeTokenPrice) / 10 ** 18 / 10 ** 18
                                              ).toFixed(4) +
                                              ' ' +
                                              chainSymbol
                                            : '-'}
                                        </div>
                                        <div className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                          {usdTokenPrice
                                            ? '~$' +
                                              parseFloat(
                                                utils.formatUnits(
                                                  pool.poolData_5?.toString(),
                                                  pool?.tokenDecimals
                                                ) * usdTokenPrice
                                              ).toLocaleString(undefined, {maximumFractionDigits: 2})
                                            : '-'}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                      <div className="flex justify-end px-1">Discount:</div>
                                      {pool.poolData_3?.toString() > '0' ? (
                                        <div className="text-[#566C90] dark:text-white">
                                          {pool.poolData_3?.toString() / '10'}%
                                        </div>
                                      ) : (
                                        <div className="text-[#566C90] dark:text-white">-</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between py-1">
                                  <div className="flex-col">
                                    <div className="py-1">Buy Price</div>
                                    {pool.poolData_4?.toString() > '0' ? (
                                      <div className="flex items-center">
                                        <a className="text-lg font-semibold text-[#566C90] dark:text-white">
                                          {parseFloat(
                                            (pool.poolData_4?.toString() *
                                              utils.formatUnits(
                                                pool.poolData_5?.toString(),
                                                pool?.tokenDecimals
                                              )) /
                                              10 ** 18
                                          ).toLocaleString(undefined, {maximumFractionDigits: 2})}{' '}
                                          {chainSymbol}
                                        </a>
                                        <div className="flex-col px-1">
                                          <a className="mb-1 flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            ~$
                                            {Number(
                                              parseFloat(
                                                ((pool.poolData_4?.toString() *
                                                  utils.formatUnits(
                                                    pool.poolData_5?.toString(),
                                                    pool?.tokenDecimals
                                                  )) /
                                                  10 ** 18) *
                                                  chainTokenPrice
                                              ).toLocaleString(undefined, {maximumFractionDigits: 2})
                                            )}
                                          </a>
                                          <a className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            Fixed
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <a className="text-lg font-semibold text-[#566C90]">
                                          {parseFloat(
                                            (pool.poolData_5?.toString() * nativeTokenPrice) / 10 ** 18 / 10 ** 18
                                          ).toFixed(4)}{' '}
                                          {chainSymbol}
                                        </a>
                                        <div className="flex-col px-1">
                                          <a className="mb-1 flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            ~$
                                            {Number(
                                              parseFloat(
                                                ((pool.poolData_5?.toString() * nativeTokenPrice) /
                                                  10 ** 18 /
                                                  10 ** 18) *
                                                  chainTokenPrice
                                              ).toLocaleString(undefined, {maximumFractionDigits: 2})
                                            )}
                                          </a>
                                          <a className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                            Market
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <a>
                                        Tokens:{' '}
                                        {Number(
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                        )}
                                      </a>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex-col items-end">
                                    <div className="flex justify-end">Vesting</div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex justify-end px-1">Schedule:</div>
                                      {pool.poolData_0?.toString() > '0' ? (
                                        <div className="text-[#566C90] dark:text-white">
                                          <div>
                                            {pool.poolData_1?.toString() / '10'}% /{' '}
                                            {getVestingSchedule(pool.poolData_0?.toString())}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[#566C90] dark:text-white">-</div>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                      <div className="flex justify-end px-1">Initial Release:</div>
                                      {pool.poolData_0?.toString() > '0' ? (
                                        <div className="text-[#566C90] dark:text-white">
                                          <div className="text-xs text-[#566C90] dark:text-white">
                                            {pool.poolData_2?.toString() / '10'}%
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[#566C90] dark:text-white">100%</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="">
                                <BuyConfirmationModal
                                  modalKey={index}
                                  buyType={pool.poolType?.toString()}
                                  buyTokenAddress={pool?.tokenAddress}
                                  buyTokenName={pool?.tokenName}
                                  buyTokenDecimals={pool?.tokenDecimals}
                                  buyTokenSymbol={pool?.tokenSymbol}
                                  buyTokenPoolAddress={pool.poolAddress?.toString()}
                                  buyTokenAmountAvailable={parseFloat(
                                    utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)
                                  ).toFixed(0)}
                                  buyTokenPrice={pool.poolData_4?.toString()}
                                  buyTokenFixedPrice={
                                    (pool.poolData_4?.toString() *
                                      utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                    10 ** chainDecimals
                                  }
                                  buyTokenNativePrice={nativeTokenPrice}
                                  buyTokenUsdPrice={usdTokenPrice}
                                  payTokenSymbol={chainSymbol}
                                  payTokenDecimals={chainDecimals}
                                  buyDiscount={pool.poolData_3?.toString() / '10'}
                                  buyVestingInitialAmount={pool.poolData_2?.toString() / '10'}
                                  buyVestingSchedulePercent={pool.poolData_1?.toString() / '10'}
                                  buyVestingScheduleTimeframe={getVestingSchedule(pool.poolData_0?.toString())}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default SearchedTokenPools
