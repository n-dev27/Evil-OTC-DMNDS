import React from 'react'
import { useState, useEffect } from 'react'
import { useNetwork, useAccount } from 'wagmi'
import { Switch } from '@headlessui/react'

const style = {
  content:
    'bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40 w-[22rem] md:max-w-[35rem] border border-white dark:border-black rounded-3xl p-2 md:p-4 text-center',
}

const TokensContainer = () => {
  const { address, isConnected } = useAccount()

  const { chain } = useNetwork()

  const [verifiedTokensOption, setVerifiedTokensOption] = useState()

  const [allUnverifiedTokens, setAllUnverifiedTokens] = useState([])

  const [allVerifiedTokens, setAllVerifiedTokens] = useState([])

  async function getAllTokens() {
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

    if (chain?.id != (1 || 56 || 137 || 97 || 80001)) return

    let unmarshalChain = ''

    if (chain?.id == 1) unmarshalChain = 'ethereum'
    if (chain?.id == 56) unmarshalChain = 'bsc'
    if (chain?.id == 137) unmarshalChain = 'matic'
    if (chain?.id == 97) unmarshalChain = 'bsc-testnet'
    if (chain?.id == 80001) unmarshalChain = 'matic-testnet'

    const resp = await fetch(`https://api.unmarshal.com/v1/${unmarshalChain}/address/${address}/assets?${query}`, {
      method: 'GET',
    })

    const verifiedresp = await fetch(
      `https://api.unmarshal.com/v1/${unmarshalChain}/address/${address}/assets?${verifiedquery}`,
      { method: 'GET' }
    )

    const data = await resp.json()
    const verifieddata = await verifiedresp.json()
    console.log(data)

    setAllUnverifiedTokens(data)
    setAllVerifiedTokens(verifieddata)
  }

  useEffect(() => {
    getAllTokens()
  }, [isConnected, address, chain])

  return (
    <div className={style.content}>
      <div className="flex justify-center w-full">
        <div className="text-sm md:text-lg w-full">
          <dl>
            <div>
              <h1 className="text-large font-bold text-[#566B90] dark:text-white">Owned Tokens</h1>
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
              <a className="flex text-sm text-yellow-400">
                Note: Some tokens may be aridropped and can be scams. Always verify contract address and avoid
                interacting with unknown contracts.
              </a>
              <dd>
                {allUnverifiedTokens != [] && verifiedTokensOption ? (
                  <div className="md:max-h-125 w-auto overflow-auto">
                    {allUnverifiedTokens &&
                      allUnverifiedTokens?.map(token => (
                        <>
                          <span key={token} className="block truncate">
                            <div className="flex justify-between">
                              <div className="flex-col">
                                <div className="xs:text-xs flex items-center justify-start font-semibold md:text-sm">
                                  {token.contract_name}{' '}
                                  <a
                                    target="_blank"
                                    className="flex items-center px-2 text-sm text-blue-700"
                                    href={`https://etherscan.io/token/${token.contract_address}`}
                                    rel="noreferrer"
                                  >{`${token.contract_address.slice(0, 4)}...${token.contract_address.slice(
                                    token.contract_address.length - 4
                                  )}`}</a>
                                </div>
                                <div className="xs:text-xs flex justify-start text-gray-400 md:text-sm">
                                  {token.contract_ticker_symbol}
                                </div>
                              </div>
                              <div className="flex-col">
                                <div className="flex justify-end text-xs font-semibold md:text-sm">Balance</div>
                                <div className="flex justify-end text-xs text-gray-400 md:text-sm">
                                  {token.balance.length >= token.contract_decimals
                                    ? parseFloat(token.balance / 10 ** token.contract_decimals).toFixed(0)
                                    : token.balance}
                                </div>
                              </div>
                            </div>
                          </span>
                        </>
                      ))}
                  </div>
                ) : !verifiedTokensOption ? (
                  ''
                ) : (
                  <div className="px-4">No additional tokens held.</div>
                )}
                {allVerifiedTokens != [] && !verifiedTokensOption ? (
                  <div className="md:max-h-125 w-auto overflow-auto">
                    {allVerifiedTokens &&
                      allVerifiedTokens
                        ?.filter(token => token.quote > 1)
                        .map(token => (
                          <>
                            <span key={token} className="block truncate">
                              <div className="flex justify-between">
                                <div className="flex">
                                  <div className="bg-transparent p-2">
                                    <img
                                      className="items-center justify-start rounded-full bg-gray-300 md:h-[2rem] md:w-[2.25rem]"
                                      src={token.logo_url ? token.logo_url : 'images/personalWallet.png'}
                                      height={20}
                                      width={20}
                                    />
                                  </div>
                                  <div className="flex-col">
                                    <div className="xs:text-xs flex items-center justify-start font-semibold md:text-sm">
                                      {token.contract_name}{' '}
                                      <a
                                        target="_blank"
                                        className="flex items-center px-2 text-sm text-blue-700"
                                        href={`https://etherscan.io/token/${token.contract_address}`}
                                        rel="noreferrer"
                                      >{`${token.contract_address.slice(0, 4)}...${token.contract_address.slice(
                                        token.contract_address.length - 4
                                      )}`}</a>
                                    </div>
                                    <div className="xs:text-xs flex justify-start text-gray-400 md:text-sm">
                                      {token.contract_ticker_symbol}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-col">
                                  <div className="flex justify-end text-xs font-semibold md:text-sm">Balance</div>
                                  <div className="flex justify-end text-xs text-gray-400 md:text-sm">
                                    {token.balance.length < token.contract_decimals
                                      ? parseFloat(token.balance / 10 ** token.contract_decimals).toFixed(6)
                                      : parseFloat(token.balance / (10 ** token.contract_decimals).toFixed(0))}{' '}
                                    <a>{'($' + parseFloat(token.quote).toFixed(2) + ')'}</a>
                                  </div>
                                </div>
                              </div>
                            </span>
                          </>
                        ))}
                  </div>
                ) : verifiedTokensOption ? (
                  ''
                ) : (
                  <div className="px-4">No additional tokens held.</div>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default TokensContainer
