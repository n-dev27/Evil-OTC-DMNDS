import React, { useState } from 'react'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import { auth, twAuthentication } from '../../constants/configs/firebaseconfig'
import { signInWithRedirect, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import twitterLogo from '../../assets/twitter.svg'
import disconnectLogo from '../../assets/disconnect.png'

const style = {
  icon: `flex justify-start px-2`,
  walletDisconnect: 'cursor-pointer px-1',
  walletDisconnectIcon: 'flex items-center justify-center w-2 h-2 md:w-4 md:h-4',
  twitterLogonButton:
    'disabled:bg-[#C6CCD6] dark:disabled:bg-[#C6CCD6] bg-[#619FFF] hover:bg-[#1C76FF] dark:bg-gray-400 dark:hover:bg-gray-500 w-full my-2 rounded-3xl py-1 px-4 text-xl text-white font-semibold flex items-center justify-center',
}

const TwitterLogin = props => {
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false)

  const [twitterUser, setTwitterUser] = useState(null)

  onAuthStateChanged(auth, user => {
    if (user) {
      setIsTwitterAuthenticated(true)
      props.setIsTwitterAuthenticated(true)
      setTwitterUser(user)
      props.setTwitterUser(user)
      console.log(user)
    } else {
      // User is signed out
    }
  })

  const login = async provider => {
    if (isMobile) {
      const result = await signInWithRedirect(auth, provider)
        .then(re => {
          console.log(re)
          setIsTwitterAuthenticated(true)
          props.setIsTwitterAuthenticated(true)
          setTwitterUser(re.user)
          props.setTwitterUser(re.user)
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      const result = await signInWithPopup(auth, provider)
        .then(re => {
          console.log(re)
          setIsTwitterAuthenticated(true)
          props.setIsTwitterAuthenticated(true)
          setTwitterUser(re.user)
          props.setTwitterUser(re.user)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  const logout = async () => {
    const result = await signOut(auth)
    setIsTwitterAuthenticated(false)
    props.setIsTwitterAuthenticated(false)
    setTwitterUser(null)
    props.setTwitterUser(null)
    console.log(result)
  }

  return (
    <div>
      {isTwitterAuthenticated ? (
        <div className="flex items-center rounded-3xl bg-blue-500 p-1">
          <div className="flex items-center">
            <div className={style.icon}>
              <Image
                className="rounded-full"
                src={twitterUser?.photoURL}
                alt="twitter user"
                height={35}
                width={35}
              ></Image>
            </div>
            <div className="flex-col px-1 text-white">
              <div className="flex justify-start text-sm">{twitterUser?.displayName}</div>
              <div className="hidden justify-start text-xs text-blue-900 md:flex">
                <a
                  href={'https://twitter.com/' + twitterUser?.reloadUserInfo.screenName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{twitterUser?.reloadUserInfo.screenName}
                </a>
              </div>
            </div>
          </div>
          <button className={style.walletDisconnect} onClick={() => logout()}>
            <div className={style.walletDisconnectIcon}>
              <Image src={disconnectLogo} alt="disconnect" height={15} width={15}></Image>
            </div>
          </button>
        </div>
      ) : (
        <button className={style.twitterLogonButton} onClick={() => login(twAuthentication)}>
          <div className={style.icon}>
            <Image src={twitterLogo} alt="twitter logo" height={25} width={25}></Image>
          </div>
          <p>Twitter Logon</p>
        </button>
      )}
    </div>
  )
}

export default TwitterLogin
