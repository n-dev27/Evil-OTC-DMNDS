import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { useNetwork, useAccount } from 'wagmi'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { fetchNFTs } from '../../dashboardComponents/utils/fetchNFTs'
import SellNftCard from './sellnftcard'

const NFTModal = props => {
  const { address, isConnected } = useAccount()

  const [connectedError, setConnectedError] = useState()

  const { chain } = useNetwork()

  const [ownedNfts, setOwnedNfts] = useState([])

  useEffect(() => {
    setSelectedNft()
  }, [chain, address])

  useEffect(() => {
    fetchNFTs(address, setOwnedNfts)
    console.log('Prop AllNFTS', ownedNfts)
  }, [isConnected, address])

  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
    setFoundNfts(ownedNfts)
  }

  // the value of the search field
  const [nft, setNft] = useState('')

  // the search result
  const [foundNfts, setFoundNfts] = useState()

  const filter = e => {
    const keyword = e.target.value

    if (keyword !== '') {
      const results = ownedNfts?.filter(nft => {
        return (
          nft?.title.toLowerCase().startsWith(keyword.toLowerCase()) ||
          nft?.id?.tokenId.toLowerCase().includes(keyword.toLowerCase()) ||
          nft?.contract?.address?.toLowerCase().startsWith(keyword.toLowerCase())
        )
        // Use the toLowerCase() method to make it case-insensitive
      })
      setFoundNfts(results)
    } else {
      setFoundNfts(ownedNfts)
      // If the text field is empty, show all tokens
    }

    setNft(keyword)
  }

  const [selectedNft, setSelectedNft] = useState()

  return (
    <>
      <div onClick={isConnected ? () => openModal() : () => setConnectedError('Please connect your wallet')}>
        <div className="text-xs text-red-500">{!isConnected && connectedError}</div>
        <div className="flex text-xs text-[#566C90] md:text-lg">
          {selectedNft ? (
            <div className="flex items-center rounded-md bg-[#E6ECF2] hover:bg-[#C6CCD6] dark:bg-gray-600 dark:text-white dark:hover:bg-gray-400 md:rounded-xl">
              <div className="flex justify-center rounded-md bg-transparent px-1">
                <img
                  className="flex h-12 w-12 items-center justify-center rounded-xl p-1 md:h-28 md:w-28"
                  src={selectedNft.media[0].gateway}
                />
              </div>
              <div className="items-center p-1 text-center">
                <div className="xs:text-xs md:text-base md:font-semibold">{selectedNft?.title}</div>
                <div className="text-xs md:font-semibold">Collection: {selectedNft?.contractMetadata.name}</div>
                <div className="flex text-xs">
                  Collection Contract:{' '}
                  {`${selectedNft?.contract.address.slice(0, 4)}...${selectedNft?.contract.address.slice(
                    selectedNft?.contract.address.length - 4
                  )}`}
                </div>
              </div>
              <div></div>
              <div className="flex justify-center">
                <ChevronDownIcon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
          ) : (
            <div className="flex w-full rounded-md bg-[#1C76FF] py-1 px-1 text-white hover:bg-[#115DD2] dark:bg-gray-700 dark:hover:bg-gray-400 md:rounded-xl">
              Select an NFT
              <ChevronDownIcon className="mt-0.5 h-4 w-4 md:mt-1.5 md:h-5 md:w-5" />
            </div>
          )}
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="overflow max-h-[38rem] w-full max-w-md transform rounded-2xl bg-[#EFF2F5] p-3 text-left align-middle shadow-xl transition-all dark:bg-slate-800 md:p-6">
                  <Dialog.Title
                    as="h3"
                    className="flex justify-between py-1 text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Select an NFT
                    <button
                      type="button"
                      className="-mt-1 flex h-5 w-6 items-center justify-center rounded-md border border-transparent bg-transparent text-center text-sm font-medium text-black hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      X
                    </button>
                  </Dialog.Title>
                  {!props.outputRestricted && (
                    <form className="flex items-center">
                      <label htmlFor="token-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-screen">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"></div>
                        <input
                          type="search"
                          id="token-search"
                          onChange={filter}
                          value={nft}
                          className="block w-full rounded-lg bg-gray-50 p-2.5 pl-5 text-sm text-gray-900 focus:border-gray-500 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-500 dark:focus:ring-gray-500"
                          placeholder="Search name or paste collection contract address"
                        />
                      </div>
                    </form>
                  )}

                  <div className="flex">
                    <div className="mt-1 flex max-h-[22rem] w-screen justify-center overflow-y-scroll">
                      <div className="grid-cols-3 text-center">
                        {foundNfts && foundNfts?.length > 0 ? (
                          foundNfts?.map(nft => (
                            <button
                              disabled={selectedNft?.id?.tokenId === nft?.id?.tokenId}
                              key={nft.id?.tokenId}
                              onClick={() => {
                                setSelectedNft(nft)
                                props.SetNftData(nft)
                                closeModal()
                              }}
                              className="enabled:hover:rounded-xl enabled:hover:bg-[#dbd7d7] disabled:opacity-60"
                            >
                              <div className="py-4">
                                <SellNftCard
                                  image={nft.media[0].gateway}
                                  id={nft.id.tokenId}
                                  title={nft.title}
                                  address={nft.contract.address}
                                />
                              </div>
                            </button>
                          ))
                        ) : (
                          <h1>No NFT found!</h1>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default NFTModal
