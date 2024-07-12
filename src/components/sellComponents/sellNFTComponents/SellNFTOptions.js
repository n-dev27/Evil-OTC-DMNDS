const qs = require('qs')
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAccount, useNetwork } from 'wagmi'
import { RadioGroup } from '@headlessui/react'
import IsAddressValid from '../../../utils/isAddressValid.js'
import WalletIcon from '../../../assets/walleticon.svg'
import TwitterIcon from '../../../assets/twitter.svg'
import SellNFTInput from './SellNFTInput'
import SellNFTOutput from './SellNFTOutput'
import SelectWalletModal from '../../walletComponents/SelectWalletModal.js'
import SellNFTConfirmationModal from './SellNFTConfirmationModal'

const style = {
  discountButton: 'rounded-lg h-[2rem] w-1/5 bg-[#E1E5EC] hover:bg-[#8295B3] text-[#B2BCCC]',
  activeDiscountButton: '',
  discountOptionsButton:
    'flex rounded-lg h-[2rem] w-1/5 hover:bg-[#24C083] cursor-pointer justify-center text-center items-center shadow-md focus:outline-none',
  activeDiscountOptionButton:
    'flex rounded-lg h-[2rem] w-full hover:bg-[#24C083] text-white cursor-pointer justify-center text-center items-center shadow-md focus:outline-none',
  listforsellButton:
    'disabled:bg-[#C6CCD6] dark:disabled:bg-[#C6CCD6] bg-[#619FFF] hover:bg-[#1C76FF] dark:bg-gray-400 dark:hover:bg-gray-500 w-full my-2 rounded-3xl py-2 px-8 md:text-xl text-white font-semibold flex items-center justify-center',
  disabledButton:
    'bg-[#619FFF] dark:bg-gray-400 opacity-50 w-full my-2 rounded-3xl py-2 px-8 text-xl text-white font-semibold flex items-center justify-center',
}

