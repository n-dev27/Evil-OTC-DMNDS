import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image';
import Switch from 'react-switch';
import { useNetwork, useBalance, useAccount } from 'wagmi'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import SearchedTokenPools from './SearchedTokenPools'
import AllPublicPools from './AllPublicPools'
import CopyToClipboard from '../../utils/CopyToClipboard.js'
import { convertTokenPrice } from '../../utils/tokenCoinPrice'
import NotificationModal from './NotificationModal.js'
import { LayoutContext } from "../layout/layout";
import { createList, deleteList, getOneList } from '../../services/favListServices.js'
import { getTokenMeta, getTokenPair, getTokenPrice2 } from '../../services/tokenInfoServices.js'
import { countLeadingZerosAfterDecimal } from '../../utils/countDecimals.js';
import { chains } from '../layout/layout';
import star_1 from '../../assets/star_1.svg';
import star_2 from '../../assets/star_2.svg';

const style = {
  content: 'flex justify-center',
}

// export async function getTokenInfo(token) {
//   if (!token) return;

//   // fetch the current swap price according to currently connected chain
//   let response;
//   try {
//     response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       }
//     });

//     if (response.ok) {
//       const tokenInfoJSON = await response.json();
//       const pairs = tokenInfoJSON?.pairs;
//       if (!pairs) return null;

//       const filteredPairs = pairs?.filter(pair => pair?.quoteToken?.symbol?.includes('WETH'));
//       return filteredPairs;    
//     } else {
//       throw new Error('Failed to fetch token paris');
//     }
//   } catch (error) {
//     console.error('Error fetching token info:', error);
//     return null;
//   }
// }

