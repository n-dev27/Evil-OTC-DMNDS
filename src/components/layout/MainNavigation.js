import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import diamondswapLogo from '../../assets/doctor_logo.svg';
import smallDMNDSLogo from '../../assets/Doctor.svg';
import WalletInfo from '../walletComponents/WalletInfo';
import SelectWalletModal from '../walletComponents/SelectWalletModal';
import { LayoutContext } from './layout';

const style = {
  wrapper: `w-full flex justify-between justify-center lg:justify-between items-center p-4 sm:p-8`,
  banner: `bg-yellow-400 text-center text-sm md:text-xl font-bold text-white`,
  headerLogo: `flex md:w-1/4 items-center justify-start`,
  nav: `hidden llg:flex justify-center items-center w-fit`,
  navItemsContainer: `hidden sm:flex justify-center items-center w-fit gap-1`,
  mobileNavItemsContainer: `flex sm:hidden justify-between sm:justify-center items-center w-full llg:w-fit lp:gap-x-24`,
  HPNavItem: `min-w-[140px] flex justify-center items-center text-[rgba(255,255,255,0.5)] text-lg font-medium font-[Inter] py-3 hover:bg-[rgba(28,118,255,0.2)] rounded-full`,
  MNavItem: `h-8 sm:h-12 bg-[#2C354A] rounded-xl px-[30px] ssm:px-12 flex items-center justify-center text-xs ssm:text-base text-[rgba(255,255,255,0.5)] font-bold`,
  activeNavItem: ` bg-[rgba(70,147,163,1)] hover:bg-[rgba(70,147,163,0.8)] !text-[rgba(255,255,255,0.8)]`,
  endContainer: `flex w-fit sm:w-[262px] h-8 sm:h-full justify-end items-center`,
  mobile: `mxl:hidden absolute bg-[#E6ECF2] dark:bg-[#727578] rounded-3xl`,
  mobileIcon: `justify-center items-center p-2 hover:bg-[#dbd7d7] rounded-3xl`,
  mobileNavContainer: `flex-col p-2 bg-[#E6ECF2] dark:bg-[#727578] justify-center rounded-3xl absolute left-[-4.3rem] top-[2rem]`,
  mobileNavItem: `px-2 py-2 justify-center items-center drop-shadow-md text-[#566C90] dark:text-[black] hover:bg-[#dbd7d7] hover:text-[#566B90] text-[1.0rem] cursor-pointer rounded-xl`,
  activeMobileNavItem: `px-2 py-2 justify-center items-center drop-shadow-lg text-lg font-medium bg-[#F4F9FF] dark:bg-[#d3d7db] text-[#566B90] dark:text-[black] text-[1.0rem] rounded-xl`,
  buttonsContainer: `flex items-center justify-center`,
  button: `flex items-center drop-shadow-lg bg-[#619FFF] hover:bg-[#1C76FF] rounded-2xl mx-2 text-[0.9rem] cursor-pointer rounded-xl`,
  themeIcon: `hidden xxxl:flex justify-between items-center`,
  buttonPadding: `p-2 text-[white] text-[0.9rem]`,
  buttonTextContainer: `h-8 flex items-center`,
  buttonIconContainer: `flex items-center justify-center w-8 h-8`,
}

