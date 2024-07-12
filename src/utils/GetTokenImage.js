import { useState, useEffect } from 'react'

function GetTokenImage({ token, chain }) {
  const [tokenImage, setTokenImage] = useState('');

  let chainToCheck = 'ethereum'

  if(chain?.id == 42161) {
    chainToCheck = 'arbitrum'
  }

  if (token.length) {
    // fetchTokenImage()
  }

  async function fetchTokenImage() {
    if (!token) {
      return
    }

    // fetch the current swap price according to currently connected chain
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${chainToCheck}/contract/${token}`)

    const tokenInfoJSON = response.json()

    const image = tokenInfoJSON?.image?.large

    if (image?.length) {
      setTokenImage(image)
    } else {
      setTokenImage('bacon')
    }
  }

  return tokenImage
}

export default GetTokenImage