const SellNFTOptions = props => {
  const { address, isConnected } = useAccount()

  let userAddress = address

  const { chain } = useNetwork()

  const [modalIsOpen, setIsOpen] = useState(false)

  function openFromParent() {
    setIsOpen(true)
  }

  function handleCloseModal(event, data) {
    console.log(event, data)
    setIsOpen(false)
  }

  function handleAfterOpen(event, data) {
    console.log(event, data)
  }

  const [recipient, setRecipient] = useState('')

  const [recipientType, setRecipientType] = useState('')

  const [recipientAddress, setRecipientAddress] = useState('')

  const [isRecipientAddressValid, setIsRecipientAddressValid] = useState()

  const [recipientHandle, setRecipientHandle] = useState('')

  const [inputNftData, setInputNftData] = useState()

  const [outputTokenData, setOutputTokenData] = useState('')

  const [outputTokenAmount, setOutputTokenAmount] = useState('')

  const [outputTokenMarketAmount, setOutputTokenMarketAmount] = useState(false)

  const [outputTokenAmountValue, setOutputTokenAmountValue] = useState('')

  const [outputTokenPrice, setOutputTokenPrice] = useState('')

  async function resetSellPageState() {
    setRecipient('')
    setRecipientAddress('')
    setOutputTokenAmount('')
    setOutputTokenMarketAmount(false)
    setOutputTokenPrice('')
  }

  useEffect(() => {
    resetSellPageState()
    setInputNftData()
    setOutputTokenData()
  }, [chain])

  return (
    <>
      <div className="py-2">
        <SellNFTInput
          outputTokenData={outputTokenData}
          setInputNftData={setInputNftData}
          setOutputTokenAmount={setOutputTokenAmount}
        />
      </div>
      <div className="py-2">
        <SellNFTOutput
          inputTokenData={inputNftData}
          outputTokenData={outputTokenData}
          setOutputTokenData={setOutputTokenData}
          outputTokenAmount={outputTokenAmount}
          setOutputTokenAmount={setOutputTokenAmount}
          outputTokenAmountValue={outputTokenAmountValue}
          setOutputTokenAmountValue={setOutputTokenAmountValue}
          outputTokenMarketAmount={outputTokenMarketAmount}
          setOutputTokenMarketAmount={setOutputTokenMarketAmount}
          outputTokenPrice={outputTokenPrice}
          setOutputTokenPrice={setOutputTokenPrice}
        />
      </div>
      {inputNftData && outputTokenData && outputTokenAmount && (
        <div className="mt-1 w-full flex-col items-center p-2 text-xs font-semibold text-[#566C90] dark:text-white md:text-sm">
          <div className="flex items-center justify-between py-2">
            <div className="">Wallet Address or Twitter Handle?</div>
            <RadioGroup
              className="flex h-6 w-fit cursor-pointer items-center rounded-3xl bg-white text-xs text-[#B2BCCC] dark:bg-gray-500 md:h-8"
              value={recipientType}
              onChange={setRecipientType}
            >
              <div>
                <RadioGroup.Option value="address">
                  {({ checked }) => (
                    <span
                      className={
                        checked
                          ? 'flex h-6 items-center rounded-3xl bg-[#1C76FF] px-2 text-white dark:bg-gray-700 md:h-8 ' +
                            (recipientHandle ? setRecipientHandle() : '')
                          : 'px-4'
                      }
                    >
                      Wallet
                    </span>
                  )}
                </RadioGroup.Option>
              </div>
              <div>
                <RadioGroup.Option value="twitter">
                  {({ checked }) => (
                    <span
                      className={
                        checked
                          ? 'flex h-6 items-center rounded-3xl bg-[#1C76FF] px-2 text-white dark:bg-gray-700 md:h-8 ' +
                            (recipientAddress ? setRecipientAddress() : '')
                          : 'px-4'
                      }
                    >
                      Twitter
                    </span>
                  )}
                </RadioGroup.Option>
              </div>
            </RadioGroup>
          </div>

          {recipientType == 'address' && (
            <div className="w-full py-4">
              <form>
                <label className="flex-inline">
                  <div className="absolute mt-2 items-center px-2">
                    <Image src={WalletIcon} height={20} width={20} />
                  </div>
                  <input
                    required={true}
                    type="text"
                    className="... peer w-full rounded-2xl bg-[#E1E5EC] p-2 text-center text-xs focus:bg-white dark:text-gray-700 focus:dark:text-gray-700 md:text-base"
                    onChange={event => setRecipientAddress(event.target.value)}
                    placeholder="Enter counterparty ETH wallet address"
                  />
                  <div className="-mt-7 flex items-center justify-end px-2">
                    <IsAddressValid
                      recipientAddress={recipientAddress}
                      setIsRecipientAddressValid={setIsRecipientAddressValid}
                    />
                  </div>
                  {!isRecipientAddressValid && (
                    <p className="mt-2 text-xs text-red-500">
                      Please provide a valid wallet address and ensure there are no spaces.
                    </p>
                  )}
                </label>
              </form>
            </div>
          )}

          {recipientType == 'twitter' && (
            <div className="w-full py-4">
              <form>
                <label className="flex-inline">
                  <div className="absolute mt-2 items-center px-2">
                    <Image src={TwitterIcon} height={20} width={20} />
                  </div>
                  <input
                    required={true}
                    type="text"
                    className="... peer w-full rounded-2xl bg-[#E1E5EC] p-2 text-center text-xs focus:bg-white dark:text-gray-700 focus:dark:text-gray-700 md:text-base"
                    onChange={event => setRecipientHandle(event.target.value)}
                    placeholder="Enter counterparty Twitter Handle"
                  />
                  <p className="invisible mt-2 text-xs text-red-500 peer-invalid:visible">
                    Please provide a valid Twitter handle for the user.
                  </p>
                </label>
              </form>
            </div>
          )}
        </div>
      )}
      <div>
        {!inputNftData || !outputTokenData ? (
          <div className="py-4">
            {isConnected ? <div className={style.disabledButton}>Select an NFT</div> : <SelectWalletModal />}
          </div>
        ) : (
          <div>
            <SellNFTConfirmationModal
              resetSellPageState={resetSellPageState}
              userAddress={userAddress}
              inputNftData={inputNftData}
              outputTokenData={outputTokenData}
              outputTokenAmount={outputTokenAmount}
              recipientType={recipientType}
              recipientAddress={recipientAddress}
              recipientHandle={recipientHandle}
              IsModalOpened={modalIsOpen}
              onCloseModal={handleCloseModal}
              onAfterOpen={handleAfterOpen}
            />
            <button
              disabled={
                !inputNftData ||
                !outputTokenData ||
                !outputTokenAmount ||
                !recipientType ||
                (recipientType == 'address' && (!recipientAddress || !isRecipientAddressValid)) ||
                (recipientType == 'twitter' && !recipientHandle)
              }
              onClick={openFromParent}
              className={style.listforsellButton}
            >
              {!outputTokenAmount ? (
                <div>Input amount to receive</div>
              ) : recipientType == '' ? (
                <a>Select recipient option type</a>
              ) : recipientType == 'address' && !isRecipientAddressValid ? (
                <a>Enter counterparty address</a>
              ) : recipientType == 'twitter' && !recipientHandle ? (
                <a>Enter Twitter handle</a>
              ) : (
                <a>List for sell</a>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="hidden flex-col text-center text-black dark:text-white">
        <h1 className="text-red-500">Temp Confirmation Data to list for sell</h1>
        <div>{inputNftData?.name}:</div>
        <div>
          {outputTokenData?.symbol}:{outputTokenAmount}
        </div>
        <div>
          {recipient}:&nbsp;{recipientType}
        </div>
        <div>
          {recipientAddress}:&nbsp;{recipientHandle}
        </div>
      </div>
    </>
  )
}

export default SellNFTOptions
