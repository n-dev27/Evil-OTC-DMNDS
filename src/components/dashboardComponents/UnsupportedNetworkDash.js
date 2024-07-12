import React from 'react'
import { BoltSlashIcon } from '@heroicons/react/20/solid'
import { useNetwork, useAccount, useSwitchNetwork } from 'wagmi'

const style = {
  content:
    'bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40rounded-3xl p-4 text-center',
  unsupportedNetwork: 'flex p-2 h-8 w-fit text-white items-center bg-red-500 rounded-3xl',
  unsupportedNetworkIcon: 'flex h-9 w-fit p-2',
}

const UnsupportedNetworkDash = () => {
  const { isConnected } = useAccount()
  const { chain, chains } = useNetwork()
  const { isLoading: isNetworkLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  return (
    <div className={style.content}>
      <div className="flex justify-center">
        <div className={style.unsupportedNetwork}>
          <BoltSlashIcon className={style.unsupportedNetworkIcon} />
          Unsupported Chain
        </div>
      </div>
      <dt className="text-large font-bold text-[#566B90] dark:text-white">Switch to a supported Network:</dt>
      <dd className="flex flex-wrap justify-center">
        {isConnected &&
          chains.map(x => (
            <button
              disabled={!switchNetwork || x.id === chain?.id}
              key={x.id}
              onClick={() => switchNetwork?.(x.id)}
              className={
                (x.id === chain?.id ? 'bg-green-500' : 'bg-[#619FFF] hover:scale-105') +
                ' m-1 rounded-lg py-1 px-3 text-white transition-all duration-150'
              }
            >
              {x.name}
              {isNetworkLoading && pendingChainId === x.id && ' (switching)'}
            </button>
          ))}
      </dd>
    </div>
  )
}

export default UnsupportedNetworkDash
