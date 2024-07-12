import { formatEther } from '@ethersproject/units'
import React, { useState } from 'react'
import { useAccount, useContractRead, usePrepareContractWrite, useContractWrite, useWaitForTransaction, useBalance } from 'wagmi'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const DiamondSwapAccountContainer = () => {
  const { address, isConnected } = useAccount()

  const { data: chainData } = useBalance({
    addressOrName: address,
  })

  let chainSymbol = chainData?.symbol

  const [ claimableETH, setClaimableETH ] = useState()

  const [ claimedETH, setClaimedETH ] = useState()

  const { data: ethBalance } = useContractRead({
    addressOrName: diamondswapContract,
    contractInterface: diamondSwapABI,
    enabled: isConnected,
    functionName: 'searchUserCreatedPools',
    overrides: { from: address },
    onSuccess(ethBalance) {
      console.log('Found Claimable ETH', ethBalance)
      setClaimableETH(ethBalance?.claimableETH)
      setClaimedETH(ethBalance?.totalETHEarned)
    },
    onError(error) {
      console.log('Error retrieve pools from contract', error)
    },
  })

  const { config: withdrawETH, error: withdrawETHError } = usePrepareContractWrite({
    addressOrName: diamondswapContract,
    contractInterface: diamondSwapABI,
    enabled: claimableETH?.toString() > '0',
    functionName: 'claimETH',
  })

  const {
    data: withdrawETHData,
    isLoading: withdrawETHLoading,
    isSuccess: withdrawETHSuccess,
    write: withdrawETHWrite,
  } = useContractWrite(withdrawETH)

  const withdrawETHWaitForTransaction = useWaitForTransaction({
    hash: withdrawETHData?.hash,
    onSuccess(withdrawETHData) {
      console.log('Success', withdrawETHData)
    },
  })

  return (
    <div className="customShare customBorder md:text-large justify-center rounded-2xl border p-4 px-8 text-center text-sm text-[rgba(255,255,255,0.8)] bg-[rgba(40,24,85,0.6)]">
      <dl>
        <div>
          <h1 className="text-xl text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Diamond Swap Balances</h1>
          <div className="text-[rgba(255,255,255,0.8)] font-[Inter_Regular]">Total {chainSymbol} earned: {claimedETH ? Number(formatEther(claimedETH)).toFixed(6) : '0.0'}</div>
          <div className="text-[rgba(255,255,255,0.8)] font-[Inter_Regular]">Claimable {chainSymbol}</div>
          <div className="mt-2 flex justify-between rounded-xl p-2 px-3 bg-gray-500 text-[rgba(255,255,255,0.8)] font-[Inter_Regular]">
            <div>{claimableETH ? formatEther(claimableETH) : '0.0'}</div>
            <div>{chainSymbol}</div>
          </div>
          <div className="p-1">
            <button
              disabled={claimableETH?.toString() <= '0'}
              className="bg-[rgba(95,219,197,1)] hover:bg-[rgba(95,219,197,1)] mt-3 rounded-xl p-2 text-center enabled:hover:scale-105 disabled:opacity-60"
              onClick={() => withdrawETHWrite?.()}
            >
              {withdrawETHLoading || withdrawETHWaitForTransaction.isLoading ? (
                <a className='animate-pulse text-[rgba(0,0,0,0.8)] font-[Inter_Regular]'>Withdrawing...</a>
              ) : (
                <a className='text-[rgba(0,0,0,0.8)] font-[Inter_Regular]'>Withdraw {chainSymbol}</a>
              )}
            </button>
          </div>
        </div>
      </dl>
    </div>
  )
}

export default DiamondSwapAccountContainer