function MainNavigation() {
  const router = useRouter();
  const { query } = router;
  const { isConnected } = useAccount();

  const { setSelectedOne, setRouterPath } = useContext(LayoutContext);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedNav, setSelectedNav] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const renderThemeChanger = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme

    if (currentTheme === 'dark') {
      return <SunIcon className="h-6 w-6 text-yellow-400 " role="button" onClick={() => setTheme('light')} />
    } else {
      return <MoonIcon className="h-6 w-6 text-[#354B75] " role="button" onClick={() => setTheme('dark')} />
    }
  }

  return (
    <>
      <div className={style.wrapper}>
        <title>DIAMOND SWAP</title>
        <div className='flex justify-between z-10'>
          <Link href="/">
            <Image src={diamondswapLogo} alt="diamondswap" className='flex llg:hidden xl:flex w-[100px] h-8 sm:w-[233px] sm:h-[46px]'/>
            <Image src={smallDMNDSLogo} alt="diamondswap" className='hidden llg:flex xl:hidden w-10 h-10'/>
          </Link>
        </div>
        <div className={style.nav}>
          <div className={style.navItemsContainer}>
            <Link href="/history">
              <button
                onClick={() => {
                  setSelectedNav('txhistory');
                  setRouterPath('history');
                }}
                className={style.HPNavItem + (router.pathname == '/history' ? style.activeNavItem : '')}
              >
                History
              </button>
            </Link>
            <Link href="/buy">
              <button
                onClick={() => {
                  setSelectedNav('buy');
                  setRouterPath('buy');
                }}
                className={style.HPNavItem + (router.pathname == '/buy' ? style.activeNavItem : '')}
              >
                Buy
              </button>
            </Link>
            <Link href="/sell">
              <button
                onClick={() => {
                  setSelectedNav('sell');
                  setRouterPath('sell');
                }}
                className={style.HPNavItem + (router.pathname == '/sell' ? style.activeNavItem : '')}
              >
                Sell
              </button>
            </Link>
            <Link href="/pending">
              <button
                onClick={() => {
                    setSelectedNav('txhistory');
                    setSelectedOne(false);
                    setRouterPath('pending');
                  }
                }
                className={style.HPNavItem + (router.pathname == '/pending' ? style.activeNavItem : '')}
              >
                Pending
              </button>
            </Link>
          </div>
          <div className={style.mobileNavItemsContainer}>
            <Link href="/history">
              <button
                onClick={() => setSelectedNav('txhistory')}
                className={style.HPNavItem + (router.pathname == '/history' ? style.activeNavItem : ' border border-[#334155]') + ' pl-[36px] md:px-9'}
              >
                  <ArrowLeftIcon className='absolute left-[10%]' width={'18px'} height={'18px'}/>
                <p>History</p>
              </button>
            </Link>
            <Link href="/buy">
              <button
                onClick={() => setSelectedNav('buy')}
                className={style.MNavItem + (router.pathname == '/buy' ? style.activeNavItem : '')}
              >
                <p>Buy</p>
              </button>
            </Link>
            <Link href="/sell">
              <button
                onClick={() => setSelectedNav('sell')}
                className={style.MNavItem + (router.pathname == '/sell' ? style.activeNavItem : '')}
              >
                <p>Sell</p>
              </button>
            </Link>
            <Link href="/pending">
              <button
                onClick={() => {
                    setSelectedNav('txhistory');
                    setSelectedOne(false);
                  }
                }
                className={style.HPNavItem + (router.pathname == '/pending' ? style.activeNavItem : ' border border-[#334155]') + ' pl-5 md:px-9'}
              >
                <ArrowRightIcon className='absolute right-[10%]' width={'18px'} height={'18px'}/>
                <p>Pending</p>
              </button>
            </Link>
          </div>
        </div>
        <div className={style.endContainer}>
          <div className={style.buttonsContainer}>{!isConnected ? <SelectWalletModal /> : <WalletInfo />}</div>
          {/* <div className='relative flex mxl:hidden min-w-[27px]'>
            <Image src={mobileIcon} alt="mobileIcon" height={18} onClick={() => setShowMobileMenu(!showMobileMenu)}/>

            <div className={style.mobile}>
              <div className={' mxl:hidden ' + (showMobileMenu ? '' : 'hidden')}>
                <div className={style.mobileNavContainer}>
                  <Link href="/history">
                      <div
                        onClick={() => {
                          setShowMobileMenu(!showMobileMenu)
                        }}
                        className={style.mobileNavItem + (router.pathname == '/history' ? style.activeMobileNavItem : '')}
                      >
                        <p>History</p>
                      </div>
                  </Link>
                  <Link href="/buy">
                    <div
                      onClick={() => {
                        setShowMobileMenu(!showMobileMenu)
                      }}
                      className={style.mobileNavItem + (router.pathname == '/buy' ? style.activeMobileNavItem : '')}
                    >
                      <p>Buy</p>
                    </div>
                  </Link>
                  <Link href="/sell">
                    <div
                      onClick={() => {
                        setShowMobileMenu(!showMobileMenu)
                      }}
                      className={style.mobileNavItem + (router.pathname == '/sell' ? style.activeMobileNavItem : '')}
                    >
                      <p>Sell</p>
                    </div>
                  </Link>
                  <Link href="/pending">
                      <div
                        onClick={() => {
                          setShowMobileMenu(!showMobileMenu);
                          setSelectedOne(false);
                        }}
                        className={style.mobileNavItem + (router.pathname == '/pending' ? style.activeMobileNavItem : '')}
                      >
                        <p>Pending</p>
                      </div>
                  </Link>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  )
}

export default MainNavigation
