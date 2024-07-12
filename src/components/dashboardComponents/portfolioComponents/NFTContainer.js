import React from 'react'
import { useState, useEffect } from 'react'
import { useNetwork, useAccount } from 'wagmi'
import { fetchNFTs } from '../utils/fetchNFTs'
import NftCard from './nftcard'

const style = {
  content:
    'bg-gradient-to-b from-slate-600/60 to-slate-600/40 border border-[#dbc1c1] rounded-3xl p-2 md:p-4 text-center',
}

const NFTContainer = () => {
  const { address, isConnected } = useAccount()

  const { chain } = useNetwork()

  const [allNFTs, setAllNFTs] = useState()

  const [nftCollections, setNftCollections] = useState()

  useEffect(() => {
    {
      fetchNFTs(address, setAllNFTs)
    }
    console.log('Prop AllNFTS', allNFTs)
  }, [isConnected, address, chain])

  useEffect(() => {
    if (allNFTs?.length > 0) {
      const groupBy = (array, key) => {
        return Array.isArray(array)
          ? array.reduce((result, currentValue) => {
              // If an array already present for key, push it to the array. Else create an array and push the object
              ;(result[currentValue.contractMetadata[key]] = result[currentValue.contractMetadata[key]] || []).push(
                currentValue
              )
              // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
              return result
            }, {})
          : '' // empty object is the initial value for result object
      }

      const groupByNFTCollection = groupBy(allNFTs, 'name')
      console.log('Grouped', groupByNFTCollection)
      setNftCollections(groupByNFTCollection)
    }
  }, [allNFTs, address, chain])

  return (
    <div className={style.content}>
      <div className="flex justify-center">
        <div className="w-80 text-sm md:w-auto md:text-lg ">
          <dl>
            <div>
              <h1 className="text-large font-bold text-white">Owned NFT&apos;s</h1>
              <dd>
                {allNFTs?.length > 0 && nftCollections ? (
                  <div className="h-auto w-auto overflow-auto">
                    {Object.keys(nftCollections).map(key => {
                      return (
                        <div key={key} className="flex-col">
                          <div className="flex-col px-2">
                            <h1 className="flex">Collection: {key}</h1>
                            <div className="flex text-sm">
                              Contract:
                              <a
                                target="_blank"
                                className="text- flex items-center px-2 text-blue-700"
                                href={`https://etherscan.io/token/${nftCollections[key]?.[0].contract?.address}`}
                                rel="noreferrer"
                              >{`${nftCollections[key]?.[0].contract?.address.slice(0, 4)}...${nftCollections[
                                key
                              ]?.[0].contract?.address.slice(
                                nftCollections[key]?.[0].contract?.address.length - 4
                              )}`}</a>
                            </div>
                            <a className="flex text-sm">Total Owned: {nftCollections[key].length} </a>
                          </div>
                          <div className="overflow-x-auto md:max-w-5xl">
                            <div className="flex justify-start">
                              {nftCollections[key].map(collectionItem => {
                                return (
                                  <div key={collectionItem.token_id}>
                                    <div className="p-2">
                                      <NftCard
                                        image={collectionItem.media[0].gateway}
                                        id={collectionItem.id.tokenId}
                                        title={collectionItem.title}
                                        description={collectionItem.description}
                                        attributes={collectionItem.metadata.attributes}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="px-4">No NFTs held in this wallet.</div>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default NFTContainer
