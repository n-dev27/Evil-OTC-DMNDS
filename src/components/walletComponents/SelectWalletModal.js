import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Image from 'next/image'
import { useConnect } from 'wagmi'
import metamaskLogo from '../../assets/mm.svg'
import walletconnectLogo from '../../assets/wc.svg'
import coinbaseLogo from '../../assets/cbw.svg'

const style = {
  buttonContainer: `flex`,
  icon: `flex justify-start p-1`,
  button: `h-8 sm:h-11 min-w-[150px] sm:min-w-[174px] flex justify-center items-center hover:bg-[rgba(28,118,255,0.2)] text-white text-sm sm:text-lg cursor-pointer rounded-[12px] border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]`,
  buttonPadding: `px-3 py-4`,
  disclosure: `bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] text-sm rounded-xl px-4 py-2 text-left`,
  walletButtonContainer: `gap-3 flex flex-col w-full`,
  walletButton: `flex gap-2 disabled:bg-gray-100/10 flex p-2 w-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.8)] rounded-xl text:sm md:text-xl `,
  walletButtonPadding: `min-h-[50px] py-2 items-center justify-center`,
  closeButtonContainer: `flex w-auto mt-3 justify-center`,
  clostButtonInfo: `inline flex justify-center px-4 py-2 font-[Inter] text-sm text-[rgba(0,0,0,0.8)] bg-[rgba(95,219,197,1)] rounded-xl hover:bg-[rgba(95,219,197,0.8)] duration-300`,
}

export default function SelectWalletModal() {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <div>
        <div
          onClick={isMobile ? () => connect({ connector: connectors[0] }) : () => openModal()}
          className={`${style.button} ${style.buttonPadding}`}
        >
          Connect Wallet
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[12px]" aria-hidden="true" />
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="customShare customBorder inline-block max-w-md transform overflow-hidden rounded-2xl bg-[rgba(40,24,85,0.6)] p-6 align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="p-2 text-center text-sm leading-6 text-[rgba(255,255,255,0.8)] md:text-lg font-[Inter]"
                >
                  Connect a wallet
                </Dialog.Title>
                <div className={style.disclosure}>
                  <a>
                    By connecting a wallet, you agree to Diamonds{' '}
                    <a href="/" className="text-blue-300 hover:text-blue-400">
                      Terms of Service{' '}
                    </a>
                    and acknowledge that you have read and understand the{' '}
                    <a href="/" className="text-blue-300 hover:text-blue-400">
                      Diamond Protocol Disclaimer
                    </a>
                    .
                  </a>
                </div>
                <div className='mt-3'>
                  <div className={style.walletButtonContainer}>
                    <button
                      onClick={() => {
                        connect({ connector: connectors[1] })
                      }}
                      className={`${style.walletButton} ${style.walletButtonPadding}`}
                    >
                      <div className={style.icon}>
                        <Image src={metamaskLogo} alt="mm logo" height={25} width={25}></Image>
                      </div>
                      <p>MetaMask</p>
                      {isLoading && pendingConnector === connectors[1] && ' (connecting)'}
                    </button>
                    <button
                      onClick={() => {
                        connect({ connector: connectors[2] })
                      }}
                      className={`${style.walletButton} ${style.walletButtonPadding}`}
                    >
                      <div className={style.icon}>
                        <Image src={walletconnectLogo} alt="wc logo" height={25} width={25}></Image>
                      </div>
                      <p className="">WalletConnect</p>
                      {isLoading && pendingConnector === connectors[2] && ' (connecting)'}
                    </button>
                    <button
                      onClick={() => {
                        connect({ connector: connectors[3] })
                      }}
                      className={`${style.walletButton} ${style.walletButtonPadding}`}
                    >
                      <div className={style.icon}>
                        <Image src={coinbaseLogo} alt="cbw logo" height={25} width={25}></Image>
                      </div>
                      <p className="">Coinbase</p>
                      {isLoading && pendingConnector === connectors[3] && ' (connecting)'}
                    </button>
                    {error && <div className="p-1 text-center text-red-500">{error.message}</div>}
                  </div>
                </div>

                <div className={style.closeButtonContainer}>
                  <button type="button" className={style.clostButtonInfo} onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
