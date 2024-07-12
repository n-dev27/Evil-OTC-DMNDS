import React, { useEffect, useContext, useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, Typography } from "@material-tailwind/react";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import moment from 'moment-timezone';
import { utils } from 'ethers';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { useQuery } from "@apollo/client";
import { GET_POOL_INFO } from '../../constants/graphql/query';
import Pagination from '../../utils/Pagination';
import { getVestingSchedule } from '../../utils/getVestingSchedule';
import UpdatePoolModal from '../poolComponents/UpdatePoolModal';
import CancelPools from '../poolComponents/CancelPool';
import { getSvgLogoPath } from '../../assets/symbol/svgIcons';
import emptySVG from '../../assets/empty_box.svg';
import { LayoutContext } from '../layout/layout';
import { getTokenPair } from '../../services/tokenInfoServices';
import { countLeadingZerosAfterDecimal } from '../../utils/countDecimals';
import hide from '../../assets/hide.svg';

function TxPendingSellContainer () {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: chainData } = useBalance({
    address: address,
  });

  const { loading, error, data, refetch } = useQuery(GET_POOL_INFO);
  const { routerPath } = useContext(LayoutContext);
  const [buttonFlag, setButtonFlag] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [formattedCreatedPoolsData, setFormattedCreatedPoolsData] = useState();
  const [formattedPurchaseData, setFormattedPurchaseData] = useState();
  const [viewIndex, setViewIndex] = useState(null);
  const [clickDetail, setClickDetail] = useState(false);
  const [clickDetailIndex, setClickDetailIndex] = useState(null);

  let PageSize = 10
  const TABLE_HEAD = ["Token", "Sold", "Pending", "Pool Type", "Vesting", "Discount", "Sell Price/ Token", "Amount Received", "Time"];

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMarketPrices = async () => {
      setSellLoading(true);
      if(data && data.pools && address) {
        const poolData = await Promise.all(data.pools.filter(item => {
          const filterResult = item?.tokenSelling?.amountAvailable > '0' && item?.poolCreator.toLowerCase() === address.toLowerCase();
          return filterResult;
        })
          .map(async (pool) => {
            const marketPrice = await getTokenPair(pool?.tokenSelling?.tokenAddress);
            return {
              poolHidden: pool?.visibility,
              poolAddress: pool?.poolAddress,
              poolCreator: pool?.poolCreator,
              poolType: pool?.poolType,
              poolValue: pool?.poolValue,
              priceUsd: marketPrice && marketPrice?.data[0]?.priceUsd,
              priceNative: marketPrice && marketPrice?.data[0]?.priceNative,
              poolCreatedTimestamp: Number(Number(pool?.detail?.blockTimestamp) * 1000),
              poolData_0: pool?.poolOptions?.vestingOptions?.vestingPercentPerPeriod,
              poolData_1: pool?.poolOptions?.vestingOptions?.vestingPeriod,
              poolData_2: pool?.poolOptions?.vestingOptions?.initialReleasePercent,
              poolData_3: parseInt(pool?.poolOptions?.discountPercent),
              poolData_4: pool?.fixedPricePerToken,
              poolData_5: pool?.tokenSelling?.amountAvailable,
              poolData_6: pool?.tokenSelling?.amount,
              tokenName: pool?.tokenSelling?.tokenName,
              tokenSymbol: pool?.tokenSelling?.tokenSymbol,
              tokenAddress: pool?.tokenSelling?.tokenAddress, 
              tokenDecimals: pool?.tokenSelling?.decimals,
              listingType: pool?.fixedPrice,
            };
          }
        ));
      poolData && poolData.sort((a, b) => (a.poolCreatedTimestamp < b.poolCreatedTimestamp) ? 1 : (a.poolCreatedTimestamp > b.poolCreatedTimestamp) ? -1 : 0)
      setFormattedCreatedPoolsData(poolData);

      const purchaseData = data?.purchaseDatas && data?.purchaseDatas.map((pool, index) => {
        return {
          poolAddress: pool?.poolAddress,
          publicSaleAmount: pool?.publicSaleAmount,
          poolType: pool?.poolType,
          priceType: pool?.priceType,
          tokenName: pool?.tokenBuying?.tokenName,
          tokenSymbol: pool?.tokenBuying?.tokenSymbol,
          tokenAddress: pool?.tokenBuying?.tokenAddress,
          tokenDecimals: pool?.tokenBuying?.decimals,
          vestingSet: pool?.vesting?.vestingSet,
          vestingAmountReleased: pool?.vesting?.vestingAmountReleased,
          vestingAmountPending: pool?.vesting?.vestingAmountPending,
          vestingAmountPerPeriod: pool?.vesting?.vestingAmountPerPeriod,
          vestingPeriod: pool?.vesting?.vestingPeriod,
          buyer: pool?.buyers
        }
      });
      setFormattedPurchaseData(purchaseData);
      setSellLoading(false);
    };
  };
  
      fetchMarketPrices();
  }, [data, isChanged, address]);

  useEffect(() => {
    refetch();
  }, [routerPath]);

  const formattedCreatedPools = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize
    const lastPageIndex = firstPageIndex + PageSize
    return formattedCreatedPoolsData?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, formattedCreatedPoolsData]);

  const emptyAddress = '0x0000000000000000000000000000000000000000';

  const onClickView = (index) => {
    setViewIndex(index);
    setButtonFlag(!buttonFlag);
  };

  const handleClickDetail = (index) => {
    setClickDetailIndex(index);
    setClickDetail(!clickDetail);
  }

  return (
    <>
    {isConnected ?
      <div className={`${sellLoading ? 'h-full' : 'h-full sm:h-fit'} w-full flex flex-col justify-center items-center overflow-hidden`}>
        {sellLoading ? (
          <div className="flex-col p-4 max-w-[400px] max-h-[400px]">
            <video className="-mt-16 h-auto w-full max-w-full" autoPlay muted loop>
              <source src="/videos/dswap_loader.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          formattedCreatedPools && formattedCreatedPools.length !== 0 ?
            <>
              <Card className='hidden sm:flex w-full max-h-[573px] overflow-y-auto rounded-xl bg-[rgba(255,255,255,0.05)]'>
                <table className='w-full min-w-max table-auto text-left'>
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head, index) => (
                          <th
                            key={index}
                            className={`${index === 0? 'pl-6' : ''} py-6 px-3`}
                          >
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="text-white font-[Inter] text-sm font-semibold"
                            >
                              {head}
                            </Typography>
                          </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formattedCreatedPools?.map((pool, index) => {
                      let tokenImage = getSvgLogoPath(pool.tokenSymbol);

                      const purchaseResult = formattedPurchaseData?.filter(value => {
                        return value?.poolAddress.toLowerCase() === pool.poolAddress.toLowerCase();
                      });
  
                      const soldValue = purchaseResult.length === 0 ? 0 : purchaseResult[0].buyer.length === 1 && purchaseResult[0].buyer[0].buyer === emptyAddress ? 0 :
                        purchaseResult.map(item => {
                          return item.buyer.filter(value => {
                            const filterResult = value.buyer !== emptyAddress;
                            return filterResult;
                          }).map((val, index) => {
                            return {
                              amount: val.amount,
                              buyer: val.buyer,
                              newPrice: val.newPrice,
                              timestamp: Number(Number(val.timestamp) * 1000), 
                              value: val.value
                            }
                          })
                        });

                      let soldTotalAmount = 0;
                      let receivedAmount = 0;
                      if (soldValue !== 0) {
                        soldValue[0].map(data => {
                          soldTotalAmount = soldTotalAmount + Number(data.amount);
                          receivedAmount = receivedAmount + Number(data.value);
                        })
                      }

                      return (
                        <>
                          <tr key={index} className={`${index % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.05)] w-full'}`}>
                            <td className='pl-6 py-6 px-3'>
                              <div className="flex w-auto gap-2 items-center">
                                {tokenImage ? (
                                  <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={28} width={28} />
                                ) : (
                                  <a className="flex w-auto items-center justify-center text-center text-white">
                                    {pool?.tokenSymbol}
                                  </a>
                                )}
                                <div className="flex-col items-center pl-2 text-start">
                                  <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter] font-semibold'>{pool?.tokenSymbol}</div>
                                  <div className="text-[rgba(100,116,139,1)] text-xs font-[Inter]">{chain?.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className='py-6 px-3'>
                              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                                {Number(
                                    utils.formatUnits(pool?.poolData_6?.toString(), pool?.tokenDecimals)
                                  )}
                              </div>
                                {soldTotalAmount === 0 ? null : (
                                  <div className='pt-1 cursor-pointer hover:scale-105 text-[rgba(100,116,139,1)] text-sm font-[Inter]' onClick={() => onClickView(index)}>{buttonFlag && viewIndex === index ? 'Close' : 'View'}</div>
                                )}
                                {soldTotalAmount !== 0 && buttonFlag === true && viewIndex === index && soldValue[0].map((item, count) => {
                                  return (
                                    <div key={count} className='pt-[16px] text-[rgba(255,255,255,0.8)] text-sm'>
                                      {item.amount / 10 ** 18}
                                    </div>
                                  )
                                })}
                            </td>
                            <td className='py-6 px-3 flex flex-col gap-1'>
                              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                                {Number(
                                  utils.formatUnits(pool?.poolData_5?.toString(), pool?.tokenDecimals)
                                )}
                              </div>
                              {(utils.formatUnits(pool?.poolData_5?.toString(), pool?.tokenDecimals)
                                  ).toString() > 0 ?
                                <div className='flex gap-1'>
                                  <div><Image src={hide} alt='hide' className='cursor-pointer hover:scale-110'/></div>
                                  <div><CancelPools tokenAddress={pool?.tokenAddress} ownedPool={pool?.poolAddress} isChanged={isChanged} setIsChanged={setIsChanged}/></div>
                                  <div><UpdatePoolModal ownedPool={pool?.poolAddress} tokenAddress={pool?.tokenAddress}/></div>
                                </div>
                                :
                                null
                              }
                            </td>
                            <td className='py-6 px-3'>
                              {(pool?.poolValue == 2 || pool?.poolValue == 3) ? <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Public</div> : null}
                              {pool?.poolValue == 1 ? <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Private</div> : null}
                              {pool?.poolValue == 3 ? <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Place in line: {pool?.poolHistory[4]?.toString() == '0' ? 'Next' : pool?.poolHistory[4]?.toString()}</div> : null}

                              <div className='pt-[22px]'>
                                {soldValue !== 0 && buttonFlag === true && viewIndex === index && soldValue[0].map((item, count) => {
                                  return (
                                    <div key={count} className='pt-[4px] flex flex-col gap-[2px]'>
                                      <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>To:</div>
                                      <div className='text-[rgba(100,116,139,1)] text-xs'>{item.buyer.slice(0, 4)}...{item.buyer.slice(item.buyer.length - 4, item.buyer.length)}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                            <td className='py-6 px-3'>
                              {pool.poolData_0?.toString() > '0' ? (
                                <div className='flex flex-col gap-[2px]'>
                                  <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                                    {pool.poolData_0?.toString() > '0' ? pool.poolData_2?.toString() / '10' : '100'}% released
                                  </div>
                                  <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter] whitespace-nowrap'>
                                    + {pool.poolData_1?.toString() / '10'}% / {getVestingSchedule(pool.poolData_0?.toString())}
                                  </div>
                                </div>
                              ) : (
                                <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>-</div>
                              )}
                            </td>
                            <td className='py-6 px-3'>
                              {pool?.poolData_3?.toString() > '0' ? (
                                <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{pool?.poolData_3?.toString() / '10'}%</div>
                              ) : (
                                <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>-</div>
                              )}
                            </td>
                            <td className='py-6 px-3'>
                              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                                {pool?.poolData_4 === '0' ?  countLeadingZerosAfterDecimal(pool?.priceUsd * (100 - pool?.poolData_3 / 10) / 100) :
                                countLeadingZerosAfterDecimal(((utils.formatUnits(pool?.poolData_4?.toString(), pool?.tokenDecimals) * pool?.priceUsd / pool?.priceNative)))} USD
                              </div>
                            </td>
                            <td className='py-6 px-3'>
                              <div>
                                <div className='flex flex-col'>
                                  <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{receivedAmount === 0 ? '0' : countLeadingZerosAfterDecimal(receivedAmount / 10 ** 18)} ETH</div>
                                  <div className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>${receivedAmount === 0 ? '0' : (countLeadingZerosAfterDecimal(receivedAmount / 10 ** 18)  * pool.priceUsd / pool.priceNative)} USD</div>
                                </div>
                                <div className=''>
                                  {receivedAmount !== 0 && buttonFlag === true && viewIndex === index && soldValue[0].map((item, count) => {
                                    return (
                                      <div key={count} className='flex flex-col pt-[14px]'>
                                        <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{countLeadingZerosAfterDecimal(item.value / 10 ** 18)} ETH</div>
                                        <div className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>${countLeadingZerosAfterDecimal(Number(item.value / 10 ** 18) * pool.priceUsd / pool.priceNative)} USD</div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className='pr-6 py-6 px-3 white-nowrap text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                              {moment(Number(pool?.poolCreatedTimestamp)).fromNow()}
                              <div>
                                {soldTotalAmount !== 0 && buttonFlag === true && viewIndex === index && soldValue[0].map((item, count) => {
                                  return (
                                    <div key={count} className='pt-[24px] text-[rgba(100,116,139,1)] text-sm font-[Inter]'>
                                      {moment(Number(item.timestamp)).fromNow()} 
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                          </tr>
                          {soldTotalAmount !== 0 && buttonFlag === true && viewIndex === index && soldValue[0].map((item, count) => {
                            return (
                              <tr key={count} className={`${index % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.03)] w-full'} ${count === 0 ? 'border-none' : 'border-t border-[rgba(255,255,255,0.1)]'}`}>
                                <td className='p-3'></td>
                                <td className='p-3'>
                                  <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{item.amount / 10 ** 18}</div>
                                </td>
                                <td className='p-3'></td>
                                <td className='p-3'>
                                  <div className='flex flex-col gap-[2px]'>
                                    <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>To:</div>
                                    <div className='text-[rgba(100,116,139,1)] text-xs'>{item.buyer.slice(0, 6)}...{item.buyer.slice(item.buyer.length - 4, item.buyer.length)}</div>
                                  </div>
                                </td>
                                <td className='p-3'></td>
                                <td className='p-3'></td>
                                <td className='p-3'>
                                  <div className='flex flex-col'>
                                    <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{countLeadingZerosAfterDecimal(item.value / 10 ** 18)} ETH</div>
                                    <div className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>${countLeadingZerosAfterDecimal(Number(item.value / 10 ** 18) * pool.priceUsd / pool.priceNative)} USD</div>
                                  </div>
                                </td>
                                <td className='p-3'></td>
                                <td className='p-3'>
                                  <div className='text-[rgba(100,116,139,1)] text-sm font-[Inter]'>
                                    {moment(Number(item.timestamp)).fromNow()} 
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
              <div className='sm:hidden w-full h-full gap-3 flex flex-col items-center overflow-y-auto px-2'>
                {formattedCreatedPools?.map((pool, index) => {
                  let tokenImage = getSvgLogoPath(pool.tokenSymbol);

                  const purchaseResult = formattedPurchaseData?.filter(value => {
                    return value?.poolAddress.toLowerCase() === pool.poolAddress.toLowerCase();
                  });

                  const soldValue = purchaseResult.length === 0 ? 0 : purchaseResult[0].buyer.length === 1 && purchaseResult[0].buyer[0].buyer === emptyAddress ? 0 :
                    purchaseResult.map(item => {
                      return item.buyer.filter(value => {
                        const filterResult = value.buyer !== emptyAddress;
                        return filterResult;
                      }).map((val, index) => {
                        return {
                          amount: val.amount,
                          buyer: val.buyer,
                          newPrice: val.newPrice,
                          timestamp: Number(Number(val.timestamp) * 1000), 
                          value: val.value
                        }
                      })
                    });

                  let soldTotalAmount = 0;
                  let receivedAmount = 0;
                  if (soldValue !== 0) {
                    soldValue[0].map(data => {
                      soldTotalAmount = soldTotalAmount + Number(data.amount);
                      receivedAmount = receivedAmount + Number(data.value);
                    })
                  }

                  return (
                    <div key={index} className='flex flex-col sm:hidden w-full h-fit rounded-lg bg-[rgba(255,255,255,0.05)] py-4 px-3 gap-4 border-[0.62px] border-[rgba(255,255,255,0.1)]'>
                      <div className='w-full flex flex-col gap-3'>
                        <div className='w-full flex justify-between'>
                          <div className='flex gap-3 justify-center items-center'>
                            <div className='flex w-auto items-center'>
                              {tokenImage ? (
                                <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={32} width={32} />
                              ) : (
                                <a className="flex w-auto items-center justify-center text-center text-white">
                                  {pool?.tokenSymbol}
                                </a>
                              )}
                            </div>
                            <div className='flex flex-col items-start'>
                              <div className='text-[rgba(255,255,255,0.8)] text-lg font-[Inter] font-semibold'>{pool?.tokenSymbol}</div>
                              <div className="text-[rgba(100,116,139,1)] text-xs font-[Inter]">{chain?.name}</div>
                            </div>
                          </div>
                          <div className='flex flex-col justify-between items-end'>
                            <div className='flex gap-1'>
                              <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Sold:</p>
                              <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                                {Number(
                                  utils.formatUnits(pool?.poolData_6?.toString(), pool?.tokenDecimals)
                                )}
                              </p>
                            </div>
                            <div className='flex gap-1'>
                              <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Sell Price:</p>
                              <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                                {pool?.poolData_4 === '0' ?  countLeadingZerosAfterDecimal(pool?.priceUsd * (100 - pool?.poolData_3 / 10) / 100) :
                                countLeadingZerosAfterDecimal(((utils.formatUnits(pool?.poolData_4?.toString(), pool?.tokenDecimals) * pool?.priceUsd / pool?.priceNative)))} USD
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='w-full flex flex-col gap-2'>
                          <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Amount Received</p>
                          <div className='flex gap-2 justify-start items-center'>
                            <p className='text-[rgba(255,255,255,0.8)] text-xl font-[Abel]'>{receivedAmount === 0 ? '0' : countLeadingZerosAfterDecimal(receivedAmount / 10 ** 18)} ETH</p>
                            <p className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>(${receivedAmount === 0 ? '0' : (countLeadingZerosAfterDecimal(receivedAmount / 10 ** 18)  * pool.priceUsd / pool.priceNative)} USD)</p>
                          </div>
                        </div>
                        <div className='w-full flex flex-col gap-2'>
                          <div className='w-full flex justify-between items-center'>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Discount:</p>
                              {pool?.poolData_3?.toString() > '0' ? (
                                <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{pool?.poolData_3?.toString() / '10'}%</div>
                              ) : (
                                <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>-</div>
                              )}
                            </div>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Pool Type:</p>
                              {(pool?.poolValue == 2 || pool?.poolValue == 3) ? <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>Public</div> : null}
                              {pool?.poolValue == 1 ? <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>Private</div> : null}
                              {pool?.poolValue == 3 ? <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>Place in line: {pool?.poolHistory[4]?.toString() == '0' ? 'Next' : pool?.poolHistory[4]?.toString()}</div> : null}
                            </div>
                            <div className='flex gap-1 items-center'>
                              <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Time:</p>
                              <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                                {moment(Number(pool?.poolCreatedTimestamp)).fromNow()}
                              </p>
                            </div>
                          </div>
                          <div className='w-full flex gap-2 items-center'>
                            <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Vesting:</p>
                            {pool.poolData_0?.toString() > '0' ? (
                              <div className='flex gap-1'>
                                <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                                  {pool.poolData_0?.toString() > '0' ? pool.poolData_2?.toString() / '10' : '100'}% released
                                </div>
                                <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter] whitespace-nowrap'>
                                  + {pool.poolData_1?.toString() / '10'}% / {getVestingSchedule(pool.poolData_0?.toString())}
                                </div>
                              </div>
                            ) : (
                              <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>-</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* {purchasedAmount.length !== 0 && clickDetail === true && clickDetailIndex === index && (
                        <div className='w-full bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 flex flex-col'>
                          {purchasedAmount.map((item, index) => {
                              return (
                                <div key={index} className={`${index === 0 ? 'border-none' : 'border-t border-[rgba(255,255,255,0.1)]'} flex w-full flex-col py-3 gap-2`}>
                                  <div className='w-full flex justify-between'>
                                    <div className='flex gap-2 items-center'>
                                      <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Purchased:</p>
                                      <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{item.amount / 10 ** 18}</p>
                                    </div>
                                  </div>
                                  <div className='flex gap-2 items-center'>
                                    <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Buy Price:</p>
                                    <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{poolInfo?.poolData_4 === '0' ? parseFloat(poolInfo?.priceUsd * (100 - poolInfo?.poolData_3 / 10) / 100).toFixed(4) : parseFloat(((utils.formatUnits(poolInfo?.poolData_4?.toString(), poolInfo?.tokenDecimals) * poolInfo.priceUsd / poolInfo.priceNative)).toFixed(4))} USD</div>
                                  </div>
                                  <div className='flex gap-2 items-center'>
                                    <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Amount Received:</p>
                                    <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{poolInfo?.poolData_4 === '0' ? parseFloat(poolInfo?.priceUsd * (100 - poolInfo?.poolData_3 / 10) / 100).toFixed(4) : parseFloat(((utils.formatUnits(poolInfo?.poolData_4?.toString(), poolInfo?.tokenDecimals) * poolInfo.priceUsd / poolInfo.priceNative)).toFixed(4))} USD</div>
                                  </div>
                                  <div className='flex gap-8'>
                                    <div className='flex gap-2 items-center'>
                                      <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Vested:</p>
                                      <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{CounterValue ? Number(CounterValue[1]) / 10 ** 18 : '-'}</div>
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                      <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Available:</p>
                                      <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{CounterValue ? Number(CounterValue[1]) / 10 ** 18 : '-'}</div>
                                    </div>
                                  </div>
                                </div>
                              )
                          })}
                        </div>
                      )} */}
                      <div className='customShare flex gap-1 py-2 w-full justify-center items-center bg-[rgba(255,255,255,0.05)] rounded-full text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'
                        onClick={() => handleClickDetail(index)}
                      >
                        {index === clickDetailIndex && clickDetail ? 'Collapse details' : 'Share details'}
                        {index === clickDetailIndex && clickDetail ? <ChevronUpIcon className='w-4 h-4' color='rgba(255,255,255,0.8)' /> : <ChevronDownIcon className='w-4 h-4' color='rgba(255,255,255,0.8)'/>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* <div className="flex justify-center p-2 text-center">
                <Pagination
                  className="pagination-bar"
                  currentPage={currentPage}
                  totalCount={formattedCreatedPools && formattedCreatedPools?.length}
                  pageSize={PageSize}
                  onPageChange={page => setCurrentPage(page)}
                />
              </div> */}
            </>
            :
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-2xl sm:text-3xl gap-4 sm:gap-[72px] text-center">
            <Image src={emptySVG} alt="empty" className='w-[200px] h-[200px] sm:w-[320px] sm:h-[320px]'/>
            <p className='font-[Inter] text-lg sm:text-[28px] text-[rgba(100,116,139,0.4)]'>You have not listed any pending tokens yet.</p>
          </div>  
        )}
    </div>
    :
    <div className='text-[rgba(255,255,255,0.8)] font-[Inter] text-sm'>Connect your wallet to view transaction history</div>
    }
    </>
  )
}

export default TxPendingSellContainer 
