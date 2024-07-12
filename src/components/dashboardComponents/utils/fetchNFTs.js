const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API
const endpoint = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`

export const fetchNFTs = async (owner, setAllNFTs, retryAttempt) => {
  if (retryAttempt === 2) {
    return
  }
  if (owner) {
    let data
    try {
      data = await fetch(`${endpoint}/getNFTs?owner=${owner}&filters[]=SPAM&filters[]=AIRDROPS`).then(data =>
        data.json()
      )
    } catch (e) {
      fetchNFTs(endpoint, owner, setAllNFTs, retryAttempt + 1)
    }

    console.log('Fetched NFTs', data)
    if(data) {
    setAllNFTs(data?.ownedNfts)
    }
    return data
  }
}
