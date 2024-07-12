import React from 'react'
import { useState } from 'react'
import { useContractWrite, useWaitForTransaction, usePrepareContractWrite, useNetwork } from 'wagmi'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const style = {
  transferButton:
    'disabled:bg-gray-500/30 disabled:dark:bg-gray-500/30 bg-[#619FFF] enabled:hover:bg-[#1C76FF] enabled:dark:hover:bg-gray-500 enabled:cursor-pointer dark:bg-gray-400 w-full text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center',
}

function TransferPoolOwner(props) {
  const { chain } = useNetwork()

  const { config: transferOwner, error: transferOwnerPrepError } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'updatePoolOwner',
    enabled: props.ownedPool && props.newOwner != '',
    args: [props.tokenAddress, props.ownedPool, props.newOwner],
    onSuccess(transferOwner) {
      console.log('Ready to transfer', transferOwner)
    },
    onError(transferOwner) {
      console.log('Ready to transfer Error', transferOwner)
    },
  })

  const {
    data: transferOwnerData,
    isLoading: transferOwnerLoading,
    isSuccess: transferOwnerStarted,
    error: transferOwnerError,
    write: transferOwnerWrite,
  } = useContractWrite(transferOwner)

  const transferOwnerWaitForTransaction = useWaitForTransaction({
    hash: transferOwnerData?.hash,
    onSuccess(transferOwnerData) {
      console.log('Success', transferOwnerData)
    },
  })

  return (
    <>
      <button 
        onClick={() => transferOwnerWrite?.()}
        className={style.transferButton}
        disabled={transferOwnerLoading || transferOwnerStarted || transferOwnerPrepError || props.newOwner == ''}
        >
        {transferOwnerLoading && <a className="animate-pulse">Waiting for approval</a>}
        {transferOwnerStarted && !transferOwnerWaitForTransaction.isSuccess && <a className="animate-pulse">Transferring Pool...</a>}
        {!transferOwnerLoading && !transferOwnerStarted && <a>Transfer Owner</a>}
        {transferOwnerWaitForTransaction.isSuccess && <a>Transfer Complete</a>}
      </button>
      {transferOwnerPrepError && <div className="p-1 text-center text-red-500">{transferOwnerPrepError.message?.substring(170, 210)}</div>}
    </>
  )
}

export default TransferPoolOwner
