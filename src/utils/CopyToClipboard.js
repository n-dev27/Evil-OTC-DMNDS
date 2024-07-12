/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react'
import Image from 'next/image'
import { CheckIcon } from '@heroicons/react/20/solid'
import copy_logo from '../assets/copy_logo.svg'

const style = {
  clipboardIcon: `sm:mt-1 items-center justify-center w-4 h-4 sm:w-5 sm:h-5 cursor-pointer`,
}

function CopyToClipboard({ copyText }) {
  const [isCopied, setIsCopied] = useState(false)

  // This is the function we wrote earlier
  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text)
    } else {
      return document.execCommand('copy', true, text)
    }
  }

  // onClick handler function for the copy button
  const handleCopyClick = () => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(copyText)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true)
        setTimeout(() => {
          setIsCopied(false)
        }, 750)
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <div className='flex items-center'>
      {/* Bind our handler function to the onClick button property */}
      <button onClick={handleCopyClick}>
        <span>
          {isCopied ? (
            <div className={style.clipboardIcon}>
              <CheckIcon color='white' className='w-4 h-4' />
            </div>
          ) : (
            <div className={style.clipboardIcon}>
              <Image src={copy_logo} alt='copy_logo' ></Image>
            </div>
          )}
        </span>
      </button>
    </div>
  )
}

export default CopyToClipboard
