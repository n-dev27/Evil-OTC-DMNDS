import React, { useState } from 'react'
import Image from 'next/image'
import { utils } from 'ethers'
import DiamondLogo from '../../assets/App_Logo.png'
import { Switch, Disclosure } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon, MinusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import CopyToClipboard from '../../utils/CopyToClipboard.js'

const LPPoolInfo = ({ tokenPairs, getTokenInfo, tokenImage }) => {
  const [lpPoolView, setLpPoolView] = useState(false)

  return (
    <div className="w-[22rem] md:w-full">
      {tokenPairs && (
        <div>
          <div className="flex-col items-center justify-center text-center">
            <div className="text-sm md:text-xl">Additional Liquidity Pools&nbsp;</div>
            {lpPoolView && tokenPairs?.length > '0' && (
              <div className="p-1">
                <button
                  className="rounded-2xl bg-[#619FFF] p-1 text-xs font-extralight text-white hover:bg-[#1C76FF] dark:bg-gray-400 hover:dark:bg-gray-500"
                  onClick={() => getTokenInfo()}
                >
                  Update LP info
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-evenly py-2 text-center text-[.70rem] md:text-base">
            <div className={`${lpPoolView ? 'w-2/5 text-end text-gray-400' : 'w-2/5  text-end'}`}>Hide LP Pools</div>
            <div className="flex w-[4rem] justify-center">
              <Switch
                checked={lpPoolView}
                onChange={setLpPoolView}
                className={`${lpPoolView ? 'bg-white' : 'bg-[#A5B1C6]'}
                            h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-inner transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`${lpPoolView ? 'translate-x-3' : '-translate-x-3'}
                            -mt-1.5 flex h-6 w-6 rounded-full border border-slate-300 bg-gradient-to-b from-[#3E547E] to-[#7791BB] shadow-xl ring-0 transition duration-300 ease-in-out`}
                />
              </Switch>
            </div>
            <div className={`${lpPoolView ? 'w-2/5 text-start ' : 'w-2/5 text-start text-gray-400'}`}>
              Show LP Pools
            </div>
          </div>
        </div>
      )}
      {lpPoolView && tokenPairs && (
        <div>
          <div className="xs:flex-col max-w-7xl justify-center md:flex md:flex-wrap">
            {tokenPairs &&
              React.Children.toArray(
                tokenPairs.map(x => (
                  <div key={x} className="p-2 text-[#354B75] dark:text-white">
                    <div className="bg-gradient-to-b from-[#EEF2F8] via-[#F5F9FF]/70 to-[#FFFFFF]/70 dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40 md:px-3">
                      <div className="flex w-full md:p-2">
                        <div className="hidden w-1/4 items-center justify-start px-2 md:flex">
                          <div className="items-center justify-start rounded-full bg-gradient-to-b from-[#374D77] to-[#7993BD] text-center">
                            <img
                              src={tokenImage}
                              className="w-26 md:w-30 md:h-30 xs:p-2 flex h-24 items-center justify-center rounded-full text-center"
                            />
                          </div>
                        </div>
                        <div className="w-3/4 justify-between p-2 md:flex">
                          <div className="flex">
                            <div className="flex-col text-xs md:text-sm">
                              <div className="flex text-base">
                                {x?.quoteToken?.symbol + '/' + x?.baseToken?.symbol + ' '}
                                <a
                                  className="mt-1 items-center hover:text-[#1C76FF]"
                                  href={x?.url ? `${x?.url}` : 'N/A'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </a>
                              </div>
                              <div className="flex justify-between text-sm">
                                <div className="text-[#8295B3] dark:text-gray-300">{x?.baseToken?.symbol}:</div>&nbsp;
                                <div className="text-[#566C90">
                                  {x?.baseToken?.address?.slice(0, 4)}...
                                  {x?.baseToken?.address?.slice(
                                    x?.baseToken?.address?.length - 4,
                                    x?.baseToken?.address?.length
                                  )}
                                </div>
                                <CopyToClipboard copyText={x?.baseToken?.address} />
                              </div>
                              <div className="flex justify-between text-sm">
                                <div className="flex text-[#8295B3] dark:text-gray-300">Pair: </div>
                                <div className="text-[#566C90">
                                  {x?.pairAddress?.slice(0, 4)}...
                                  {x?.pairAddress?.slice(x?.pairAddress?.length - 4, x?.pairAddress?.length)}
                                </div>
                                <CopyToClipboard copyText={x?.pairAddress} />
                              </div>
                            </div>
                          </div>
                          <div className="hidden pl-2 md:flex">
                            <div className="flex-col">
                              <div className="flex justify-end text-base">
                                <div className="px-1">${x?.priceUsd}</div>
                                {x.priceChange?.h1 > 0 && (
                                  <div className="flex items-center rounded-lg bg-gradient-to-r from-[#24C083] to-[#56E8AF] px-2 text-xs text-white">
                                    <ChevronUpIcon className="h-5 w-5 items-center justify-center" />
                                    {x?.priceChange?.h1}%
                                  </div>
                                )}
                                {x?.priceChange?.h1 < 0 && (
                                  <div className="flex items-center rounded-lg bg-gradient-to-r from-[#FF0000] to-[#FF8A8A] px-2 text-xs text-white">
                                    <ChevronDownIcon className="h-5 w-5 items-center justify-center" />
                                    {x.priceChange?.h1}%
                                  </div>
                                )}
                                {x?.priceChange?.h1 == 0 && (
                                  <div className="flex items-center rounded-lg bg-gray-300 px-2 text-xs text-white">
                                    <MinusIcon className="h-5 w-5 items-center justify-center" />
                                    {x?.priceChange?.h1}%
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-1/4 flex-col px-2 md:hidden">
                          <div className="flex-col">
                            <div className="mt-1 flex justify-end py-1 md:text-xl">
                              <div className="px-1">${x?.priceUsd}</div>
                              {x.priceChange?.h1 > 0 && (
                                <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-[#24C083] to-[#56E8AF] px-2 text-xs text-white">
                                  <ChevronUpIcon className="h-5 w-5 items-center justify-center" />
                                  {x?.priceChange?.h1}%
                                </div>
                              )}
                              {x?.priceChange?.h1 < 0 && (
                                <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-[#FF0000] to-[#FF8A8A] px-2 text-xs text-white">
                                  <ChevronDownIcon className="h-5 w-5 items-center justify-center" />
                                  {x.priceChange?.h1}%
                                </div>
                              )}
                              {x?.priceChange?.h1 == 0 && (
                                <div className="flex w-3/5 items-center justify-center rounded-lg bg-gray-300 px-2 text-xs text-white">
                                  <MinusIcon className="h-5 w-5 items-center justify-center" />
                                  {x.priceChange?.h1}%
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-1 h-fit w-fit items-center rounded-full bg-gradient-to-b from-[#374D77] to-[#7993BD] p-3 px-4 text-center">
                            <Image
                              src={DiamondLogo}
                              className="items-center justify-center text-center"
                              height={20}
                              width={20}
                              fill="black"
                            />
                          </div>
                        </div>
                      </div>
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <div className="py-1">
                              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-[#619FFF]/70 px-4 text-left text-sm font-medium text-white  hover:bg-[#1C76FF] focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 dark:bg-gray-400 hover:dark:bg-gray-500">
                                <span>Expand for additional pool details.</span>
                                <ChevronDownIcon
                                  className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-white`}
                                />
                              </Disclosure.Button>
                            </div>
                            <Disclosure.Panel>
                              <div className="justify-between text-xs font-light md:flex">
                                <div className="flex-col p-2">
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Total liquidity:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">
                                      ${utils.commify(parseFloat(x?.liquidity?.usd).toFixed(2))}
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Daily volume:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">
                                      ${utils.commify(x?.volume?.h24)}
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">
                                      Pooled {x?.quoteToken?.symbol}:
                                    </div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">{x?.liquidity?.quote}</div>
                                  </div>
                                </div>
                                <div className="flex-col p-2">
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">
                                      Pooled {x?.baseToken?.symbol}:
                                    </div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">{x?.liquidity?.base}</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Holders:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">-</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Total tx:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">-</div>
                                  </div>
                                </div>
                                <div className="flex-col p-2">
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Total Market Cap:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">${x?.fdv}</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Price 24hr Change:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">{x?.priceChange?.h24}%</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-[#8295B3] dark:text-gray-300">Price 1m Change:</div>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <div className="text-[#566C90] dark:text-white">-</div>
                                  </div>
                                </div>
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    </div>
                  </div>
                ))
              )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LPPoolInfo
