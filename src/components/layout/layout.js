import React, { createContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Drawer,
  Button,
} from "@material-tailwind/react";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import MainNavigation from './MainNavigation';
import Widget from '../../pages/widget';
import ic_history from '../../assets/ic_history.svg';
import ic_buy from '../../assets/ic_buy.svg';
import ic_sell from '../../assets/ic_sell.svg';
import ic_pending from '../../assets/ic_pending.svg';
import ETH_LOGO from '../../assets/ethLogo.png';
import BNB_LOGO from '../../assets/chain/Chain56.svg';
import AVA_LOGO from '../../assets/chain/Chain43114.svg';
import BASE_LOGO from '../../assets/chain/Chain8453.svg';
import POLYGON_LOGO from '../../assets/chain/Chain137.svg';
import ARB_LOGO from '../../assets/chain/Chain42161.svg';

export const LayoutContext = createContext();

export const chains = [
  { name: 'ETHEREUM', logo: ETH_LOGO },
  { name: 'BASE', logo: BASE_LOGO },
  { name: 'ARBITRUM', logo: ARB_LOGO },
  { name: 'AVALANCHE', logo: AVA_LOGO },
  { name: 'BNB CHAIN', logo: BNB_LOGO },
  { name: 'POLYGON', logo: POLYGON_LOGO },
  { name: 'All Chain', logo: '' },
];

const CustomDrawer = styled('div')`
  & > .absolute {
    z-index: 100;
    opacity: 0.4 !important;
  }
`

