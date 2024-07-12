import React from 'react'
import Image from 'next/image';
import { useContractWrite, useWaitForTransaction, usePrepareContractWrite, useNetwork } from 'wagmi'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'
import cancel from '../../assets/cancel.svg';
import edit from '../../assets/edit.svg';

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const style = {
  cancelButton:
    'text-left disabled:text-500/30 disabled:dark:text-500/30 cursor-pointer hover:scale-110 text-[#B2BCCC] text-[8px]',
}

function CancelPools(props) {
  const { chain } = useNetwork()

  const { config: cancelPool, error: cancelPoolPrepError } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'cancelOwnedPool',
    enabled: props.ownedPool,
    args: [props.ownedPool],
    onSuccess(cancelPool) {
    },
    onError(cancelPool) {
      console.log('Ready to cancel Error', cancelPool)
    },
  })

  const {
    data: cancelPoolData,
    isLoading: cancelPoolLoading,
    isSuccess: cancelPoolStarted,
    error: cancelPoolError,
    write: cancelPoolWrite,
  } = useContractWrite(cancelPool)

  const cancelPoolWaitForTransaction = useWaitForTransaction({
    hash: cancelPoolData?.hash,
    onSuccess(cancelPoolData) {
      console.log('ASDASD = ', props.isChanged)
      props.setIsChanged(!props.isChanged)
      console.log('Success', cancelPoolData)
    },
  })

  return (
    <>
      {!cancelPoolPrepError ?
      <>
        <button 
          onClick={() => cancelPoolWrite?.()}
          className={style.cancelButton}
          disabled={cancelPoolLoading || cancelPoolStarted || cancelPoolPrepError}>
          {cancelPoolLoading && <a className="animate-pulse">Waiting for approval</a>}
          {cancelPoolStarted && !cancelPoolWaitForTransaction.isSuccess && <a className="animate-pulse">Cancelling Pool...</a>}
          {!cancelPoolLoading && !cancelPoolStarted && <Image src={cancel} alt='cancel' />}
          {cancelPoolWaitForTransaction.isSuccess && <a>Cancel Complete</a>}
        </button>
        {cancelPoolPrepError && <div className="p-1 text-center text-red-500">{cancelPoolPrepError.message?.substring(170, 207)}</div>}
      </>
      :
      <div className='text-[#B2BCCC] text-[8px]'>Cancel</div>
      }
    </>
  )
}

export default CancelPools
