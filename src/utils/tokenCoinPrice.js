import { BigNumber } from 'ethers'

const qs = require('qs')

export const convertTokenPrice = async (
  token,
  symbol,
  setTokenPrice,
  chainId,
  moralis,
  setNativePrice,
  setUsdPrice
) => {
  const query = new URLSearchParams({
    auth_key: process.env.NEXT_PUBLIC_UNMARSHAL_API,
  }).toString()

  let searchToken = ''

  if (moralis) {
    searchToken = token

    let moralisChain = ''

    if (chainId == '1') {
      moralisChain = 'eth'
    }

    if (chainId == '5') {
      moralisChain = 'goerli'
    }

    if (chainId == '56') {
      moralisChain = 'bsc'
    }

    if (chainId == '42161') {
      moralisChain = 'arbitrum'
    }

    const options = {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API },
    }

    const moralisResp = await fetch(
      `https://deep-index.moralis.io/api/v2/erc20/${searchToken}/price?chain=${moralisChain}`,
      options
    )

    const moralisData = await moralisResp.json()

    console.log('if moralis --- moralisData === ', moralisData)

    let moralisUsdTokenPrice = moralisData?.usdPrice?.toFixed(18)

    let moralisNativeTokenPrice = moralisData?.nativePrice

    setNativePrice(moralisNativeTokenPrice)

    setUsdPrice(moralisUsdTokenPrice)
  } else if (!moralis && token == '') {
    searchToken = symbol?.toString()

    let cgTokenPrice = ''

    const resp = await fetch(`https://api.unmarshal.com/v1/pricestore/${searchToken}?${query}`, { method: 'GET' })

    const data = await resp.json()

    console.log('if no --- data === ', data)

    if (data[0]?.price?.toString() == '0' || data?.message == 'Limit Exceeded') {
      // fetch the current swap price according to currently connected chain
      const cgResponse = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum`)

      const tokenInfoJSON = await cgResponse.json()

      cgTokenPrice = tokenInfoJSON?.market_data?.current_price?.usd
    }

    if (setTokenPrice != '') {
      let priceToSet =
        data[0]?.price?.toString() != '0' && data?.message != 'Limit Exceeded'
          ? data[0]?.price?.toString()
          : cgTokenPrice
      setTokenPrice(priceToSet)
    }
  } else {
    searchToken = token

    let unmarshalchain = ''
    let moralisChain = ''
    let moralisTokenPrice = ''

    if (chainId == '1') {
      unmarshalchain = 'ethereum'
      moralisChain = 'eth'
    }

    if (chainId == '5') {
      moralisChain = 'goerli'
    }

    if (chainId == '56') {
      moralisChain = 'bsc'
    }

    if (chainId == '42161') {
      unmarshalchain = 'arbitrum'
      moralisChain = 'arbitrum'
    }

    const resp = await fetch(
      `https://api.unmarshal.com/v1/pricestore/chain/${unmarshalchain}/${searchToken}?${query}`,
      { method: 'GET' }
    )

    const data = await resp?.json()

    if (data.price?.toString() == '0' || data?.message == 'Limit Exceeded') {
      const options = {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API },
      }

      const moralisResp = await fetch(
        `https://deep-index.moralis.io/api/v2/erc20/${searchToken}/price?chain=${moralisChain}`,
        options
      )

      const moralisData = await moralisResp.json()

      moralisTokenPrice = moralisData?.usdPrice?.toFixed(18)
    }

    if (setTokenPrice != '') {
      let priceToSet =
        data.price?.toString() != '0' && data?.message != 'Limit Exceeded' ? data.price?.toString() : moralisTokenPrice
      setTokenPrice(priceToSet)
    }
  }

  return
}