const PoolSearch = (props) => {
  const { chain } = useNetwork()
  let chainToCheck = 'ethereum'

  if (chain?.id == 42161) {
    chainToCheck = 'arbitrum'
  }

  const { address } = useAccount()
  const { data: chainData } = useBalance({
    address: address,
  })
  const { chainKey, setChainKey, chainFlag, setChainFlag, token, setToken, tokenListFlag, chainTokenPrice, setChainTokenPrice, isBuyMobile } = useContext(LayoutContext);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPairs, setTokenPairs] = useState();
  const [tokenImage, setTokenImage] = useState('');
  const [nativeTokenPrice, setNativeTokenPrice] = useState('5000000');
  const [usdTokenPrice, setUsdTokenPrice] = useState('0.0000001159174312');
  const [favFlag, setFavFlag] = useState(false);
  const [poolOption, setPoolOption] = useState(true);
  const [filterFlag, setFilterFlag] = useState(false);

  async function getTokenImage() {
    if (!token) return

    try {
      // Fetch the current swap price according to the currently connected chain
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${chainToCheck}/contract/${token}`);

      if (!response.ok) {
        // If the response is not OK, throw an error
        throw new Error(`API request failed with status ${response.status}`);
      }

      const tokenInfoJSON = await response.json();

      const image = tokenInfoJSON?.image?.large;

      if (image?.length) {
        return setTokenImage(image);
      } else {
        return '/App_Logo.png';
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      // Handle the error as needed, e.g., by setting a default image or skipping the item
      return '/App_Logo.png';
    }
  }

  async function getTokenPrice() {
    if (chain?.id != (42161 || 1 || 5 || 56 || 137 || 97 || 80001)) {
      return
    } else {
      {
        convertTokenPrice(token, '', '', chain?.id.toString(), true, setNativeTokenPrice, setUsdTokenPrice)
      }
      // {
      //   convertTokenPrice('', chainData?.symbol, setChainTokenPrice, chain?.id.toString(), false, '', '')
      // }
    }
  }

  const fetchData = async () => {
    const favList = await getOneList(address);
    if (favList) {
      props.setFavArray(favList?.data.data)
      if (token.length) {
        setIsLoading(true);
        const tokenPairInfo = await getTokenPair(token);

        // Get token logo from API
        const tokenInfo = await getTokenMeta(token)
        if (tokenInfo?.data) {
          setTokenImage(tokenInfo?.data[0].logo)
        } else {
          setTokenImage('/App_Logo.png')
        }
        console.log('tokenPairInfo === ', tokenPairInfo)

        if (tokenPairInfo?.data?.length !== 0 && tokenPairInfo?.data) {
          setTokenPairs(tokenPairInfo?.data);
          if (favList?.data.data?.token_list.length === 0) {
            setFavFlag(false);
          } else {
            const index = favList?.data?.data?.token_list.map(item => item.toLowerCase() === tokenPairInfo?.data[0]?.baseToken.address.toLowerCase())
            setFavFlag(index.length === 0 ? false : true);
          }
          setIsLoading(false);
        } else {
          setTokenPairs('');
          setIsLoading(false);
        }

        const tokenPrice = await getTokenPrice2('ETH');
        setChainTokenPrice(tokenPrice?.data?.ETH?.USD)
        getTokenPrice();
      } else {
        setToken('')
        setTokenImage('')
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, [token, chain, isBuyMobile, tokenListFlag])

  useEffect(() => {
    if (props.tokenAddress?.length > 0) {
      setToken(props.tokenAddress)
    }
  }, [props.tokenAddress])

  const handleTokenFav = async() => {
    if (favFlag === false) {
      const data = {
        userWalletAddr: address,
        tokenAddr: token,
        poolAddr: ''
      }
      const response = await createList(data);
      console.log('create response == ', response);
    } else {
      const response = await deleteList(address, token, '')
      console.log('delete response == ', response)
    }
    setFavFlag(!favFlag);

    // Fetch the updated list after delete/create operation
    const favList = await getOneList(address);
    props.setFavArray(favList?.data.data)
  };

  const handleAllChains = () => {
    setChainFlag(!chainFlag);
  }

  return (
    <div className={style.content}>
      <div className="flex w-full justify-center">
        <div className="w-full">
          <div className="flex flex-col lp:flex-row justify-center px-4 pt-5 pb-1 lp:px-8 text-center lp:gap-5">
            <form className="flex w-full items-center justify-center">
              <label htmlFor="token-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <div className="flex items-center">
                  <input
                    type="search"
                    id="token-search"
                    value={token}
                    onChange={event => {
                      console.log('event === ', event.target.value)
                      setToken(event.target.value)
                    }}
                    className="customShare font-[Inter] text-sm sm:text-lg text-[rgba(255,255,255,0.6)] w-full py-3 sm:py-4 pl-12 sm:pl-[72px] pr-3 sm:pr-5 focus:outline-none focus:ring-transparent block rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] outline-none"
                    placeholder="Search token"
                  />
                  <div className="absolute left-[4%] text-[#1B75FF]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" data-slot="icon" className="w-4 h-4 sm:w-6 sm:h-6 text-[rgba(255,255,255,0.2)]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </form>
            <div className={`hidden lp:flex items-center justify-between min-w-[408px]`}>
              <div className={`${poolOption ? 'text-[rgba(255,255,255,0.4)]' : 'text-[rgba(255,255,255,0.6)]'} font-[Inter] text-base`}>
                Buy 1 to 1
              </div>
                <Switch
                  className={`customSwitch ${poolOption === false ? 'checked': 'unchecked'}`}
                  checked={poolOption}
                  onChange={setPoolOption}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  onColor='#1c76ff'
                />
              <div className={`${poolOption ? 'text-[rgba(255,255,255,0.6)]' : 'text-[rgba(255,255,255,0.4)]'} font-[Inter] text-base`}>
                Buy from pool
              </div>
              <button className='min-w-[120px] py-3 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-base font-[Inter] text-[rgba(255,255,255,0.8)]'
                onClick={() => setFilterFlag(!filterFlag)}
              >
                Filter
              </button>
            </div>
            <div className={`flex lp:hidden items-center justify-between w-full pt-3 pb-1`}>
              <div className='flex gap-4 items-center'>
                <div className={`${poolOption ? 'text-[rgba(255,255,255,0.4)]' : 'text-[rgba(255,255,255,0.6)]'} font-[Inter] text-xs sm:text-base`}>
                  Buy 1 to 1
                </div>
                <Switch
                  className={`customSwitch ${poolOption === false ? 'checked': 'unchecked'}`}
                  checked={poolOption}
                  onChange={setPoolOption}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  onColor='#1c76ff'
                />
                <div className={`${poolOption ? 'text-[rgba(255,255,255,0.6)]' : 'text-[rgba(255,255,255,0.4)]'} font-[Inter] text-xs sm:text-base`}>
                  Buy from pool
                </div>
              </div>
              <div className='flex gap-2 items-center'>
                <div className={`${chainKey === 'All Chain' ? 'px-4 py-2 sm:py-3' : 'px-2 py-2 sm:py-3'} flex lg:hidden relative cursor-pointer justify-center items-center gap-2 h-fit rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-xs font-[Inter] text-[rgba(255,255,255,0.8)]`}
                  onClick={() => handleAllChains()}
                >
                  {chainKey !== 'All Chain' && <Image src={chains.filter(chain => chain.name.toLowerCase().includes(chainKey.toLowerCase()))[0].logo} alt={`${chainKey.toLowerCase()}_logo`} className='w-4 h-4 sm:w-6 sm:h-6'></Image>}
                  <p className='hidden ssm:flex sm:hidden md:flex font-[Inter] text-xs tracking-widest text-white'>{chainKey}</p>
                  {chainFlag ? (
                    <ChevronUpIcon className='w-4 h-4 sm:w-5 sm:h-5' />
                  ) : (
                    <ChevronDownIcon className='w-4 h-4 sm:w-5 sm:h-5'/>
                  )}
                </div>
                <button className='customShare min-w-[62px] sm:min-w-[120px] py-2 sm:py-3 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-xs sm:text-base font-[Inter] text-[rgba(255,255,255,0.8)]'
                  onClick={() => setFilterFlag(!filterFlag)}
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className='h-[calc(100vh-320px)] sm:h-full overflow-y-auto'>
            <div className="flex flex-col justify-center">
              <div className='flex'>
                {token && (
                  isLoading ? (
                    <div className="hidden sm:flex justify-center items-center w-full pt-5 px-8">
                      <div className="w-full flex flex-col gap-6 justify-center items-center rounded-xl animate-pulse bg-[rgba(255,255,255,0.1)] px-8 py-7 h-[249px]">
                        <div className="flex w-full">
                          <div className="flex pr-7">
                            <div className="w-[80px] h-[80px] bg-slate-400 flex rounded-full text-center">
                            </div>
                          </div>
                          <div className="flex w-full">
                            <div className="w-full flex justify-between">
                              <div className="flex flex-col justify-center gap-1 w-full">
                                  <div className='bg-slate-400 text-slate-400 rounded-full w-[200px] h-5'>
                                  </div>

                                <div className="flex bg-slate-400 rounded-full items-center text-[#B6C8E4] w-[200px] h-5"></div>
                                <div className="flex bg-slate-400 rounded-full items-center text-[#B6C8E4] w-[200px] h-5"></div>
                              </div>
                            </div>
                            <div className="justify-end flex">
                              <div className="flex-col">
                                <div className="flex gap-[6px] justify-end text-white">
                                  <div className="bg-slate-400 rounded-full w-[100px] h-9"></div>
                                    <div 
                                      className="bg-slate-400 flex items-center text-sm p-[6px] via-emerald-500 to-emerald-300 rounded-full w-[52px] h-9"
                                    >
                                    </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col gap-2">
                          <div className="w-full h-[17px] bg-slate-400 rounded-full text-start"></div>
                          <div className="w-full h-[17px] bg-slate-400 rounded-full text-start"></div>
                          <div className="w-full h-[17px] bg-slate-400 rounded-full text-start text-slate-400">text</div>
                        </div>
                      </div>
                    </div>
                    ) : (tokenPairs && tokenPairs.length > 0 && (
                    <div className="hidden sm:flex w-full pt-5 px-8">
                      <div className="w-full flex flex-col gap-6 bg-[rgba(255,255,255,0.05)] py-7 px-8 rounded-xl border border-[rgba(255,255,255,0.1)]">
                        <div className="flex gap-5 w-full h-full items-center">
                          <div className="min-w-[72px] min-h-[72px] flex rounded-full text-center">
                            {tokenImage != '/App_Logo.png' ? (
                              <img
                                src={tokenImage}
                                className="w-[72px] h-[72px] flex items-center justify-center rounded-full text-center"
                              />
                            ) : (
                              <a className="flex bg-gradient-to-b from-[#374D77] to-[#7993BD] items-center justify-center rounded-full text-center text-xs text-white h-[72px] w-[72px]">
                                {tokenPairs[0]?.baseToken?.symbol}
                              </a>
                            )}
                          </div>
                          <div className="flex justify-between w-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex gap-4 items-center text-2xl text-[rgba(255,255,255,0.8)] font-[Inter]">
                                {tokenPairs[0]?.quoteToken?.symbol}/ {tokenPairs[0]?.baseToken?.symbol}
                                <button className={`${favFlag ? 'bg-[rgba(255,216,13,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'} z-20 flex justify-center items-center w-9 h-9 rounded-full cursor-pointer shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                                  onClick={() => handleTokenFav()}
                                >
                                  <Image src={favFlag ? star_1 : star_2} alt='fav_logo' ></Image>
                                </button>
                              </div>

                              <div className='flex flex-col gap-1 pr-4'>
                                <div className="flex justify-between">
                                  <div className="flex items-center text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">
                                    {tokenPairs[0]?.baseToken?.symbol}:
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="text-[rgba(100,116,139,0.64)] text-[14px] font-[Inter]">
                                      {tokenPairs[0]?.baseToken?.address.slice(0, 4)}...
                                      {tokenPairs[0]?.baseToken?.address.slice(
                                        tokenPairs[0]?.baseToken?.address.length - 5,
                                        tokenPairs[0]?.baseToken?.address.length
                                      )}
                                    </div>
                                    <CopyToClipboard copyText={tokenPairs[0]?.baseToken?.address} />
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <div className="flex items-center text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">Pair:</div>
                                  <div className="flex items-center gap-1">
                                    <div className="text-[rgba(100,116,139,0.64)] text-[14px] font-[Inter]">
                                      {tokenPairs[0]?.pairAddress.slice(0, 4)}...
                                      {tokenPairs[0]?.pairAddress.slice(
                                        tokenPairs[0]?.pairAddress.length - 5,
                                        tokenPairs[0]?.pairAddress.length
                                      )}
                                    </div>
                                    <CopyToClipboard copyText={tokenPairs[0]?.pairAddress} />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="flex-col">
                                <div className="flex gap-2 justify-end">
                                  <div className="text-[rgba(255,255,255,0.8)] font-[Abel] text-[28px]">${tokenPairs[0]?.priceUsd}</div>
                                  {tokenPairs[0]?.priceChange?.h1 > 0 && (
                                    <div 
                                      className="rounded-full flex items-center p-2 bg-[rgba(19,171,116,0.1)] border border-[rgba(19,171,116,0.1)] text-[14px] font-[Abel] text-[rgba(19,171,116,0.8)]"
                                    >
                                      <ChevronUpIcon className="h-4 w-4 items-center justify-center" />
                                      {tokenPairs[0]?.priceChange?.h1}%
                                    </div>
                                  )}
                                  {tokenPairs[0]?.priceChange?.h1 < 0 && (
                                    <div 
                                      className="rounded-full flex items-center p-2 bg-[rgba(19,171,116,0.1)] border border-[rgba(19,171,116,0.1)] text-[14px] font-[Abel] text-[rgba(19,171,116,0.8)]"
                                    >
                                      <ChevronDownIcon className="h-4 w-4 items-center justify-center" />
                                      {tokenPairs[0]?.priceChange?.h1}%
                                    </div>
                                  )}
                                  {tokenPairs[0]?.priceChange?.h1 == 0 && (
                                    <div 
                                      className="rounded-full flex items-center p-2 bg-[rgba(19,171,116,0.1)] border border-[rgba(19,171,116,0.1)] text-[14px] font-[Abel] text-[rgba(19,171,116,0.8)]"
                                    >
                                      <div className='flex h-4 w-4 items-center justify-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                          <path d="M4.8261 1.11921C5.07816 0.827486 5.53044 0.827487 5.78251 1.11921L9.71756 5.67343C10.0713 6.08287 9.78047 6.7186 9.23935 6.7186H1.36926C0.828137 6.7186 0.537266 6.08287 0.891048 5.67343L4.8261 1.11921Z" fill="white"/>
                                        </svg>
                                      </div>
                                      {tokenPairs[0]?.priceChange?.h1}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          <div className="w-1/3 flex-col flex gap-2">
                            <div className="flex justify-between">
                              <div className="w-1/2 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">
                                Total liquidity:
                              </div>
                              <div className="w-1/2 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">
                                ${countLeadingZerosAfterDecimal(tokenPairs[0]?.liquidity?.usd)}
                              </div>
                            </div>
                            <div className="flex md:justify-between">
                              <div className="w-1/2 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">Daily volume:</div>
                              <div className="w-1/2 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">
                                ${Number(tokenPairs[0]?.volume?.h24)?.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex md:justify-between">
                              <div className="w-1/2 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">
                                Pooled {tokenPairs[0]?.quoteToken?.symbol}:
                              </div>
                              <div className="w-1/2 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">
                                {Number(tokenPairs[0]?.liquidity?.quote)?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="w-1/3 flex-col flex gap-2">
                            <div className="flex md:justify-between">
                              <div className="w-1/2 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">
                                Pooled {tokenPairs[0]?.baseToken?.symbol}:
                              </div>
                              <div className="w-1/2 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">
                                {Number(tokenPairs[0]?.liquidity?.base)?.toLocaleString()}
                              </div>
                            </div>
                            <div className="hidden md:flex md:justify-between">
                              <div className="w-1/2 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">Holders:</div>
                              <div className="w-1/2 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">-</div>
                            </div>
                            <div className="hidden md:flex md:justify-between">
                              <div className="w-1/2 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">Total tx:</div>
                              <div className="w-1/2 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">-</div>
                            </div>
                          </div>
                          <div className="w-1/3 flex-col flex gap-2">
                            <div className="flex md:justify-between">
                              <div className="w-3/5 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">
                                Total Market Cap:
                              </div>
                              <div className="w-2/5 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">
                                ${Number(tokenPairs[0]?.fdv)?.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex md:justify-between">
                              <div className="w-3/5 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">
                                Price 24hr Change:
                              </div>
                              <div className="w-2/5 text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">{tokenPairs[0]?.priceChange?.h24}%</div>
                            </div>
                            <div className="hidden justify-between md:flex">
                              <div className="w-3/5 text-start text-[rgba(100,116,139,1)] text-[14px] font-[Inter]">Price 1m Change:</div>
                              <div className="w-2/5 text-start text-[rgba(255,255,255,0.6)] text-[14px] font-[Inter]">-</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
              </div>

              {token?.length ? (
                <div className='py-[10px] border-b border-[rgba(100,116,139,0.3)] mx-8'></div>
              ) : <></>}

              <div className='flex sm:hidden'>
                {token && (
                  isLoading ? (
                    <div className="w-full p-4">
                      <div className="flex flex-col gap-1 rounded-2xl animate-pulse bg-[rgba(255,255,255,0.1)] p-7 h-[283px]">
                        <div className="flex flex-col w-full justify-center items-center gap-3">
                          <div className="flex">
                            <div className="w-[56px] h-[56px] bg-slate-400 flex rounded-full text-center">
                            </div>
                          </div>
                          <div className="flex flex-col justify-center items-center w-full">
                            <div className="flex flex-col gap-2 w-full justify-center items-center">
                              <div className="w-[183px] h-[27px] bg-slate-400 rounded-full flex justify-between items-center text-2xl font-roboto gap-5">
                              </div>

                              <div className="w-[118px] h-[28px] bg-slate-400 rounded-full flex gap-[10px] justify-center items-center">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col gap-[2px] items-center">
                          <div className="flex justify-between bg-slate-400 rounded-full w-[243px] h-[20px]">
                          </div>
                          <div className="flex justify-between bg-slate-400 rounded-full w-[243px] h-[20px]">
                          </div>
                          <div className="flex justify-between bg-slate-400 rounded-full w-[243px] h-[20px]">
                          </div>
                          <div className="flex justify-between bg-slate-400 rounded-full w-[243px] h-[20px]">
                          </div>
                          <div className="flex justify-between bg-slate-400 rounded-full w-[243px] h-[20px]">
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (tokenPairs && tokenPairs.length > 0 ? (
                    <div className="w-full p-4">
                      <div className="flex flex-col gap-6 items-center rounded-2xl bg-[rgba(255,255,255,0.05)] py-6 px-8">
                        <div className="flex flex-col w-full justify-center items-center gap-3">
                          <div className="flex">
                            <div className="w-14 h-14 flex rounded-full text-center">
                              {tokenImage != '/App_Logo.png' ? (
                                <img
                                  src={tokenImage}
                                  className="h-14 xs:p-2 flex w-14 items-center justify-center rounded-full text-center"
                                />
                              ) : (
                                <a className="flex h-14 w-14 bg-gradient-to-b from-[#374D77] to-[#7993BD] items-center justify-center rounded-full text-center text-xs text-white">
                                  {tokenPairs[0]?.baseToken?.symbol}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col justify-center items-center w-full">
                            <div className="flex flex-col gap-2 w-full justify-center items-center">
                              <div className="flex justify-between items-center text-2xl font-roboto gap-5">
                                <div>
                                  {tokenPairs[0]?.quoteToken?.symbol + '/' }
                                  <span className='font-bold'>
                                    {tokenPairs[0]?.baseToken?.symbol}
                                  </span>
                                </div>
                                <button className={`${favFlag ? 'bg-[rgba(255,216,13,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'} z-20 flex justify-center items-center w-7 h-7 rounded-full cursor-pointer shadow-[rgba(0,0,0,0.16)] border border-[rgba(255,255,255,0.1)]`}
                                  onClick={() => handleTokenFav()}
                                >
                                  <Image src={favFlag ? star_1 : star_2} alt='fav_logo' ></Image>
                                </button>
                              </div>

                              <div className="flex gap-[10px] justify-center items-center">
                                <div className="text-[#24C083] font-bold font-Inter text-xl">${tokenPairs[0]?.priceUsd}</div>
                                {tokenPairs[0]?.priceChange?.h1 > 0 && (
                                  <div 
                                    className="flex gap-1 justify-center items-center text-[10px] font-Inter h-[22px] px-2 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-300 rounded-[10px] border border-white text-white"
                                    style={{boxShadow: "-12.57px 18.86px 25.14px rgba(130, 149, 179, 0.24)"}}
                                  >
                                    <div className='flex items-center justify-center'>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                                        <path id="Polygon 12" d="M1.15737 1.13109C2.07902 0.183041 3.60151 0.183041 4.52317 1.13109C5.96961 2.61896 4.91535 5.1142 2.84027 5.1142C0.765186 5.1142 -0.289073 2.61896 1.15737 1.13109Z" fill="white"/>
                                      </svg>
                                    </div>
                                    {tokenPairs[0]?.priceChange?.h1}%
                                  </div>
                                )}
                                {tokenPairs[0]?.priceChange?.h1 < 0 && (
                                  <div 
                                    className="flex gap-1 justify-center items-center text-[10px] font-Inter h-[22px] px-2 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-300 rounded-[10px] border border-white text-white"
                                    style={{boxShadow: "-12.57px 18.86px 25.14px rgba(130, 149, 179, 0.24)"}}
                                  >
                                    <div className='flex items-center justify-center'>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                                        <path id="Polygon 12" d="M1.15737 1.13109C2.07902 0.183041 3.60151 0.183041 4.52317 1.13109C5.96961 2.61896 4.91535 5.1142 2.84027 5.1142C0.765186 5.1142 -0.289073 2.61896 1.15737 1.13109Z" fill="white"/>
                                      </svg>
                                    </div>
                                    {tokenPairs[0]?.priceChange?.h1}%
                                  </div>
                                )}
                                {tokenPairs[0]?.priceChange?.h1 == 0 && (
                                  <div 
                                    className="flex gap-1 justify-center items-center text-[10px] font-Inter h-[22px] px-2 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-300 rounded-[10px] border border-white text-white"
                                    style={{boxShadow: "-12.57px 18.86px 25.14px rgba(130, 149, 179, 0.24)"}}
                                  >
                                    <div className='flex items-center justify-center'>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                                        <path id="Polygon 12" d="M1.15737 1.13109C2.07902 0.183041 3.60151 0.183041 4.52317 1.13109C5.96961 2.61896 4.91535 5.1142 2.84027 5.1142C0.765186 5.1142 -0.289073 2.61896 1.15737 1.13109Z" fill="white"/>
                                      </svg>
                                    </div>
                                    {tokenPairs[0]?.priceChange?.h1}%
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-col gap-[2px] pl-8">
                          <div className="flex justify-between">
                            <div className="w-1/2 flex justify-start items-center text-white text-sm font-Inter">
                              {tokenPairs[0]?.baseToken?.symbol}:
                            </div>
                            <div className="w-1/2 flex justify-start items-center gap-1">
                              <div className="text-[#94A3B8] text-sm font-Inter">
                                {tokenPairs[0]?.baseToken?.address.slice(0, 4)}...
                                {tokenPairs[0]?.baseToken?.address.slice(
                                  tokenPairs[0]?.baseToken?.address.length - 5,
                                  tokenPairs[0]?.baseToken?.address.length
                                )}
                              </div>
                              <CopyToClipboard copyText={tokenPairs[0]?.baseToken?.address} />
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-1/2 flex justify-start items-center text-white text-sm font-Inter">Pair:</div>
                            <div className="w-1/2 flex justify-start items-center gap-1">
                              <div className="text-[#94A3B8] text-sm font-Inter">
                                {tokenPairs[0]?.pairAddress.slice(0, 4)}...
                                {tokenPairs[0]?.pairAddress.slice(
                                  tokenPairs[0]?.pairAddress.length - 5,
                                  tokenPairs[0]?.pairAddress.length
                                )}
                              </div>
                              <CopyToClipboard copyText={tokenPairs[0]?.pairAddress} />
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-1/2 text-start text-white text-sm font-Inter">
                              Total liquidity:
                            </div>
                            <div className="w-1/2 text-start text-[#94A3B8] text-sm font-Inter">
                              ${countLeadingZerosAfterDecimal(tokenPairs[0]?.liquidity?.usd)}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-1/2 text-start text-white text-sm font-Inter">Daily volume:</div>
                            <div className="w-1/2 text-start text-[#94A3B8] text-sm font-Inter">
                              ${Number(tokenPairs[0]?.volume?.h24)?.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-1/2 text-start text-white text-sm font-Inter">
                              Pooled {tokenPairs[0]?.quoteToken?.symbol}:
                            </div>
                            <div className="w-1/2 text-start text-[#94A3B8] text-sm font-Inter">
                              {Number(tokenPairs[0]?.liquidity?.quote)?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    ) : (
                    <></>
                )))}
              </div>
            </div>

            {token?.length ? (
              <>
                <SearchedTokenPools
                  setIsBuyFlag={props.setIsBuyFlag}
                  setIsChartFlag={props.setIsChartFlag}
                  setIsFavorite={props.setIsFavorite}
                  setIsFavMobile={props.setIsFavMobile}
                  chain={chain}
                  token={token}
                  poolOption={poolOption}
                  tokenPairs={tokenPairs}
                  isConnected={props.isConnected}
                  showShareModal={props.showShareModal}
                  setShowShareModal={props.setShowShareModal}
                  poolInfo={props.poolInfo}
                  setPoolInfo={props.setPoolInfo}
                  setFavArray={props.setFavArray}
                  setSearchToken={setToken}
                  setModalKey={props.setModalKey}
                  tokenImage={tokenImage}
                  data={props.dataList}
                  usdTokenPrice={usdTokenPrice}
                  nativeTokenPrice={nativeTokenPrice}
                  chainTokenPrice={chainTokenPrice}
                  chainSymbol={chainData?.symbol}
                  chainDecimals={chainData?.decimals}/>
                {/* <AllPublicPools address={address} setSearchToken={setToken} formattedPoolsData={props.formattedPoolsData} setFormattedPoolsData={props.setFormattedPoolsData} data={props.dataList} loading={props.loading} setModalKey={props.setModalKey} lpChecked={lpChecked} setLPChecked={setLPChecked}/> */}
              </>
            ) : (
              <AllPublicPools setIsBuyFlag={props.setIsBuyFlag} setIsChartFlag={props.setIsChartFlag} setIsFavorite={props.setIsFavorite} filterFlag={filterFlag} setFavArray={props.setFavArray} setDiscountListing={props.setDiscountListing} poolRouterAddress={props.poolRouterAddress} showShareModal={props.showShareModal} setShowShareModal={props.setShowShareModal} poolInfo={props.poolInfo} setPoolInfo={props.setPoolInfo} isConnected={props.isConnected} address={address} setSearchToken={setToken} formattedPoolsData={props.formattedPoolsData} setFormattedPoolsData={props.setFormattedPoolsData} data={props.dataList} loading={props.loading} setModalKey={props.setModalKey} setPoolOption={setPoolOption} poolOption={poolOption}/>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoolSearch
