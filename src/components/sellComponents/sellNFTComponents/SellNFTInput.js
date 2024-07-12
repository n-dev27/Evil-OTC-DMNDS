import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import NFTModal from '../../sellAssetsComponents/nfts/NFTModal'

const style = {
  sellNFTInput: 'flex w-full bg-white dark:bg-gray-500/70 rounded-2xl p-2 md:px-3 pb-2 md:pb-3',
  sellNFTInputText: 'w-full p-1 md:px-1 text-xs text-[#B9BCC7]',
  sellNFTInputSelector: 'flex px-1 justify-start rounded-xl',
  sellNFTInputSelected: 'flex px-1 justify-center rounded-xl',
}

const SellNFTInput = props => {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [nftTokenData, setInputNftData] = useState()

  useEffect(() => {
    props.setInputNftData(nftTokenData)
    props.setOutputTokenAmount()
  }, [nftTokenData])

  return (
    <div className={style.sellNFTInput}>
      <div className="flex-col">
        <div className={style.sellNFTInputText}>You&apos;ll sell</div>
        <div className="flex items-center">
          <button
            type="button"
            className={nftTokenData != undefined ? style.sellNFTInputSelected : style.sellNFTInputSelector}
          >
            <NFTModal SetNftData={setInputNftData} outputTokenData={props.outputTokenData} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SellNFTInput
