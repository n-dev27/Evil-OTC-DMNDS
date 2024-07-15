import React, { useEffect, useState, useMemo, useContext } from 'react';
import Image from 'next/image';
import { utils } from 'ethers';
import { useBalance, useNetwork } from 'wagmi';
import { toast } from "react-hot-toast";
import { Range, getTrackBackground } from 'react-range';
import { LinkIcon, PlusCircleIcon, ChartBarIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import ShareModal from './ShareModal';
import { getVestingSchedule } from '../../utils/getVestingSchedule';
import Pagination from '../../utils/Pagination';
import { getSvgLogoPath } from '../../assets/symbol/svgIcons';
import { LayoutContext } from '../layout/layout';
import { tokenCoinPair } from '../../utils/tokenCoinPair';
import { createList, getOneList, deleteList } from '../../services/favListServices';
import { getTokenPair, getTokenPrice2 } from '../../services/tokenInfoServices';
import { countLeadingZerosAfterDecimal } from '../../utils/countDecimals';
import sort_arrow_up from '../../assets/sort_arrow_up.svg'
import sort_arrow_down from '../../assets/sort_arrow_down.svg'
import star_1 from '../../assets/star_1.svg'
import star_2 from '../../assets/star_2.svg'

const AllPublicPools = ({ setIsBuyFlag, setIsChartFlag, setIsFavorite, filterFlag, setFavArray, setDiscountListing, poolRouterAddress, showShareModal, setShowShareModal, poolInfo, setPoolInfo, isConnected, address, setSearchToken, formattedPoolsData, setFormattedPoolsData, data, loading, setModalKey, poolOption }) => {

  const { data: chainData } = useBalance({
    address: address,
  });
  const { chain } = useNetwork();

  const { setIsFavMobile, setIsChartMobile, setIsBuyMobile, setFavValues, hotButtonFlag, poolListFlag, chainTokenPrice, setChainTokenPrice } = useContext(LayoutContext);
  const [marketPrices, setMarketPrices] = useState([]);
  const [viewIndex, setViewIndex] = useState(false);
  const [shareView, setShareView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [values, setValues] = useState([0, 25]);
  const [favPoolList, setFavPoolList] = useState([]);
  const [sortFlag, setSortFlag] = useState(false);

  let QUICKI_URL = "https://coinando.com/static/assets/coins/quick-intel-logo.png";
  let chainSymbol = chainData?.symbol ? chainData?.symbol : 'ETH';
  let chainDecimals = chainData?.decimals ? chainData?.decimals : 18;
  let PageSize = 5;

  async function getTokenPrice(token_symbol) {
    if (chain?.id != (42161 || 56 || 137 || 97 || 80001 || 1)) {
      return
    } else {
    const response = await tokenCoinPair(
      token_symbol,
      chain?.id.toString(),
    );
    return response;
    }
  };

  const validateInputFrom = (valueFrom) => {
    if (valueFrom < 0) {
      valueFrom = 0;
    }
    return valueFrom;
  };

  const validateInputTo = (valueTo) => {
    if (valueTo > 25) {
      valueTo = 25;
    }
    return valueTo;
  };

  const handleValueFrom = (valueFrom) => {
    if (valueFrom === "") valueFrom = 0
    setValues([valueFrom, values[1]]);
  };

  const handleValueTo = (valueTo) => {
    setValues([values[0], valueTo]);
  };

  useEffect(() => {
    const fetchMarketPrices = async () => {
      const favList = await getOneList(address);
      setFavArray(favList?.data.data)
      if (data && data.pools) {
        const discountListingData = await Promise.all(data.pools
          .filter(pool => {
            const filterResult = pool?.tokenSelling?.amountAvailable > '0';
            return filterResult;
          })
          .map(async (pool) => {
            const symbolPrice = await getTokenPrice(pool?.tokenSelling?.tokenSymbol);
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
              poolData_6: symbolPrice ? pool?.tokenSelling?.amountAvailable * symbolPrice : 0,
              tokenName: pool?.tokenSelling?.tokenName,
              tokenSymbol: pool?.tokenSelling?.tokenSymbol,
              tokenAddress: pool?.tokenSelling?.tokenAddress,
              tokenDecimals: pool?.tokenSelling?.decimals,
              listingType: pool?.fixedPrice,
            };
          }));
      
        const poolData = data?.pools && data?.pools
          .filter(pool => {
            if (poolRouterAddress !== '0') {
              const filterResult = pool?.poolAddress.toLowerCase() === poolRouterAddress.toLowerCase();
              return filterResult;
            } else {
              const filterResult = pool?.tokenSelling?.amountAvailable > '0';
              return filterResult;
            }
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

          console.log('poolData === ', poolData)

        if (poolData) {
          poolData.sort((a, b) => (a.poolCreatedTimestamp < b.poolCreatedTimestamp) ? 1 : (a.poolCreatedTimestamp > b.poolCreatedTimestamp) ? -1 : 0);
          if (favList?.data.data !== null) {
            const newArray = poolData.map(item => favList?.data.data?.pool_list.includes(item.poolAddress))
            setFavPoolList(newArray);
          };
          setFormattedPoolsData(poolData);
        }

        if (discountListingData) {
          if (hotButtonFlag === 0 || hotButtonFlag === 2) {
            const disListng = discountListingData.sort((a, b) => b.poolData_3 - a.poolData_3);
            setDiscountListing(disListng.length > 15 ? disListng.slice(0, 15) : disListng);
          } else {
            const disListng = discountListingData.sort((a, b) => b.poolData_5 - a.poolData_5);
            setDiscountListing(disListng.length > 15 ? disListng.slice(0, 15) : disListng);
          }
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
        //       {
        //         priceUsd: 0,
        //         priceNative: 0,
        //       } :
        //       {
        //         priceUsd: parseFloat(marketPrice?.data[0]?.priceUsd),
        //         priceNative: parseFloat(marketPrice?.data[0]?.priceNative)
        //       };
        //     updatedMarketPrices.push(updatedPool);
        //   }
        // }
        // setMarketPrices(updatedMarketPrices);
      };
      const tokenPrice = await getTokenPrice2('ETH');
      setChainTokenPrice(tokenPrice?.data?.ETH?.USD);
    };

    fetchMarketPrices();
  }, [data, hotButtonFlag, poolListFlag]);

  const formattedPools = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize
    const lastPageIndex = firstPageIndex + PageSize
    return formattedPoolsData?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, formattedPoolsData]);

  const handleFavorite = async(index, pool) => {
    let newFavPoolList = [...favPoolList];
    let response;

    if (newFavPoolList[index]) {
      newFavPoolList[index] = false;
      response = await deleteList(address, '', pool.poolAddress);
      console.log('delete response == ', response)
    } else {
      newFavPoolList[index] = true;
      
      const data = {
        userWalletAddr: address,
        tokenAddr: '',
        poolAddr: pool.poolAddress,
      }
      
      response = await createList(data)
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
  };

  const handleShare = (pool) => {
    setShowShareModal(true);
    setPoolInfo(pool);
  };

  return (
    <div className='h-full'>
      {showShareModal && (
        <ShareModal isOpen={showShareModal} setIsOpen={setShowShareModal} poolInfo={poolInfo} />
      )}
        <div>
          {filterFlag && 
            <div className="flex flex-col sm:flex-row w-full justify-center px-4 sm:gap-20 sm:pt-5 sm:pb-1 sm:px-8">
              <div className='hidden sm:flex gap-4 justify-center items-center w-full'>
                <div className="whitespace-nowrap">
                  <h1 className="font-[Inter] text-[rgba(255,255,255,0.4)] text-lg">Price filter</h1>
                </div>
                <div className="flex mr-2 w-full px-4">
                  <Range
                    step={0.2}
                    min={0}
                    max={25}
                    values={values}
                    onChange={values => setValues(values)}
                    renderTrack={({ props, children }) => (
                      <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={{
                          ...props.style,
                          height: '10px',
                          width: '100%',
                          borderRadius: '0.25rem',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <div
                          ref={props.ref}
                          style={{
                            height: '10px',
                            width: '100%',
                            borderRadius: '1rem',
                            background: getTrackBackground({
                              values,
                              colors: ['rgba(255,255,255,0.1)', 'rgba(70,147,163,1)', 'rgba(255,255,255,0.1)'],
                              min: 0,
                              max: 25,
                            }),
                            alignSelf: 'center',
                          }}
                        >
                          {children}
                        </div>
                      </div>
                    )}
                    renderThumb={({ index, props, isDragged }) => (
                      <div
                      className="bg-gradient-to-b from-[#354B75] to-[#A2B5D2] rounded-full border-[0.32px] border-white"
                      {...props}
                      style={{
                          ...props.style,
                          height: '20px',
                          width: '20px',
                          borderRadius: '25px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <div className='flex items-center mb-11 text-xs text-[rgba(255,255,255,0.6)] font-[Inter]'>
                          {values[index].toFixed(1)}&nbsp;{chainSymbol}
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div className='w-full hidden gap-3 font-[Inter]'>
                  <div className='w-1/2 h-[45px] bg-[#343E6D] rounded-[10px] py-2 px-3 flex flex-col justify-start'>
                    <p className='text-start text-[10px] text-[#B9BCC7]'>From</p>
                    <input
                      id="fromInput"
                      type="number" 
                      min="0" 
                      max="25"
                      defaultValue={0}
                      value={values[0]}
                      onChange={(e) => {
                        const inputValue = parseFloat(e.target.value);
                        if (isNaN(inputValue)) {
                          handleValueFrom("");
                        } else {
                          handleValueFrom(validateInputFrom(inputValue));
                        }
                      }}
                      className="placeholder-[#94A3B8] bg-transparent p-0 font-medium text-[0.8rem] w-full text-[#94A3B8] border-none outline-none focus:outline-none focus:ring-transparent"
                      placeholder="0 ETH"
                    />
                  </div>
                  <div className='w-1/2 h-[45px] bg-[#343E6D] rounded-[10px] py-2 px-3 flex flex-col justify-start'>
                    <p className='text-start text-[10px] text-[#B9BCC7]'>To</p>
                    <input
                      id="toInput" 
                      type="number" 
                      min="0" 
                      max="25"
                      defaultValue={25}
                      values={values[1]}
                      onChange={(e) => {
                        const inputValue = parseFloat(e.target.value);
                        if (isNaN(inputValue)) {
                          handleValueTo(0);
                        } else {
                          handleValueTo(validateInputTo(inputValue));
                        }
                      }}
                      className="placeholder-[#94A3B8] bg-transparent p-0 font-medium text-[0.8rem] w-full text-[#94A3B8] border-none outline-none focus:outline-none focus:ring-transparent"
                      placeholder="0 ETH"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile mode */}
              <div className='w-full flex sm:hidden pt-3 pb-2 gap-6 items-center'>
                <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter] whitespace-nowrap'>Price filter:</p>
                <div className="flex w-[70%]">
                  <Range
                    step={0.2}
                    min={0}
                    max={25}
                    values={values}
                    onChange={values => setValues(values)}
                    renderTrack={({ props, children }) => (
                      <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={{
                          ...props.style,
                          height: '7px',
                          width: '100%',
                          borderRadius: '0.25rem',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <div
                          ref={props.ref}
                          style={{
                            height: '7px',
                            width: '100%',
                            borderRadius: '1rem',
                            background: getTrackBackground({
                              values,
                              colors: ['rgba(255,255,255,0.1)', 'rgba(70,147,163,1)', 'rgba(255,255,255,0.1)'],
                              min: 0,
                              max: 25,
                            }),
                            alignSelf: 'center',
                          }}
                        >
                          {children}
                        </div>
                      </div>
                    )}
                    renderThumb={({ index, props, isDragged }) => (
                      <div
                      className="bg-gradient-to-b from-[#354B75] to-[#A2B5D2] rounded-full border-[0.32px] border-white"
                      {...props}
                      style={{
                          ...props.style,
                          height: '12px',
                          width: '12px',
                          borderRadius: '60px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <div className='flex items-center mb-8 text-[8px] text-[rgba(255,255,255,0.6)] font-[Inter]'>
                          {values[index].toFixed(1)}&nbsp;{chainSymbol}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className='flex sm:hidden gap-2 pt-2 pb-1 items-center'
                onClick={() => setSortFlag(!sortFlag)}
              >
                <p className='text-[rgba(255,255,255,0.6)] font-[Inter] text-xs'>Short by: Supply</p>
                {sortFlag ? (
                    <Image src={sort_arrow_down} alt='down_logo'></Image>
                  ) : (
                  <Image src={sort_arrow_up} alt='up_logo'></Image>
                )}
              </div>

              <div className='hidden sm:flex gap-2'>
                <button className='flex justify-center items-center gap-2 min-w-[155px] py-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.1)] text-base font-[Inter] text-[rgba(255,255,255,0.8)]'>
                  All Tokens
                  <ChevronDownIcon className='w-5 h-5' color='rgba(255,255,255,0.6)' />
                </button>
                <button className='flex justify-center items-center gap-2 min-w-[203px] py-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.1)] text-base font-[Inter] text-[rgba(255,255,255,0.8)]'
                  onClick={() => setSortFlag(!sortFlag)}
                >
                  Short by: Supply
                  {sortFlag ? (
                    <Image src={sort_arrow_down} alt='down_logo'></Image>
                  ) : (
                  <Image src={sort_arrow_up} alt='up_logo'></Image>
                  )}
                </button>
              </div>
            </div>
          }

          {loading ? (
            <>
              <div className="w-full gap-5 hidden lp:flex flex-col px-8 pt-5">
                <div className="relative w-full h-[107px] text-center gap-2 flex flex-col rounded-xl bg-white/10">
                  <div className="flex animate-pulse flex-col gap-3 h-full w-full">
                    <div className='w-full h-full flex items-center px-8'>
                      <div className='grid grid-cols-5 w-full'>
                        <div className='col-span-1 text-start flex items-center'>
                          <div className="flex w-auto items-center">
                            <button>
                              <div className="flex bg-slate-400 h-[40px] w-[40px] items-center justify-center rounded-full text-center">
                              </div>
                            </button>
                            <div className="flex gap-1 flex-col justify-center pl-2 text-start">
                              <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                              <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                            </div>
                          </div>
                        </div>
                        <div className='col-span-3 flex flex-col gap-[3px]'>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                        </div>
                        <div className='col-span-1 flex justify-end items-center '>
                          <div className='flex flex-col gap-[3px]'>
                            <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                            <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-[107px] text-center gap-2 flex flex-col rounded-xl bg-white/10">
                  <div className="flex animate-pulse flex-col gap-3 h-full w-full">
                    <div className='w-full h-full flex items-center px-8'>
                      <div className='grid grid-cols-5 w-full'>
                        <div className='col-span-1 text-start flex items-center'>
                          <div className="flex w-auto items-center">
                            <button>
                              <div className="flex bg-slate-400 h-[40px] w-[40px] items-center justify-center rounded-full text-center">
                              </div>
                            </button>
                            <div className="flex gap-1 flex-col justify-center pl-2 text-start">
                              <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                              <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                            </div>
                          </div>
                        </div>
                        <div className='col-span-3 flex flex-col gap-[3px]'>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                        </div>
                        <div className='col-span-1 flex justify-end items-center '>
                          <div className='flex flex-col gap-[3px]'>
                            <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                            <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-[107px] text-center gap-2 flex flex-col rounded-xl bg-white/10">
                  <div className="flex animate-pulse flex-col gap-3 h-full w-full">
                    <div className='w-full h-full flex items-center px-8'>
                      <div className='grid grid-cols-5 w-full'>
                        <div className='col-span-1 text-start flex items-center'>
                          <div className="flex w-auto items-center">
                            <button>
                              <div className="flex bg-slate-400 h-[40px] w-[40px] items-center justify-center rounded-full text-center">
                              </div>
                            </button>
                            <div className="flex gap-1 flex-col justify-center pl-2 text-start">
                              <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                              <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                            </div>
                          </div>
                        </div>
                        <div className='col-span-3 flex flex-col gap-[3px]'>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          <div className='bg-slate-400 rounded-md h-[14px]'></div>
                        </div>
                        <div className='col-span-1 flex justify-end items-center '>
                          <div className='flex flex-col gap-[3px]'>
                            <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                            <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!filterFlag ? (
                  <div className="relative w-full h-[107px] text-center gap-2 flex flex-col rounded-xl bg-white/10">
                    <div className="flex animate-pulse flex-col gap-3 h-full w-full">
                      <div className='w-full h-full flex items-center px-8'>
                        <div className='grid grid-cols-5 w-full'>
                          <div className='col-span-1 text-start flex items-center'>
                            <div className="flex w-auto items-center">
                              <button>
                                <div className="flex bg-slate-400 h-[40px] w-[40px] items-center justify-center rounded-full text-center">
                                </div>
                              </button>
                              <div className="flex gap-1 flex-col justify-center pl-2 text-start">
                                <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                                <div className='bg-slate-400 rounded-md h-4 w-[40px] text-[#7B8EAD] text-lg font-bold'></div>
                              </div>
                            </div>
                          </div>
                          <div className='col-span-3 flex flex-col gap-[3px]'>
                            <div className='bg-slate-400 rounded-md h-[14px]'></div>
                            <div className='bg-slate-400 rounded-md h-[14px]'></div>
                            <div className='bg-slate-400 rounded-md h-[14px]'></div>
                          </div>
                          <div className='col-span-1 flex justify-end items-center '>
                            <div className='flex flex-col gap-[3px]'>
                              <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                              <div className='bg-slate-400 rounded-md h-4 w-[80px] text-[#7B8EAD] text-lg font-bold'></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : <></>}
              </div>

              <div className='w-full gap-5 flex lp:hidden flex-col px-4 pt-4'>
                <div className='relative w-full h-[180px] text-center rounded-lg bg-[rgba(255,255,255,0.05)]'>
                  <div className='flex flex-col justify-between animate-pulse pt-7 px-4 pb-4 w-full h-full'>
                    <div className='w-full flex justify-between'>
                      <div className="flex bg-slate-400 h-8 w-8 items-center justify-center rounded-full text-center">
                      </div>
                      <div className='flex flex-col gap-1'>
                        <div className='bg-slate-400 rounded-md h-4 w-[250px] text-[#7B8EAD] text-lg font-bold'></div>
                        <div className='bg-slate-400 rounded-md h-4 w-[250px] text-[#7B8EAD] text-lg font-bold'></div>
                      </div>
                    </div>
                    <div className='w-full flex flex-col justify-center gap-1'>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                    </div>
                  </div>
                </div>
                <div className='relative w-full h-[180px] text-center rounded-lg bg-[rgba(255,255,255,0.05)]'>
                  <div className='flex flex-col justify-between animate-pulse pt-7 px-4 pb-4 w-full h-full'>
                    <div className='w-full flex justify-between'>
                      <div className="flex bg-slate-400 h-8 w-8 items-center justify-center rounded-full text-center">
                      </div>
                      <div className='flex flex-col gap-1'>
                        <div className='bg-slate-400 rounded-md h-4 w-[250px] text-[#7B8EAD] text-lg font-bold'></div>
                        <div className='bg-slate-400 rounded-md h-4 w-[250px] text-[#7B8EAD] text-lg font-bold'></div>
                      </div>
                    </div>
                    <div className='w-full flex flex-col justify-center gap-1'>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                      <div className='bg-slate-400 rounded-md h-4 w-[300px] text-[#7B8EAD] text-lg font-bold'></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
            ) : (
            data?.pools && data?.pools?.length > 0 && (
              <>
                <div className={`${filterFlag ? 'h-[calc(100vh-458px)]' : 'h-[calc(100vh-384px)]'} hidden lp:flex flex-col px-8 overflow-y-auto`}>
                  {formattedPoolsData?.map((pool, index) => {
                    let tokenImage = getSvgLogoPath(pool.tokenSymbol);
                    const marketValue = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceUsd;
                    const ethPrice = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceNative;
                    const buyPriceEth = pool.poolData_3 === 0 ? parseFloat(ethPrice).toFixed(4) : parseFloat(ethPrice * (100 - pool.poolData_3 / 10) / 100).toFixed(4);
                    const buyPrice = pool.poolData_3 === 0 ? parseFloat(marketValue).toFixed(2) : parseFloat(marketValue * (100 - pool.poolData_3 / 10) / 100).toFixed(2);
                    const A = pool.poolData_4?.toString() * utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals) / 10 ** chainDecimals
                    const B = pool.poolData_4?.toString() * utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals) / 10 ** chainDecimals
  
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
                          } relative min-h-[107px] text-center gap-2 mt-5 flex flex-col rounded-xl border border-[rgba(255,255,255,0.1)] border-solid bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.01)] hover:border-[rgba(28,118,255,1)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]`}
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
                              }}>
                              <div className='grid grid-cols-5 w-full'
                              >
                                <div className='col-span-1 text-start flex items-center'>
                                  <div className="flex w-auto items-center">
                                    <button className='w-8 h-8 rounded-full'>
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
                                  <div className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[14px]'>{ethPrice ? countLeadingZerosAfterDecimal(ethPrice) : '-'} ETH&nbsp;</div>
                                  <div className='text-[rgba(100,116,139,1)] font-[Inter] text-xs'>{marketValue ? '$' + countLeadingZerosAfterDecimal(marketValue) : '-'} USD</div>
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 text-[rgba(100,116,139,1)] text-xs items-center font-[Inter]">
                                    BUY PRICE
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  {pool.poolData_4?.toString() > '0' ? (
                                    <div className='flex flex-col gap-1'>
                                      <div className='text-[rgba(255,0,0,1)] text-[14px] font-semibold'>
                                        {countLeadingZerosAfterDecimal((pool.poolData_4?.toString() *
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                          10 ** 18)}{' '}
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
                                                : 'N/A'} USD */}
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
                                      <div>-</div>
                                    )}
                                  </div>
                                  <div className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                    {pool.poolData_1?.toString() > '0' ?
                                    <div>
                                    Then, {pool.poolData_1?.toString() / '10'}% / {getVestingSchedule(pool.poolData_0?.toString())}
                                    </div>
                                    :
                                    <div>-</div>}
                                  </div>
                                </div>
                                {/* <div className='col-span-1 flex flex-col gap-[6px] justify-center items-center '>
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
                                  <div className='text-[rgba(255,255,255,0.8)] font-[Inter] text-[14px]'>{ethPrice ? countLeadingZerosAfterDecimal(ethPrice) : '-'} ETH&nbsp;</div>
                                  <div className='text-[rgba(100,116,139,1)] font-[Inter] text-xs'>{marketValue ? '$' + countLeadingZerosAfterDecimal(marketValue) : '-'} USD</div>
                                </div>
                                <div className='col-span-1 flex flex-col gap-1 text-start'>
                                  <div className="inline-flex gap-1 text-[rgba(100,116,139,1)] text-xs items-center font-[Inter]">
                                    BUY PRICE
                                    <InformationCircleIcon className="h-[14px] w-[14px]" color='rgba(100,116,139,1)'/>
                                  </div>
                                  {pool.poolData_4?.toString() > '0' ? (
                                    <div className='flex flex-col gap-1'>
                                      <div className='text-[rgba(255,0,0,1)] text-[14px] font-semibold'>
                                        {countLeadingZerosAfterDecimal((pool.poolData_4?.toString() *
                                          utils.formatUnits(pool.poolData_5?.toString(), pool?.tokenDecimals)) /
                                          10 ** 18)}{' '}
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
                                                : 'N/A'} USD */}
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
                                      <div>-</div>
                                    )}
                                  </div>
                                  <div className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>
                                    {pool.poolData_1?.toString() > '0' ?
                                    <div>
                                    Then, {pool.poolData_1?.toString() / '10'}% / {getVestingSchedule(pool.poolData_0?.toString())}
                                    </div>
                                    :
                                    <div>-</div>}
                                  </div>
                                </div>
                                {/* <div className='col-span-1 flex flex-col gap-1 justify-center items-center '>
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
  
                <div className="hidden lp:flex justify-center p-2 text-center">
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={formattedPoolsData && formattedPoolsData?.length}
                    pageSize={PageSize}
                    onPageChange={page => setCurrentPage(page)}
                  />
                </div>
                <div className={`${filterFlag ? 'h-[calc(100vh-370px)]' : 'h-[calc(100vh-300px)]'} flex w-full flex-col gap-5 px-4 py-4 lp:hidden overflow-y-auto`}>
                  {formattedPoolsData?.map((pool, index) => {
                    let tokenImage = getSvgLogoPath(pool.tokenSymbol)
                    const marketValue = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceUsd;
                    const ethPrice = marketPrices.find(data => data.baseToken.address.toLowerCase() === pool.tokenAddress.toLowerCase())?.priceNative;
                    const buyPriceEth = pool.poolData_3 === 0 ? parseFloat(ethPrice).toFixed(4) : parseFloat(ethPrice * (100 - pool.poolData_3 / 10) / 100).toFixed(4);
                    const buyPrice = pool.poolData_3 === 0 ? parseFloat(marketValue).toFixed(2) : parseFloat(marketValue * (100 - pool.poolData_3 / 10) / 100).toFixed(2);
                    const A = pool?.poolData_4?.toString() * utils.formatUnits(pool?.poolData_5?.toString(), pool?.tokenDecimals) / 10 ** chainDecimals
                    const B = pool?.poolData_4?.toString() * utils.formatUnits(pool?.poolData_5?.toString(), pool?.tokenDecimals) / 10 ** chainDecimals
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
              </>
            )
          )}
        </div>
    </div>
  )
}

export default AllPublicPools
