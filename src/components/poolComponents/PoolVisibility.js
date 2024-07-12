import React from 'react'
import { useState } from 'react'
import { useContractWrite, useWaitForTransaction, usePrepareContractWrite, useNetwork } from 'wagmi'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const style = {
  updateButton:
    'disabled:bg-gray-500/30 disabled:dark:bg-gray-500/30 bg-[#619FFF] enabled:hover:bg-[#1C76FF] enabled:dark:hover:bg-gray-500 enabled:cursor-pointer dark:bg-gray-400 w-full text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center',
}

function PoolVisibility(props) {
  const { chain } = useNetwork()

  const { config: updatePoolVisibility, error: updatePoolVisibilityPrepError } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'updatePoolVisibility',
    enabled: props.ownedPool,
    args: [props.tokenAddress, props.ownedPool, (props.visibility ? false : true)],
    onSuccess(updatePoolVisibility) {
      console.log('Ready to hide/unhide', updatePoolVisibility)
    },
    onError(updatePoolVisibility) {
      console.log('Ready to hide/unhide Error', updatePoolVisibility)
    },
  })

  const {
    data: updatePoolVisibilityData,
    isLoading: updatePoolVisibilityLoading,
    isSuccess: updatePoolVisibilityStarted,
    error: updatePoolVisibilityError,
    write: updatePoolVisibilityWrite,
  } = useContractWrite(updatePoolVisibility)

  const updatePoolVisibilityWaitForTransaction = useWaitForTransaction({
    hash: updatePoolVisibilityData?.hash,
    onSuccess(updatePoolVisibilityData) {
      console.log('Success', updatePoolVisibilityData)
    },
  })

  return (
    <>
      <button 
        onClick={() => updatePoolVisibilityWrite?.()} 
        className={style.updateButton}
        disabled={updatePoolVisibilityLoading || updatePoolVisibilityStarted || updatePoolVisibilityPrepError}>
        {updatePoolVisibilityLoading && <a className="animate-pulse">Waiting for approval</a>}
        {updatePoolVisibilityStarted && !updatePoolVisibilityWaitForTransaction.isSuccess && <a className="animate-pulse">Updating Pool...</a>}
        {!updatePoolVisibilityLoading && !updatePoolVisibilityStarted && <a>Update Visibility</a>}
        {updatePoolVisibilityWaitForTransaction.isSuccess && <a>Update Complete</a>}
      </button>
    </>
  )
}

export default PoolVisibility
