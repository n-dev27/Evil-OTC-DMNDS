import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNetwork, useToken, useAccount } from 'wagmi';
import { utils } from 'ethers';
import { ChevronRightIcon, XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/20/solid';
import { countLeadingZerosAfterDecimal } from '../../../utils/countDecimals';
import mainnetTokenList from './tokenLists/mainnet.tokenlist.json';
import goerliTokenList from './tokenLists/goerli.tokenlist.json';
import nahmiiTokenList from './tokenLists/nahmiiMainnet.tokenlist.json';
import arbitrumTokenList from './tokenLists/arbitrum.tokenlist.json';

const TokenModal = props => {
  const { address, isConnected } = useAccount()

  const [connectedError, setConnectedError] = useState()

  const { chain } = useNetwork()

  const [tokenListType, setTokenListType] = useState('wallet')

  const [unsupportedToken, setUnsupportedToken] = useState('')

  const { data: unsupportedTokenData } = useToken({
    address: unsupportedToken,
  })

  let tokenList = ''

  if (chain?.id == 1) {
    tokenList = mainnetTokenList
  }
  if (chain?.id == 5) {
    tokenList = goerliTokenList
  }
  if (chain?.id == 42161) {
    tokenList = arbitrumTokenList
  }
  if (chain?.id == 5551) {
    tokenList = nahmiiTokenList
  }

  const tokens = tokenList.tokens;

  const [verifiedTokensOption, setVerifiedTokensOption] = useState()

  const [allUnverifiedWalletTokens, setAllUnverifiedWalletTokens] = useState()

  const [allVerifiedWalletTokens, setAllVerifiedWalletTokens] = useState()

  const [foundWalletUnverifiedTokens, setFoundWalletUnverifiedTokens] = useState()

  const [foundWalletVerifiedTokens, setFoundWalletVerifiedTokens] = useState()

  const [walletUnverifiedToken, setWalletUnverifiedToken] = useState()

  const [walletVerifiedToken, setWalletVerifiedToken] = useState()

  let chainLogo = ''

  let unsupportedLogo = '/images/unsupportedLogo.png'

  let personalWalletLogo = '/images/personalWallet.png'

  if (chain?.id === 1 || chain?.id === 5 || chain?.id === 42161) {
    chainLogo = '/images/ethLogo.png'
  }
  if (chain?.id === 56 || chain?.id === 97) {
    chainLogo = '/images/bscLogo.png'
  }
  if (chain?.id === 137 || chain?.id === 80001) {
    chainLogo = '/images/maticLogo.png'
  }
  if (chain?.id === 5551 || chain?.id === 5553) {
    chainLogo = '/images/nahmiiLogo.png'
  }

  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
    setUnsupportedToken('')
  }

  function openModal() {
    setIsOpen(true)
    setFoundTokens(tokens)
    setFoundWalletUnverifiedTokens(allUnverifiedWalletTokens)
    setFoundWalletVerifiedTokens(allVerifiedWalletTokens)
    console.log('props.outputRestricted === ', props.outputRestricted) 
    console.log('tokenListType === ', tokenListType) 
  }

  async function getAllTokens() {
    if (chain?.id != (42161 || 1 || 56 || 137 || 97 || 80001)) {
      setAllUnverifiedWalletTokens()
      setAllVerifiedWalletTokens()
      return
    }

    if (props.outputRestricted) {
      return
    }

    let unmarshalChain = ''
    let moralisChain = ''

    if (chain?.id == 1) {
      unmarshalChain = 'ethereum'
      moralisChain = 'eth'
    }
    if (chain?.id == 5) {
      moralisChain = 'goerli'
    }
    if (chain?.id == 56) {
      unmarshalChain = 'bsc'
      moralisChain = 'bsc'
    }
    if (chain?.id == 137) {
      unmarshalChain = 'matic'
      moralisChain = 'polygon'
    }
    if (chain?.id == 42161) {
      unmarshalChain = 'arbitrum'
      moralisChain = 'arbitrum'
    }
    if (chain?.id == 97) {
      unmarshalChain = 'bsc-testnet'
      moralisChain = 'bsc testnet'
    }
    if (chain?.id == 80001) {
      unmarshalChain = 'matic-testnet'
      moralisChain = 'mumbai'
    }

    const query = new URLSearchParams({
      verified: 'false',
      chainId: 'false',
      token: 'false',
      auth_key: process.env.NEXT_PUBLIC_UNMARSHAL_API,
    }).toString()

    const verifiedquery = new URLSearchParams({
      verified: 'true',
      chainId: 'false',
      token: 'false',
      auth_key: process.env.NEXT_PUBLIC_UNMARSHAL_API,
    }).toString()

    const resp = await fetch(`https://api.unmarshal.com/v1/${unmarshalChain}/address/${address}/assets?${query}`, {
      method: 'GET',
    })

    const verifiedresp = await fetch(
      `https://api.unmarshal.com/v1/${unmarshalChain}/address/${address}/assets?${verifiedquery}`,
      { method: 'GET' }
    )

    const data = await resp.json()
    const verifieddata = await verifiedresp.json()

    if (data != '' && data?.message != 'Limit Exceeded' && Array.isArray(data)) {
      const formattedData =
        data &&
        data?.map(wToken => ({
          address: wToken?.contract_address,
          symbol: wToken?.contract_ticker_symbol,
          name: wToken?.contract_name,
          decimals: wToken?.contract_decimals,
          balance: wToken?.balance,
          logoURI: wToken?.logo_url,
          verified: wToken?.verified,
        }))

      setAllUnverifiedWalletTokens(formattedData)
    }

    if (verifieddata != '' && verifieddata?.message != 'Limit Exceeded' && Array.isArray(verifieddata)) {
      const formattedVerifiedData =
        verifieddata &&
        verifieddata?.map(wToken => ({
          address: wToken?.contract_address,
          symbol: wToken?.contract_ticker_symbol,
          name: wToken?.contract_name,
          decimals: wToken?.contract_decimals,
          balance: wToken?.balance,
          logoURI: wToken?.logo_url,
          verified: wToken?.verified,
          quote: wToken?.quote,
        }))

      setAllVerifiedWalletTokens(formattedVerifiedData)
    }

    if (data?.message == 'Limit Exceeded' || verifieddata?.message == 'Limit Exceeded') {

      const options = {
        method: 'GET',
        headers: { 'accept': 'application/json', 'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API },
      }

      const dataresp = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}/erc20?chain=${moralisChain}`,
        options
      )

      const data = await dataresp.json()

      const formattedMoralisData =
        data &&
        data?.map(wToken => ({
          address: wToken?.token_address,
          symbol: wToken?.symbol,
          name: wToken?.name,
          decimals: wToken?.decimals,
          balance: wToken?.balance,
          logoURI: wToken?.logo,
          verified: wToken?.verified,
        }))

      setAllUnverifiedWalletTokens(formattedMoralisData)
    }
  }

  // the value of the search field
  const [token, setToken] = useState('')

  // the search result
  const [foundTokens, setFoundTokens] = useState()

  const filter = e => {
    const keyword = e.target.value

    if (keyword !== '') {
      const results = tokens?.filter(token => {
        return (
          token?.name.toLowerCase().startsWith(keyword.toLowerCase()) ||
          token?.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
          token?.address?.toLowerCase().startsWith(keyword.toLowerCase())
        )
        // Use the toLowerCase() method to make it case-insensitive
      })
      setFoundTokens(results)
      setUnsupportedToken(keyword)
    } else {
      setFoundTokens(tokens)
      // If the text field is empty, show all tokens
    }

    setToken(keyword)
  }

  const walletfilterunverified = e => {
    const keyword = e.target.value

    if (keyword !== '') {
      const results = allUnverifiedWalletTokens?.filter(token => {
        return (
          token?.name.toLowerCase().startsWith(keyword.toLowerCase()) ||
          token?.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
          token?.address?.toLowerCase().startsWith(keyword.toLowerCase())
        )
        // Use the toLowerCase() method to make it case-insensitive
      })
      setFoundWalletUnverifiedTokens(results)
    } else {
      setFoundWalletUnverifiedTokens(allUnverifiedWalletTokens)
      // If the text field is empty, show all tokens
    }

    setWalletUnverifiedToken(keyword)
  }

  const walletfilterverified = e => {
    const keyword = e.target.value

    if (keyword !== '') {
      const results = allVerifiedWalletTokens?.filter(token => {
        return (
          token?.name.toLowerCase().startsWith(keyword.toLowerCase()) ||
          token?.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
          token?.address?.toLowerCase().startsWith(keyword.toLowerCase())
        )
        // Use the toLowerCase() method to make it case-insensitive
      })
      setFoundWalletVerifiedTokens(results)
    } else {
      setFoundWalletVerifiedTokens(allVerifiedWalletTokens)
      // If the text field is empty, show all tokens
    }

    setWalletVerifiedToken(keyword)
  }

  async function setWalletType() {
    if (tokenListType == 'all') {
      setToken('')
      setFoundTokens(tokens)
    } else {
      setWalletVerifiedToken('')
      setWalletUnverifiedToken('')
      setFoundWalletUnverifiedTokens(allUnverifiedWalletTokens)
      setFoundWalletVerifiedTokens(allVerifiedWalletTokens)
    }
  }

  useEffect(() => {
    setWalletType()
  }, [tokenListType, address, chain])

  useEffect(() => {
    setSelectedToken()
    setTokenListType('all')
  }, [chain, address])

  const [selectedToken, setSelectedToken] = useState()

  if (selectedToken && selectedToken == chain?.nativeCurrency) selectedToken.logoURI = chainLogo

  return (
    <>
      <div
        onClick={
          isConnected ? () => openModal() + getAllTokens() : () => setConnectedError('Please connect your wallet')
        }
      >
        <div className="flex text-xl">
          {selectedToken ? (
            <div className="flex w-full items-center justify-center gap-1">
              <div className='flex gap-2 sm:gap-3 items-center'>
                <div className="h-4 w-4 sm:h-7 sm:w-7 bg-transparent flex justify-center items-center">
                  <img
                    className="h-4 w-4 sm:h-7 sm:w-7 items-center justify-center rounded-full"
                    src={
                      selectedToken.logoURI
                        ? selectedToken.logoURI
                        : tokenListType == 'wallet'
                        ? personalWalletLogo
                        : unsupportedLogo
                    }
                  />
                </div>
                <div className="flex justify-center items-center text-[rgba(255,255,255,0.8)] text-sm sm:text-xl font_Inter font-bold" style={{letterSpacing: '2px'}}>
                  {selectedToken.symbol}
                </div>
              </div>
              <ChevronRightIcon className="text-[rgba(255,255,255,0.4)] w-5 h-5" />
            </div>
          ) : (
            <div className="flex w-max items-center justify-center text-[rgba(255,255,255,0.8)] text-sm sm:text-xl font_Inter font-bold gap-1">
              Select a token
              <ChevronRightIcon className="text-[rgba(255,255,255,0.4)] h-5 w-5 pt-[2px]" />
            </div>
          )}
        </div>
        <div className="w- text-xs text-red-500">{!isConnected && connectedError}</div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[12px]" aria-hidden="true" />

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 sm:overflow-y-auto">
            <div className="flex min-h-full items-center justify-center pb-[3.3rem] text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >

                <Dialog.Panel className="h-screen sm:h-[574px] w-full sm:w-[655px] transform sm:rounded-2xl bg-[rgba(22,41,48,0.8)] p-5 sm:p-10 text-left align-middle shadow-[rgba(0,0,0,0.16)] transition-all border-[1.2px] border-[rgba(255,255,255,0.1)]">

                  <Dialog.Title
                    as="h3"
                    className="flex justify-between items-center text-2xl sm:text-3xl font_Inter font-bold leading-6 text-[rgba(255,255,255,0.6)]"
                    >
                    Select a token
                    <button
                      type="button"
                      className="flex h-8 w-8 mb-10 items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.2)] text-center"
                      onClick={closeModal}
                    >
                      <XMarkIcon className='w-8 h-8 text-[rgba(255,255,255,0.2)] hover:text-white'/>
                    </button>
                  </Dialog.Title>
                  {!props.outputRestricted && (
                    <form className="flex items-center">
                      <label htmlFor="token-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-screen">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"></div>
                        <MagnifyingGlassIcon className='absolute top-[calc(50%-12px)] sm:top-[calc(50%-16px)] left-4 w-6 h-6 sm:w-8 sm:h-8 text-[rgba(255,255,255,0.2)]'/>
                        {tokenListType == 'all' && (
                          <input
                            type="search"
                            id="token-search"
                            onChange={filter}
                            value={token}
                            className="customShare block w-full rounded-lg border-none bg-[rgba(255,255,255,0.05)] pl-16 p-4 text-lg text-[rgba(255,255,255,0.2)] outline-none focus:outline-none focus:ring-transparent"
                            placeholder="Search token"
                          />
                        )}
                        {tokenListType == 'wallet' && verifiedTokensOption && (
                          <input
                            type="search"
                            id="token-search"
                            onChange={walletfilterunverified}
                            className="customShare block w-full rounded-lg border-none bg-[rgba(255,255,255,0.05)] pl-16 p-4 text-lg text-[rgba(255,255,255,0.2)] outline-none focus:outline-none focus:ring-transparent"
                            placeholder="Search token"
                          />
                        )}
                        {tokenListType == 'wallet' && !verifiedTokensOption && (
                          <input
                            type="search"
                            id="token-search"
                            onChange={walletfilterverified}
                            className="customShare block w-full rounded-lg border-none bg-[rgba(255,255,255,0.05)] pl-16 p-4 text-lg text-[rgba(255,255,255,0.2)] outline-none focus:outline-none focus:ring-transparent"
                            placeholder="Search token"
                          />
                        )}
                      </div>
                    </form>
                  )}

                  {/* <div className="w-full p-2">
                    <button
                      disabled={
                        selectedToken?.symbol === chain?.nativeCurrency?.symbol ||
                        chain?.nativeCurrency?.symbol ===
                          (props.inputTokenData?.symbol || props.outputTokenData?.symbol)
                      }
                      key={chain?.nativeCurrency?.symbol}
                      onClick={() => {
                        setSelectedToken(chain?.nativeCurrency)
                        props.SetTokenData(chain?.nativeCurrency)
                        closeModal()
                      }}
                      className="rounded-lg p-1 border enabled:hover:rounded-xl enabled:hover:bg-[#dbd7d7] disabled:opacity-60 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-center px-1 gap-1">
                        <div className="h-5 w-5 bg-transparent ">
                          <img className="items-center justify-center rounded-full" src={chainLogo} />
                        </div>
                          <div className="font-semibold pt-[2px]">{chain?.nativeCurrency?.symbol}</div>
                      </div>
                    </button>
                  </div>
                  <div className="border-b-2 border-[#F6F6F6]"></div> */}

                  {/* {!props.outputRestricted && (
                    <div className="flex-col items-center justify-center py-1">
                      <div className="flex justify-center p-1">
                        <RadioGroup
                          className="flex h-5 w-fit cursor-pointer items-center rounded-3xl bg-white text-xs text-[#B2BCCC] dark:bg-gray-500"
                          value={tokenListType}
                          onChange={setTokenListType}
                        >
                          <div className="py-1">
                            <RadioGroup.Option value="all">
                              {({ checked }) => (
                                <span
                                  className={
                                    checked
                                      ? 'flex h-5 items-center rounded-3xl bg-[#1C76FF] px-2 text-white dark:bg-gray-700 '
                                      : 'px-2'
                                  }
                                >
                                  All Tokens
                                </span>
                              )}
                            </RadioGroup.Option>
                          </div>
                          <div className="py-1">
                            <RadioGroup.Option value="wallet">
                              {({ checked }) => (
                                <span
                                  className={
                                    checked
                                      ? 'flex h-5 items-center rounded-3xl bg-[#1C76FF] px-2 text-white dark:bg-gray-700 '
                                      : 'px-2'
                                  }
                                >
                                  Wallet Tokens
                                </span>
                              )}
                            </RadioGroup.Option>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}

                  {!props.outputRestricted && tokenListType == 'wallet' && (
                    <div className="flex items-center justify-center text-xs text-[#354B75] dark:text-white">
                      <a className="flex items-center px-4">Verified</a>
                      <Switch
                        checked={verifiedTokensOption}
                        onChange={e => {
                          setVerifiedTokensOption(e)
                        }}
                        className={`${verifiedTokensOption ? 'bg-white' : 'bg-[#A5B1C6]'}
                                        relative flex h-2 w-6 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-inner transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span className="sr-only">Use setting</span>
                        <span
                          aria-hidden="true"
                          className={`${verifiedTokensOption ? 'translate-x-3' : '-translate-x-3'}
                                            pointer-events-none inline-block h-4 w-4 rounded-full bg-gradient-to-b from-[#3E547E] to-[#7791BB] shadow-2xl shadow-black ring-0 transition duration-200 ease-in-out dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-500`}
                        />
                      </Switch>
                      <a className="flex px-4">Un-Verified</a>
                    </div>
                  )} */}

                  <div className="flex pt-3">
                    <div className="mt-2 flex h-[calc(100vh-192px)] sm:h-[340px] w-full overflow-y-auto">
                      {!props.outputRestricted && tokenListType == 'all' && (
                        <div className='w-full h-full'>
                          {(foundTokens && foundTokens?.length > 0) || unsupportedTokenData ? (
                            foundTokens?.map(token => (
                              <button
                                disabled={
                                  selectedToken?.symbol === token?.symbol ||
                                  token?.symbol === (props.inputTokenData?.symbol || props.outputTokenData?.symbol)
                                }
                                key={token.symbol}
                                onClick={() => {
                                  setSelectedToken(token)
                                  props.SetTokenData(token)
                                  closeModal()
                                }}
                                className="flex justify-between items-center w-full px-4 enabled:hover:rounded-xl enabled:hover:bg-[rgba(255,255,255,0.05)]"
                              >
                                <div className="flex items-center">
                                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent">
                                    <img className="items-center justify-center rounded-full" src={token.logoURI} />
                                  </div>
                                  <div className="p-4 text-start flex items-center gap-4">
                                    <div className="text-[rgba(255,255,255,0.8)] font_Inter font-medium text-base sm:text-xl">
                                      {token.symbol}
                                    </div>
                                    <div className='text-[rgba(255,255,255,0.5)] text-sm sm:text-base font_Inter font-normal'>({chain?.name})</div>
                                    {/* <div className="text-[0.7rem] text-gray-400 md:text-xs">{token.address}</div> */}
                                  </div>
                                </div>
                                {selectedToken?.symbol === token?.symbol && (
                                  <CheckIcon className='w-4 h-4 sm:w-6 sm:h-6 text-white'/>
                                )}
                              </button>
                            ))
                          ) : (
                            <h1 className='text-[rgba(255,255,255,0.6)]'>No token found!</h1>
                          )}
                        </div>
                      )}

                      {props.outputRestricted && tokenListType == 'all' && (
                        // <div>
                        //   {unsupportedTokenData && !foundTokens?.length > 0 ? (
                        //     <div>
                        //       <button
                        //         disabled={selectedToken?.symbol === unsupportedTokenData?.symbol}
                        //         key={unsupportedTokenData?.symbol}
                        //         onClick={() => {
                        //           setSelectedToken(unsupportedTokenData)
                        //           props.SetTokenData(unsupportedTokenData)
                        //           closeModal()
                        //         }}
                        //         className="w-full enabled:hover:rounded-xl enabled:hover:bg-[#dbd7d7] disabled:opacity-60"
                        //       >
                        //         <div className="flex items-center px-1">
                        //           <div className="h-8 w-8 bg-transparent">
                        //             <img
                        //               className="items-center justify-center rounded-full"
                        //               src="images/unsupportedLogo.png"
                        //               height={30}
                        //               width={30}
                        //             />
                        //           </div>
                        //           <div className="p-2 text-start">
                        //             <div className="text-sm font-semibold text-[#354B75] dark:text-white md:text-base">
                        //               {unsupportedTokenData?.symbol}{' '}
                        //               <a className="text-xs text-gray-400">{unsupportedTokenData?.name}</a>
                        //             </div>
                        //             <div className="text-[0.7rem] text-gray-400 md:text-xs">
                        //               {unsupportedTokenData?.address}
                        //             </div>
                        //           </div>
                        //         </div>
                        //       </button>
                        //       <div className="text-center text-yellow-400">
                        //         This token is not Diamond Swap verified. Verify you have the correct contract address
                        //         and proceed at your own risk.
                        //       </div>
                        //     </div>
                        //   ) : (
                        //     <></>
                        //   )}
                        // </div>
                        <div className="w-full">
                          <button
                            disabled={
                              selectedToken?.symbol === chain?.nativeCurrency?.symbol ||
                              chain?.nativeCurrency?.symbol ===
                                (props.inputTokenData?.symbol || props.outputTokenData?.symbol)
                            }
                            key={chain?.nativeCurrency?.symbol}
                            onClick={() => {
                              setSelectedToken(chain?.nativeCurrency)
                              props.SetTokenData(chain?.nativeCurrency)
                              closeModal()
                            }}
                            className="flex justify-between px-4 items-center w-full enabled:hover:rounded-xl enabled:hover:bg-[rgba(255,255,255,0.05)]"
                          >
                            <div className="flex items-center">
                              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent">
                                <img className="items-center justify-center rounded-full" src={chainLogo} />
                              </div>
                              <div className='p-4 text-start flex items-center gap-4'>
                              <div className="text-[rgba(255,255,255,0.8)] font_Inter font-medium text-base sm:text-xl">
                                {chain?.nativeCurrency?.symbol}
                              </div>
                              <div className='text-[rgba(255,255,255,0.5)] text-base font_Inter font-normal'>({chain?.name})</div>
                              </div>
                            </div>
                            {selectedToken?.symbol === chain?.nativeCurrency?.symbol && (
                              <CheckIcon className='w-4 h-4 sm:w-6 sm:h-6 text-white'/>
                            )}
                          </button>
                        </div>
                      )}

                      {!props.outputRestricted && tokenListType == 'wallet' && !verifiedTokensOption && (
                        <div>
                          {foundWalletVerifiedTokens && foundWalletVerifiedTokens?.length > 0 ? (
                            foundWalletVerifiedTokens
                              ?.filter(token => token.quote > 1)
                              .map(token => (
                                <button
                                  disabled={selectedToken?.symbol === token?.symbol}
                                  key={token.symbol}
                                  onClick={() => {
                                    setSelectedToken(token)
                                    props.SetTokenData(token)
                                    closeModal()
                                  }}
                                  className="w-full enabled:hover:rounded-xl enabled:hover:bg-[#dbd7d7] disabled:opacity-60"
                                >
                                  <div className="flex items-center px-1">
                                    <div className="h-8 w-8 bg-transparent">
                                      <img
                                        className="items-center justify-start rounded-full bg-gray-300"
                                        src={token.logoURI ? token.logoURI : 'images/personalWallet.png'}
                                      />
                                    </div>
                                    <div className="w-full p-2 text-start">
                                      <div className="flex-col font-semibold">
                                        <div className="flex justify-between text-[#354B75] dark:text-white">
                                          <div className="text-sm md:text-base">{token.symbol}</div>
                                          <div className="flex items-center justify-end text-end text-[0.55rem]">
                                            Balance:{' '}
                                            {utils.commify(
                                              countLeadingZerosAfterDecimal(token.balance / 10 ** token.decimals)
                                            )}
                                          </div>
                                        </div>
                                        <a className="flex items-end text-xs text-gray-400">{token.name}</a>
                                      </div>
                                      <div className="text-[0.7rem] text-gray-400 md:text-xs">{token.address}</div>
                                    </div>
                                  </div>
                                </button>
                              ))
                          ) : (
                            <h1>No tokens found in wallet!</h1>
                          )}
                        </div>
                      )}

                      {!props.outputRestricted && tokenListType == 'wallet' && verifiedTokensOption && (
                        <div>
                          {foundWalletUnverifiedTokens && foundWalletUnverifiedTokens?.length > 0 ? (
                            foundWalletUnverifiedTokens?.map(token => (
                              <button
                                disabled={selectedToken?.symbol === token?.symbol}
                                key={token.symbol}
                                onClick={() => {
                                  setSelectedToken(token)
                                  props.SetTokenData(token)
                                  closeModal()
                                }}
                                className="w-full enabled:hover:rounded-xl enabled:hover:bg-[#dbd7d7] disabled:opacity-60"
                              >
                                <div className="flex items-center px-1">
                                  <div className="h-8 w-8 bg-transparent">
                                    <img
                                      className="items-center justify-start rounded-full bg-gray-300"
                                      src="images/personalWallet.png"
                                    />
                                  </div>
                                  <div className="w-full p-2 text-start">
                                    <div className="flex-col font-semibold">
                                      <div className="flex justify-between text-[#354B75] dark:text-white">
                                        <div className="text-sm md:text-base">{token.symbol}</div>
                                        <div className="flex items-center justify-end text-end text-[0.55rem]">
                                          Balance:{' '}
                                          {token.balance.length >= token.decimals
                                            ? utils.commify(
                                              countLeadingZerosAfterDecimal(token.balance / 10 ** token.decimals)
                                              )
                                            : utils.commify(token.balance)}
                                        </div>
                                      </div>
                                      <a className="flex items-end text-xs text-gray-400">{token.name}</a>
                                    </div>
                                    <div className="text-[0.7rem] text-gray-400 md:text-xs">{token.address}</div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <h1>No tokens found in wallet!</h1>
                          )}
                        </div>
                      )}

                      {props.outputRestricted && (
                        <div>
                          {(foundTokens && foundTokens?.length > 0) || unsupportedTokenData ? (
                            foundTokens
                              ?.filter(token => null)
                              .map(token => (
                                <button
                                  disabled={
                                    selectedToken?.symbol === token?.symbol ||
                                    token?.symbol === props.inputTokenData?.symbol
                                  }
                                  key={token.symbol}
                                  onClick={() => {
                                    setSelectedToken(token)
                                    props.SetTokenData(token)
                                    closeModal()
                                  }}
                                  className="enabled:hover:rounded-xl enabled:hover:bg-[#dbd7d7] disabled:opacity-60"
                                >
                                  <div className="flex items-center px-1">
                                    <div className="h-8 w-8 bg-transparent">
                                      <img className="items-center justify-start rounded-full" src={token.logoURI} />
                                    </div>
                                    <div className="p-2 text-start">
                                      <div className="text-sm font-semibold text-[#354B75] dark:text-white md:text-base">
                                        {token.symbol} <a className="text-xs text-gray-400">{token.name}</a>
                                      </div>
                                      <div className="text-[0.7rem] text-gray-400 md:text-xs">{token.address}</div>
                                    </div>
                                  </div>
                                </button>
                              ))
                          ) : (
                            <h1 className='text-[rgba(255,255,255,0.6)]'>No token found!</h1>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default TokenModal