function Layout(props) {
  const router = useRouter();

  const [allDataList, setAllDataList] = useState([]);
  const [favValues, setFavValues] = useState('');
  const [isBuyMobile, setIsBuyMobile] = useState(false);
  const [isFavMobile, setIsFavMobile] = useState(false);
  const [isChartMobile, setIsChartMobile] = useState(false);
  const [token, setToken] = useState('');
  const [chainValue, setChainValue] = useState('');
  const [filteredChains, setFilteredChains] = useState(chains);
  const [showButton, setShowButton] = useState(false);
  const [selectedOne, setSelectedOne] = useState(false);
  const [routerPath, setRouterPath] = useState(false);
  const [hotButtonFlag, setHotButtonFlag] = useState(0);
  const [tokenListFlag, setTokenListFlag] = useState(false);
  const [poolListFlag, setPoolListFlag] = useState(false);
  const [chainTokenPrice, setChainTokenPrice] = useState('1350.022813289872815406562403503535');
  const [chainFlag, setChainFlag] = useState(false);
  const [chainKey, setChainKey] = useState('All Chain');

  const onSearchChange = (event) => {
    const query = event.target.value;
    
    // Only proceed if the input contains alphabetical characters
    if (/^[a-zA-Z]*$/.test(query)) {
      setChainValue(query);
      const filtered = chains.filter(chain => chain.name.toLowerCase().includes(query.toLowerCase()));
      setFilteredChains(filtered);
    }
  };

  const handleChainClick = (chainName) => {
    setChainKey(chainName);
    setChainFlag(false);
    setFilteredChains(chains);
    setChainValue('');
  }

  return (
    <LayoutContext.Provider value={{ chainKey, setChainKey, chainFlag, setChainFlag, allDataList, setAllDataList, favValues, setFavValues, chainTokenPrice, setChainTokenPrice, tokenListFlag, setTokenListFlag, poolListFlag, setPoolListFlag, isBuyMobile, setIsBuyMobile, isFavMobile, setIsFavMobile, isChartMobile, setIsChartMobile, token, setToken, showButton, setShowButton, selectedOne, setSelectedOne, routerPath, setRouterPath, hotButtonFlag, setHotButtonFlag}}>
      {router.pathname != '/widget' ?
        <div className="h-screen bg-cover bg-top bg-[url('../assets/BG.svg')] bg-no-repeat overflow-hidden">
          {!chainFlag ? (<></>) : (
            <CustomDrawer>
              <Drawer 
                open={chainFlag} 
                onClose={() => setChainFlag(false)} 
                className="customHeight_drawer rounded-[20px] bg-[rgba(22,41,48,1)] z-[100] fixed top-2 p-4 border sm:border-2 border-[rgba(255,255,255,0.1)] border-solid shadow-[0_12px_24px_0_rgba(0,0,0,0.16)]"
              >
                <form className="mb-6 flex w-full items-center justify-center">
                  <input
                    type="search"
                    id="token-search"
                    value={chainValue}
                    onChange={onSearchChange}
                    className="customShare font-[Inter] text-sm text-[rgba(255,255,255,0.6)] w-full py-2 pl-[40px] pr-4 focus:outline-none focus:ring-transparent block rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] outline-none"
                    placeholder="Search Chain"
                  />
                  <div className="absolute left-[7%] text-[#1B75FF]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" data-slot="icon" className="w-4 h-4 text-[rgba(255,255,255,0.2)]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                </form>
                <div className="w-full gap-4 grid grid-cols-3">
                  {filteredChains.map((chain, index) => (
                    <Button key={index} className={`flex flex-col gap-4 justify-center items-center bg-opacity-0 hover:bg-[rgba(255,255,255,0.1)] cursor-pointer`}
                      onClick={() => handleChainClick(chain.name)}
                    >
                      {chain.name !== 'All Chain' && <Image src={chain.logo} alt={`${chain.name.toLowerCase()}_logo`} className='w-6 h-6'></Image>}
                      {chain.name === 'All Chain' && <p className='font-[Inter] text-sm text-white tracking-widest'>. . .</p>}
                      <p className='font-[Inter] text-xs tracking-widest text-white'>{chain.name}</p>
                    </Button>
                  ))}
                </div>
              </Drawer>
            </CustomDrawer>
          )}
          <div className='customBorder customShare h-[calc(100vh-82px)] sm:h-[calc(100vh-40px)] m-1 sm:m-5 bg-[rgba(22,41,48,0.8)] sm:bg-[rgba(22,41,48,0.5)] rounded-lg sm:rounded-xl '>
            <div className={`${isBuyMobile ? '' : 'z-40'} sticky top-0`}>
              <MainNavigation />
            </div>
            <div className="h-[calc(100vh-146px)] sm:h-[calc(100vh-156px)] bg-contain bg-center bg-no-repeat">
              {props.children}
            </div>
          </div>
          <div className='relative z-40 flex items-center m-1 lg:hidden h-[70px] bg-[rgba(22,41,48,0.8)] rounded-lg border border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]'>
            <Link
              href='/history'
              className={`${router.pathname === '/history' ? 'bg-[rgba(255,255,255,0.05)]' : ''} w-1/4 h-full flex flex-col gap-2 justify-center items-center hover:bg-[rgba(255,255,255,0.2)] hover:rounded-l-lg cursor-pointer`}
              onClick={() => {
                setRouterPath('history');
              }}
            >
              <Image src={ic_history} alt='ic_history' ></Image>
              <span className='text-[rgba(255,255,255,0.4)] text-xs font-[Inter]'>History</span>
            </Link>
            <Link
              href='/buy'
              className={`${router.pathname === '/buy' ? 'bg-[rgba(255,255,255,0.05)]' : ''} w-1/4 h-full flex flex-col gap-2 justify-center items-center hover:bg-[rgba(255,255,255,0.2)] cursor-pointer`}
              onClick={() => {
                setRouterPath('buy');
              }}
            >
              <Image src={ic_buy} alt='ic_buy' ></Image>
              <span className='text-[rgba(255,255,255,0.4)] text-xs font-[Inter]'>Buy</span>
            </Link>
            <Link
              href='/sell'
              className={`${router.pathname === '/sell' ? 'bg-[rgba(255,255,255,0.05)]' : ''} w-1/4 h-full flex flex-col gap-2 justify-center items-center hover:bg-[rgba(255,255,255,0.2)] cursor-pointer`}
              onClick={() => {
                setRouterPath('sell');
              }}
            >
              <Image src={ic_sell} alt='ic_sell' ></Image>
              <span className='text-[rgba(255,255,255,0.4)] text-xs font-[Inter]'>Sell</span>
            </Link>
            <Link
              href='/pending'
              className={`${router.pathname === '/pending' ? 'bg-[rgba(255,255,255,0.05)]' : ''} w-1/4 h-full flex flex-col gap-2 justify-center items-center hover:bg-[rgba(255,255,255,0.2)] hover:rounded-r-lg cursor-pointer`}
              onClick={() => {
                setRouterPath('pending');
              }}
            >
              <Image src={ic_pending} alt='ic_pending' ></Image>
              <span className='text-[rgba(255,255,255,0.4)] text-xs font-[Inter]'>Pending</span>
            </Link>
          </div>
        </div>
        :
        null
      }
      {router.pathname == '/widget' ?
        <div className="bg-gradient-to-b from-[#8295B3]/20 to-[#8295B3]/0 dark:bg-gradient-to-b dark:from-slate-800/20 dark:to-slate-800/0">
          <div className="bg-contain bg-center bg-no-repeat">
            <Widget />
          </div>
        </div>
        :
        null
      }
    </LayoutContext.Provider>
  )
}
export default Layout
