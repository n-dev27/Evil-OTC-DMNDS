import React from 'react'
import { Tab } from '@headlessui/react'
import SellTokenOptions from './sellTokenComponents/SellTokenOptions'
import SellNFTOptions from './sellNFTComponents/SellNFTOptions'

const style = {
  wrapper: 'flex justify-center sm:py-5',
  wrapperWidget: 'flex p-0 justify-center w-[26rem]',
  sellContainer:
    'flex flex-col gap-4 w-full max-w-[568px] h-[calc(100vh-160px)] sm:max-h-[calc(100vh-200px)] sm:h-fit sm:bg-[rgba(22,41,48,0.8)] border-none sm:border-[1.2px] sm:border-solid sm:border-[rgba(255,255,255,0.1)] shadow-[0_6px_20px_0_rgba(0,0,0,0.16)] rounded-[16px] p-0 sm:py-5 sm:px-2',
  sellContainerWidget:
    'w-full bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40 border border-white dark:border-black rounded-3xl p-2',
  sellBody: 'flex flex-col w-full h-full px-4 py-2 sm:px-3 justify-between sm:justify-start overflow-y-auto overflow-x-hidden',
  nav: `w-fit bg-white/70 dark:bg-[#727578]/50 rounded-xl`,
  navItem: ` px-3 md:py-1 items-center text-base md:text-lg text-[#566C90]/50 dark:text-white/50 enabled:hover:bg-[#566C90]/70 enabled:hover:dark:bg-[#d3d7db] enabled:hover:text-[#566B90] enabled:cursor-pointer rounded-xl`,
  activeNavItem: `px-3 md:py-1 items-center shadow-xl text-base md:text-lg bg-[#566C90]/70 dark:bg-[#d3d7db] text-white dark:text-[black] rounded-xl`,
  warning: 'flex justify-center text-center text-xs text-red-400',
}

function SellLayout(props) {
  return (
    <div className={props.isWidget ? style.wrapperWidget : style.wrapper}>
      <div className={props.isWidget ? style.sellContainerWidget : style.sellContainer}>
        <div className={style.sellBody}>
          <SellTokenOptions />
        </div>
      </div>
    </div>
  )
}

export default SellLayout
