/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useState } from 'react'
import { utils } from 'ethers'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

const style = {
  validAddress: `cursor-pointer text-[#F8FAFC] items-center justify-center w-4 h-4`,
  inValidAddress: `cursor-pointer text-[#F8FAFC] items-center justify-center w-4 h-4`,
}

function IsAddressValid({ recipientAddress, setIsRecipientAddressValid }) {
  const [isValid, setIsValid] = useState(false)

  function isValidAddress(adr) {
    if (utils.isAddress(adr)) {
      setIsRecipientAddressValid(true)
      setIsValid(true)
      return true
    } else {
      setIsRecipientAddressValid(false)
      setIsValid(false)
      return false
    }
  }

  useEffect(() => {
    isValidAddress(recipientAddress)
  }, [recipientAddress])

  return (
    <>
      {isValid ? <CheckIcon className={style.validAddress} /> : <XMarkIcon className={style.inValidAddress} />}
    </>
  )
}

export default IsAddressValid
