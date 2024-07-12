/* eslint-disable no-undef */
import React, { useContext } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Card, Typography } from "@material-tailwind/react";
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { useQuery } from "@apollo/client";
import { GET_POOL_INFO } from '../../constants/graphql/query';
import ClaimModal from './ClaimModal';
import Pagination from '../../utils/Pagination';
import emptySVG from '../../assets/empty_box.svg';
import { getSvgLogoPath } from '../../assets/symbol/svgIcons';
import { LayoutContext } from '../layout/layout';
import { getTokenPair } from '../../services/tokenInfoServices';

function TxPendingBuyContainer (props) {
  const { address, isConnected } = useAccount();

  const { data: chainData } = useBalance({
    address: address,
  });

  let chainSymbol = chainData?.symbol;
  const { loading, error, data, refetch } = useQuery(GET_POOL_INFO);
  const { routerPath } = useContext(LayoutContext);
  const [successFlag, setSuccessFlag] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [formattedCreatedPoolsData, setFormattedCreatedPoolsData] = useState();
  const [formattedPurchaseData, setFormattedPurchaseData] = useState();
  const [viewIndex, setViewIndex] = useState(null);
  const [buttonFlag, setButtonFlag] = useState(false);
  const [clickDetail, setClickDetail] = useState(false);
  const [clickDetailIndex, setClickDetailIndex] = useState(null);

  const emptyAddress = '0x0000000000000000000000000000000000000000';

  let PageSize = 10;
  const TABLE_HEAD = ["Token", "Purchased", "Vested", "Amount Received", "Vesting", "Discount", "Buy Price/ Token", "Available", "Time"];

  const [currentPage, setCurrentPage] = useState(1);

  const formattedCreatedPools = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize
    const lastPageIndex = firstPageIndex + PageSize
    return formattedCreatedPoolsData?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, formattedCreatedPoolsData]);

  useEffect(() => {
    setBuyLoading(true);
    const fetchMarketPrices = async () => {
      if(data && data.pools && address) {
        const poolData = await Promise.all(data.pools
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
              claimableHistory: pool?.claimVestedTokenInfo,
              vestingComplete: pool?.vestingComplete,
              tokenName: pool?.tokenSelling?.tokenName,
              tokenSymbol: pool?.tokenSelling?.tokenSymbol,
              tokenAddress: pool?.tokenSelling?.tokenAddress, 
              tokenDecimals: pool?.tokenSelling?.decimals,
              listingType: pool?.fixedPrice,
            };
          }
        ));
        setFormattedCreatedPoolsData(poolData);

      const purchaseData = data?.purchaseDatas && data.purchaseDatas.map(pool => {
          return {
            poolAddress: pool?.poolAddress,
            publicSaleAmount: pool?.publicSaleAmount,
            poolType: pool?.poolType,
            priceType: pool?.priceType,
            userClaimedToken: pool?.userClaimedTokens,
            userVestedToken: pool?.userVestedTokens,
            tokenName: pool?.tokenBuying?.tokenName,
            tokenSymbol: pool?.tokenBuying?.tokenSymbol,
            tokenAddress: pool?.tokenBuying?.tokenAddress, 
            tokenDecimals: pool?.tokenBuying?.decimals,
            vestingSet: pool?.vesting?.vestingSet,
            vestingAmountReleased: pool?.vesting?.vestingAmountReleased,
            vestingAmountPending: pool?.vesting?.vestingAmountPending,
            vestingAmountPerPeriod: pool?.vesting?.vestingAmountPerPeriod,
            vestingPeriod: pool?.vesting?.vestingPeriod,
            poolCreatedTimestamp: Number(Number(pool?.detail?.blockTimestamp) * 1000),
            buyArray: pool.buyers
          }
      })

      const newPurchaseData_1 = purchaseData?.filter(item => {
        return item.buyArray.some(value => {
          return address && value.buyer.toLowerCase() === address.toLowerCase();
        })
      })

      const newPurchaseData_2 = newPurchaseData_1?.filter(pool => {
        const poolInfo = poolData.find(obj => obj.poolAddress === pool.poolAddress);
        if (poolInfo === undefined) {
          return false;
        }
        const claimableHistory = poolInfo?.claimableHistory?.filter(item => item.sender.toLowerCase() === address.toLowerCase());
        let totalReceivedAmount = poolInfo.poolData_0 === '0' ? Number(pool.buyArray[0].amount) : Number(pool.userClaimedToken);
        claimableHistory.map(item => {
          totalReceivedAmount = totalReceivedAmount + Number(item.amountClaimed);
        })
        let totalPurchasedAmount = 0;
        const purchasedAmount = pool.buyArray.filter(item => {
          return item.buyer.toLowerCase() === address.toLowerCase() && item.buyer !== emptyAddress;
        });
        purchasedAmount.map(item => {
          totalPurchasedAmount = totalPurchasedAmount + Number(item.amount);
        })

        if (totalPurchasedAmount !== totalReceivedAmount) {
          return true;
        } else return false;
      });

      newPurchaseData_2 && newPurchaseData_2.sort((a, b) => (a.poolCreatedTimestamp < b.poolCreatedTimestamp) ? 1 : (a.poolCreatedTimestamp > b.poolCreatedTimestamp) ? -1 : 0)
      setFormattedPurchaseData(newPurchaseData_2);
      setBuyLoading(false);
    }
    };

    fetchMarketPrices();
  }, [data, address]);

  useEffect(() => {
    refetch();
  }, [routerPath]);

  useEffect(() => {
    if (successFlag === false) {
      refetch();
    }
  }, [successFlag]);

  return (
    <>
    {isConnected ?
      <div className={`${buyLoading || successFlag ? 'h-full' : 'h-full sm:h-fit'} w-full flex flex-col justify-center items-center text-center overflow-hidden`}>
      {buyLoading || successFlag ? (
        <div className="flex-col p-4 max-w-[400px] max-h-[400px]">
          <video className="-mt-16 h-auto w-full max-w-full" autoPlay muted loop>
            <source src="/videos/dswap_loader.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        formattedPurchaseData && formattedPurchaseData.length !== 0 ?
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
                  {formattedPurchaseData?.map((pool, index) => {
                    let tokenImage = getSvgLogoPath(pool.tokenSymbol);
                    const poolInfo = formattedCreatedPoolsData.find(item => item.poolAddress.toLowerCase() === pool.poolAddress.toLowerCase());
                    const claimableHistory = poolInfo?.claimableHistory?.filter(item => item.sender.toLowerCase() === address.toLowerCase());
                    let totalPurchasedAmount = 0;
                    const purchasedAmount = pool.buyArray.filter(item => {
                      return item.buyer.toLowerCase() === address.toLowerCase() && item.buyer !== emptyAddress;
                    });
                    purchasedAmount.map(item => {
                      totalPurchasedAmount = totalPurchasedAmount + Number(item.amount);
                    })

                    return (
                      <>
                        <tr key={index} className={`${index % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.05)] w-full'}`}>
                          <ClaimModal 
                            item={''} 
                            viewIndex={viewIndex} 
                            setViewIndex={setViewIndex} 
                            buttonFlag={buttonFlag} 
                            setButtonFlag={setButtonFlag} 
                            clickDetail={clickDetail} 
                            setClickDetail={setClickDetail} 
                            clickDetailIndex={clickDetailIndex} 
                            setClickDetailIndex={setClickDetailIndex} 
                            index={index} 
                            isSubFlag={false} 
                            isMobile={false} 
                            successFlag={successFlag} 
                            setSuccessFlag={setSuccessFlag} 
                            pool={pool} 
                            tokenImage={tokenImage} 
                            claimableHistory={claimableHistory} 
                            poolInfo={poolInfo} 
                            purchasedAmount={purchasedAmount} 
                            totalPurchasedAmount={totalPurchasedAmount}/>
                        </tr>
                        {purchasedAmount !== 0 && buttonFlag === true && viewIndex === index && purchasedAmount.map((item, count) => {
                          return (
                            <tr key={count} className={`${index % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.03)] w-full'} ${count === 0 ? 'border-none' : 'border-t border-[rgba(255,255,255,0.1)]'}`}>
                              <ClaimModal 
                                item={item} 
                                viewIndex={viewIndex} 
                                setViewIndex={setViewIndex} 
                                buttonFlag={buttonFlag} 
                                setButtonFlag={setButtonFlag} 
                                clickDetail={clickDetail} 
                                setClickDetail={setClickDetail} 
                                clickDetailIndex={clickDetailIndex} 
                                setClickDetailIndex={setClickDetailIndex} 
                                index={index} 
                                isSubFlag={true} 
                                isMobile={false} 
                                successFlag={successFlag} 
                                setSuccessFlag={setSuccessFlag} 
                                pool={pool} 
                                tokenImage={tokenImage} 
                                claimableHistory={claimableHistory} 
                                poolInfo={poolInfo} 
                                purchasedAmount={purchasedAmount} 
                                totalPurchasedAmount={totalPurchasedAmount}/>
                            </tr>
                          )
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </Card>

            <div className='flex sm:hidden w-full h-full gap-3 flex-col items-center overflow-y-auto px-2'>
              {formattedPurchaseData?.map((pool, index) => {
                let tokenImage = getSvgLogoPath(pool.tokenSymbol);
                const poolInfo = formattedCreatedPoolsData.find(item => item.poolAddress.toLowerCase() === pool.poolAddress.toLowerCase());
                const claimableHistory = poolInfo?.claimableHistory?.filter(item => item.sender.toLowerCase() === address.toLowerCase());
                let totalPurchasedAmount = 0;
                const purchasedAmount = pool.buyArray.filter(item => {
                  return item.buyer.toLowerCase() === address.toLowerCase() && item.buyer !== emptyAddress;
                });
                purchasedAmount.map(item => {
                  totalPurchasedAmount = totalPurchasedAmount + Number(item.amount);
                })

                return (
                  <ClaimModal 
                    item={''} 
                    viewIndex={viewIndex} 
                    setViewIndex={setViewIndex} 
                    buttonFlag={buttonFlag} 
                    setButtonFlag={setButtonFlag} 
                    clickDetail={clickDetail} 
                    setClickDetail={setClickDetail} 
                    clickDetailIndex={clickDetailIndex} 
                    setClickDetailIndex={setClickDetailIndex} 
                    index={index} 
                    isSubFlag={false} 
                    isMobile={true} 
                    successFlag={successFlag} 
                    setSuccessFlag={setSuccessFlag} 
                    pool={pool} 
                    tokenImage={tokenImage} 
                    claimableHistory={claimableHistory} 
                    poolInfo={poolInfo} 
                    purchasedAmount={purchasedAmount} 
                    totalPurchasedAmount={totalPurchasedAmount}/>
                );
              })}
            </div>
            {/* <div className="flex justify-center p-2 text-center">
              <Pagination
                className="pagination-bar"
                currentPage={currentPage}
                totalCount={formattedPurchaseData && formattedPurchaseData?.length}
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

export default TxPendingBuyContainer 
