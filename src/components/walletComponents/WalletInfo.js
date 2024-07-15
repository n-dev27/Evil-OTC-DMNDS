import React, { Fragment } from 'react'
import Image from 'next/image'
import { Popover, Transition } from '@headlessui/react'
import { BoltSlashIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useAccount, useDisconnect, useBalance, useNetwork, useSwitchNetwork } from 'wagmi'
import searchIcon from '../../assets/search_icon.svg'

const style = {
  walletContainer: `flex w-fit items-center justify-start sm:gap-2`,
  networkInfo: `group inline-flex items-center text-white w-fit sm:min-w-[76px] h-full sm:h-10 pt-3 sm:pt-0 focus:outline-none`,
  chainSelector: `customBorder min-w-[220px] left-[5%] grid absolute bg-[rgba(22,41,48,0.8)] p-2 mt-5 overflow-hidden rounded-lg shadow-lg ring-2 ring-black ring-opacity-5`,
  chainItem: `px-2 py-1 justify-center items-center drop-shadow-md text-[#B6C2D7] hover:bg-[#dbd7d7] hover:text-[#566B90] text-[1.0rem] cursor-pointer rounded-3xl`,
  icon: `hidden sm:flex w-full gap-2 justify-center items-center bg-[rgba(255,255,255,0.1)] h-8 px-2 sm:h-11 text-md rounded-[12px] border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]`,
  IconContainer: `flex items-center justify-center`,
  unsupportedChain: `hidden xl:flex w-full h-full gap-2 justify-center items-center text-md text-white bg-red-500 rounded-[12px] px-2`,
  unsupportedNetwork: 'flex w-full',
  unsupportedNetworkIcon: `flex h-4 w-4`,
  walletInfo: `bg-[rgba(255,255,255,0.05)] sm:bg-[rgba(255,255,255,0.1)] px-2 py-3 sm:px-3 sm:py-4 h-8 sm:h-11 min-w-[117px] sm:min-w-[174px] flex gap-3 items-center text-center rounded-[100px] sm:rounded-[12px] border sm:border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]`,
  walletAddress:
    'h-full flex w-full items-center justify-center gap-2 text-[rgba(255,255,255,0.8)] text-[12px] sm:text-lg font-[Inter] cursor-pointer',
  walletBalance:
    'hidden h-full justify-center items-center w-1/2 xl:flex text-white text-xs rounded-[12px] bg-[#2C354A]',
  walletBalancePadding: `px-3`,
  walletDisconnect: 'cursor-pointer',
  walletDisconnectIcon: 'flex bg-[#E97419] rounded-full items-center justify-center w-4 h-4',
}

const WalletInfo = () => {
  const { address, isConnected, connector } = useAccount()
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const getChainLogo = id => {
    if (id === 1 || id === 3 || id === 42 || id === 11155111) return '/images/ethLogo.png'
    if (id === 42161) return '/images/arbitrumLogo.png'
    if (id === 5) return '/images/goerliLogo.svg'
    if (id === 56 || id === 97) return '/images/bscLogo.png'
    if (id === 137 || id === 80001) return '/images/maticLogo.png'
    if (id === 5551 || id === 5553) return '/images/nahmiiLogo.png'
    if (id === 18159) return '/images/pomLogo.png'
  }

  const disconnectWallet = async () => {
    disconnect()
  }

  return (
    <div>
      <div className={style.walletContainer}>
        <Popover className="relative">
          <Popover.Button className={style.networkInfo}>
            <div className={chain?.unsupported ? style.unsupportedChain : style.icon}>
              <div className={style.IconContainer}>
                {chain?.unsupported ? (
                  <div className={style.unsupportedNetwork}>
                    <BoltSlashIcon className={style.unsupportedNetworkIcon} />
                  </div>
                ) : (
                  <Image src={getChainLogo(chain?.id)} alt="chain logo" height={20} width={20}></Image>
                )}
              </div>
              <div className="hidden xxxl:flex text-[12px]">{chain?.unsupported ? 'Unsupported Chain' : ``}</div>
              <ChevronDownIcon className='w-5 h-5 text-white'/>
            </div>
            <div className='flex sm:hidden'>
              <Image src={searchIcon} alt='searchIcon' ></Image>
            </div>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute -mt-2 w-[11rem] -translate-x-1/2 transform px-0 left-8 sm:left-20">
              <div className={style.chainSelector}>
                <h2 className="text-[rgba(255,255,255,0.6)] font-[Inter] mx-1">Switch Networks</h2>
                {isConnected &&
                  chains.map(x => (
                    <button
                      disabled={!switchNetwork || x.id === chain?.id || x.id == 18159}
                      key={x.id}
                      onClick={() => switchNetwork?.(x.id)}
                      className={
                        (x.id === chain?.id ? 'bg-[rgba(255,255,255,0.5)]' : 'bg-[rgba(255,255,255,0.1)] hover:scale-105') +
                        ' font-[Inter] m-1 rounded-lg py-1 px-3 text-white transition-all duration-150'
                      }
                    >
                      <div className="justify-left flex w-full items-center gap-2">
                        <div className="flex px-1">
                          {x && <Image src={getChainLogo(x.id)} alt="chain logo" height={20} width={20}></Image>}
                        </div>
                        {x.name}
                      </div>
                      {isLoading && pendingChainId && pendingChainId === x.id && ' (switching)'}
                    </button>
                  ))}
                <div className="text-red-500">{error && error.message}</div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
        {!chain?.unsupported ? (
          <div className={`${style.walletInfo}`}>
            {/* <div className={`${style.walletBalance} ${style.walletBalancePadding}`}>
              {parseFloat(balance?.formatted).toFixed(3)}
              {balance?.symbol}
            </div> */}
            <div className={`${style.walletAddress}`}>
              {address && `${address.slice(0, 5)}...${address.slice(address.length - 4, address.length)}`}
              {/* <ChevronDownIcon className='w-4 h-4 text-white'/> */}
              {/* <div className='hidden md:flex'>
                <CopyToClipboard copyText={address} />
              </div> */}
              <div onClick={() => disconnectWallet()} className={style.walletDisconnect}>
                <div className={style.walletDisconnectIcon}></div>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
}

export default WalletInfo
