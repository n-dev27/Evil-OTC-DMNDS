const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API
const endpoint = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`

export const fetchNFTCollections = async (contract, retryAttempt) => {
  if (retryAttempt === 5) {
    return
  }
  if (contract) {
    let data
    try {
      data = await fetch(`${endpoint}/getContractMetadata?contractAddress=${contract}`).then(data => data.json())
    } catch (e) {
      fetchNFTCollections(endpoint, contract, retryAttempt + 1)
    }

    console.log('Fetched NFTs', data)

    return (
      // eslint-disable-next-line react/react-in-jsx-scope
      <div>Collection: {}</div>
    )
  }
}
