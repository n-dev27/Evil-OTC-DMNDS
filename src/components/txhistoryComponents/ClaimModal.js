import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { utils } from 'ethers'
import moment from 'moment-timezone'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from 'wagmi'
import { getVestingSchedule } from '../../utils/getVestingSchedule'
import { countLeadingZerosAfterDecimal } from '../../utils/countDecimals';
import diamondSwapABI from '../../constants/contracts/diamondABI.json'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT;

function ClaimModal({ item, viewIndex, setViewIndex, buttonFlag, setButtonFlag, clickDetail, setClickDetail, clickDetailIndex, setClickDetailIndex, isSubFlag, isMobile, index, successFlag, setSuccessFlag, pool, tokenImage, claimableHistory, poolInfo, purchasedAmount, totalPurchasedAmount }) {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const onClickView = (index) => {
    setViewIndex(index)
    setButtonFlag(!buttonFlag)
  }

  const {
    data: CounterValue,
    isError: error,
    } = useContractRead({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: "checkVestedPoolAmount",
    enabled: true,
    account: address,
    args: [pool.poolAddress, pool.tokenAddress],
    onSuccess(CounterValue) {
      console.log(`CliamRead ${index} === `, CounterValue)
    },
    onError(error) {
      console.log('Error retrieve values from contract', error)
    }
})

  const {
    config: claimToken,
    error: prepareError, 
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'claimVestedTokens',
    enabled: address,
    args: [pool.poolAddress, pool.tokenAddress],
    chain: chain?.id,
    onSuccess(claimToken) {
        console.log('Prepare success === ', claimToken)
    },
    onError(claimToken) {
      console.log('Prepare error === ', claimToken)
    },
  })

  const { 
    data: claimTokenData, 
    isLoading: claimTokenLoading, 
    isSuccess: claimTokenSuccess,
    error: claimTokenError, 
    write: claimTokenWrite } = useContractWrite(claimToken)

  const { isLoading, isSuccess: isTransactionSuccess } = useWaitForTransaction({
    hash: claimTokenData?.hash,
    onSuccess(claimTokenData) {
      setSuccessFlag(false);
      console.log('Transaction successful:', claimTokenData);
    },
    onError(claimTokenData) {
      setSuccessFlag(false);
      console.log('Transaction failed:', claimTokenData);
    },
  });

  useEffect(() => {
    if (claimTokenLoading) {
      setSuccessFlag(true);
    } else if (claimTokenSuccess) {
      setSuccessFlag(false);
    }
  }, [claimTokenLoading, claimTokenSuccess]);

  const handleClickDetail = (index) => {
    setClickDetailIndex(index);
    setClickDetail(!clickDetail);
  }

  return (
    !isMobile ? 
    !isSubFlag ? 
      <>
        <td className='pl-6 py-6 px-3'>
          <div className="flex w-auto gap-2 items-center">
            {tokenImage ? (
              <Image src={tokenImage} alt={`${pool?.tokenSymbol}`} height={28} width={28} />
            ) : (
              <a className="flex w-auto items-center justify-center text-center text-white">
                {pool?.tokenSymbol}
              </a>
            )}
            <div className="flex-col items-center text-start">
              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter] font-semibold'>{pool?.tokenSymbol}</div>
              <div className="text-[rgba(100,116,139,1)] text-xs font-[Inter]">{chain?.name}</div>
            </div>
          </div>
        </td>
        <td className='py-6 px-3'>
          <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
            {totalPurchasedAmount / (10 ** 18)}
          </div>
          {purchasedAmount.length === 0 ? null : (
            <div className='cursor-pointer hover:scale-105 text-[rgba(100,116,139,1)] text-xs font-[Inter]' onClick={() => onClickView(index)}>{buttonFlag && viewIndex === index ? 'Close' : 'View'}</div>
          )}
        </td>
        <td className='py-6 px-3 flex flex-col gap-1 text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {CounterValue ? Number(CounterValue[1]) / 10 ** 18 : '-'}
        </td>
        <td className='py-6 px-3 text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {pool.userClaimedToken / 10 ** 18}
        </td>
        <td className='py-6 px-3'>
          {poolInfo?.poolData_0?.toString() > '0' ? (
            <div className='flex flex-col gap-1'>
              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
                {poolInfo?.poolData_0?.toString() > '0' ? poolInfo?.poolData_2?.toString() / '10' : '100'}% released
              </div>
              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter] whitespace-nowrap'>
                + {poolInfo?.poolData_1?.toString() / '10'}% / {getVestingSchedule(poolInfo?.poolData_0?.toString())}
              </div>
            </div>
          ) : (
            <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>-</div>
          )}
        </td>
        <td className='py-6 px-3'>
          {poolInfo?.poolData_3?.toString() > '0' ? (
            <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{poolInfo?.poolData_3?.toString() / '10'}%</div>
          ) : (
            <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>-</div>
          )}
        </td>
        <td className='py-6 px-3'>
          <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
            {poolInfo?.poolData_4 === '0' ? countLeadingZerosAfterDecimal(poolInfo?.priceUsd * (100 - poolInfo?.poolData_3 / 10) / 100) : 
              countLeadingZerosAfterDecimal(((utils.formatUnits(poolInfo?.poolData_4?.toString(), poolInfo?.tokenDecimals) * poolInfo.priceUsd / poolInfo.priceNative)))} USD
          </div>
        </td>
        <td className='py-6 px-3 text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {poolInfo?.poolData_0?.toString() > '0' && CounterValue ? (
            <div className='flex flex-col'>
              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{Number(CounterValue[0]) / 10 ** 18}</div>
              <button className="pt-1 cursor-pointer hover:scale-105 text-[rgba(100,116,139,1)] text-xs text-left disabled:text-[#7B8EAD] disabled:scale-100"
                disabled={Number(CounterValue[0]) / 10 ** 18 !== 0 ? false : true}
                onClick={() => claimTokenWrite?.()}
              >
                {claimTokenSuccess ? 'Claim Success' : 'Claim Now'}
              </button>
          </div>
          ) : '0'}
          {claimableHistory.length !== 0 && buttonFlag && viewIndex === index && claimableHistory.map((item, count) => {
            return (
              <div className='flex flex-col gap-1 pt-4' key={count}>
                <div className='text-[#7B8EAD] font-[Inter] text-xs whitespace-nowrap'>
                  Claim History:
                </div>
                <div className='text-[#B2BCCC] text-xs'>
                  {item.amountClaimed / 10 ** 18}
                </div>
              </div>
              )
            })
          }
        </td>
        <td className='pr-6 py-6 px-3 whitespace-nowrap text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {new Date() - new Date(Number(pool.poolCreatedTimestamp)) > 0 ? moment(Number(pool.poolCreatedTimestamp)).fromNow()
          : '0 seconds ago'}
            {claimableHistory.length !== 0 && buttonFlag && viewIndex === index && claimableHistory.map((item, index) => {
              return (
                <div key={index} className='pt-[27px] italic text-[#7B8EAD] text-[10px]'>
                  {new Date() - new Date(Number(item?.timestamp * 1000)) > 0 ? moment(Number(item.timestamp * 1000)).fromNow() : '0 seconds ago'}
                </div>
              )
            })}
        </td>
      </>
      : 
      <>
        <td className='p-3'></td>
        <td className='p-3'>
          <div className='text-[rgba(100,116,139,1)] text-smfont-[Inter]'>
            {item.amount / 10 ** 18}
          </div>
        </td>
        <td className='p-3 flex flex-col gap-1 text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {CounterValue ? Number(CounterValue[1]) / 10 ** 18 : '-'}
        </td>
        <td className='p-3 text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {pool.userClaimedToken / 10 ** 18}
        </td>
        <td className='p-3'></td>
        <td className='p-3'></td>
        <td className='p-3'></td>
        <td className='p-3 text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {poolInfo?.poolData_0?.toString() > '0' && CounterValue ? (
            <div className='flex flex-col'>
              <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{Number(CounterValue[0]) / 10 ** 18}</div>
              <button className="pt-1 cursor-pointer hover:scale-105 text-[rgba(100,116,139,1)] text-xs text-left disabled:text-[#7B8EAD] disabled:scale-100"
                disabled={Number(CounterValue[0]) / 10 ** 18 !== 0 ? false : true}
                onClick={() => claimTokenWrite?.()}
              >
                {claimTokenSuccess ? 'Claim Success' : 'Claim Now'}
              </button>
          </div>
          ) : '0'}
          {claimableHistory.length !== 0 && buttonFlag && viewIndex === index && claimableHistory.map((item, count) => {
            return (
              <div className='flex flex-col gap-1 pt-4' key={count}>
                <div className='text-[#7B8EAD] font-[Inter] text-xs whitespace-nowrap'>
                  Claim History:
                </div>
                <div className='text-[#B2BCCC] text-xs'>
                  {item.amountClaimed / 10 ** 18}
                </div>
              </div>
              )
            })
          }
        </td>
        <td className='p-3 whitespace-nowrap text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>
          {claimableHistory.length !== 0 && buttonFlag && viewIndex === index && claimableHistory.map((item, index) => {
            return (
              <div key={index} className='pt-[27px] italic text-[#7B8EAD] text-[10px]'>
                {new Date() - new Date(Number(item?.timestamp * 1000)) > 0 ? moment(Number(item.timestamp * 1000)).fromNow() : '0 seconds ago'}
              </div>
            )
          })}
        </td>
      </>
    : (
      <div className='flex flex-col sm:hidden w-full h-fit rounded-lg bg-[rgba(255,255,255,0.05)] py-4 px-3 gap-4 border-[0.62px] border-[rgba(255,255,255,0.1)]'>
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
                <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Purchased:</p>
                <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                  {totalPurchasedAmount / (10 ** 18)}
                </p>
              </div>
              <div className='flex gap-1'>
                <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Buy Price:</p>
                <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                  {poolInfo?.poolData_4 === '0' ? countLeadingZerosAfterDecimal(poolInfo?.priceUsd * (100 - poolInfo?.poolData_3 / 10) / 100) : 
                  countLeadingZerosAfterDecimal(((utils.formatUnits(poolInfo?.poolData_4?.toString(), poolInfo?.tokenDecimals) * poolInfo.priceUsd / poolInfo.priceNative)))} USD
                </p>
              </div>
            </div>
          </div>
          <div className='w-full flex flex-col gap-2'>
            <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter] text-left'>Amount Received</p>
            <div className='flex gap-2 justify-start items-center'>
              <p className='text-[rgba(255,255,255,0.8)] text-xl font-[Abel]'>{pool.userClaimedToken / 10 ** 18}</p>
              <p className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>Tokens</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-2'>
            <div className='w-full flex justify-between items-center'>
              <div className='flex gap-1 items-center'>
                <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Discount:</p>
                  {poolInfo?.poolData_3?.toString() > '0' ? (
                    <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>{poolInfo?.poolData_3?.toString() / '10'}%</div>
                  ) : (
                    <div className='text-[rgba(255,255,255,0.8)] text-sm font-[Inter]'>-</div>
                  )}
              </div>
              <div className='flex gap-1 items-center'>
                <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Available:</p>
                  {poolInfo?.poolData_0?.toString() > '0' && CounterValue ? (
                    <div className='flex flex-col'>
                      <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{Number(CounterValue[0]) / 10 ** 18}</div>
                      <button className="pt-1 cursor-pointer hover:scale-105 text-[rgba(100,116,139,1)] text-xs text-left disabled:text-[#7B8EAD] disabled:scale-100"
                        disabled={Number(CounterValue[0]) / 10 ** 18 !== 0 ? false : true}
                        onClick={() => claimTokenWrite?.()}
                      >
                        {claimTokenSuccess ? 'Claim Success' : 'Claim Now'}
                      </button>
                  </div>
                  ) : <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>0</p>}
              </div>
              <div className='flex gap-1 items-center'>
                <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Time:</p>
                <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                  {new Date() - new Date(Number(pool.poolCreatedTimestamp)) > 0 ? moment(Number(pool.poolCreatedTimestamp)).fromNow()
                  : <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>0 seconds ago</p>}
                </p>
              </div>
            </div>
            <div className='w-full flex gap-8'>
              <div className='flex gap-2 items-center'>
                <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Vested:</p>
                {CounterValue ? Number(CounterValue[1]) / 10 ** 18 : <p className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>-</p>}
              </div>
              <div className='flex gap-2 items-center'>
                <p className='text-[rgba(100,116,139.1)] text-xs font-[Inter]'>Vesting:</p>
                {poolInfo?.poolData_0?.toString() > '0' ? (
                  <div className='flex gap-1'>
                    <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>
                      {poolInfo?.poolData_0?.toString() > '0' ? poolInfo?.poolData_2?.toString() / '10' : '100'}% released
                    </div>
                    <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter] whitespace-nowrap'>
                      + {poolInfo?.poolData_1?.toString() / '10'}% / {getVestingSchedule(poolInfo?.poolData_0?.toString())}
                    </div>
                  </div>
                ) : (
                  <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>-</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {purchasedAmount.length !== 0 && clickDetail === true && clickDetailIndex === index && (
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
                      <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{poolInfo?.poolData_4 === '0' ? countLeadingZerosAfterDecimal(poolInfo?.priceUsd * (100 - poolInfo?.poolData_3 / 10) / 100) : countLeadingZerosAfterDecimal(((utils.formatUnits(poolInfo?.poolData_4?.toString(), poolInfo?.tokenDecimals) * poolInfo.priceUsd / poolInfo.priceNative)))} USD</div>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <p className='text-[rgba(100,116,139,1)] text-xs font-[Inter]'>Amount Received:</p>
                      <div className='text-[rgba(255,255,255,0.6)] text-xs font-[Inter]'>{poolInfo?.poolData_4 === '0' ? countLeadingZerosAfterDecimal(poolInfo?.priceUsd * (100 - poolInfo?.poolData_3 / 10) / 100) : countLeadingZerosAfterDecimal(((utils.formatUnits(poolInfo?.poolData_4?.toString(), poolInfo?.tokenDecimals) * poolInfo.priceUsd / poolInfo.priceNative)))} USD</div>
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
        )}
        <div className='customShare customBorder flex gap-1 py-2 w-full justify-center items-center bg-[rgba(255,255,255,0.05)] rounded-full text-[rgba(255,255,255,0.8)] text-xs font-[Inter]'
          onClick={() => handleClickDetail(index)}
        >
          {index === clickDetailIndex && clickDetail ? 'Collapse details' : 'Share details'}
          {index === clickDetailIndex && clickDetail ? <ChevronUpIcon className='w-4 h-4' color='rgba(255,255,255,0.8)' /> : <ChevronDownIcon className='w-4 h-4' color='rgba(255,255,255,0.8)'/>}
        </div>
      </div>
    )
  )
}

export default ClaimModal
