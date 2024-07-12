import React from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const NftCard = ({ image, id, title, description, attributes }) => {
  return (
    <div className="mr-2 mb-6 h-48 w-36">
      <div>
        <img className="w-full rounded-t-md" key={id} src={image}></img>
        <div className="bg-[#619FFF]/20 p-1 dark:bg-gray-400">
          <div className="flex ">
            <div className="flex-grow">
              <h3 className="text-xs">{title}</h3>
            </div>
          </div>
        </div>
      </div>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="-mt-1 flex w-full items-center justify-between rounded-lg bg-[#619FFF] px-2 text-sm font-medium text-white hover:bg-[#1C76FF] focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 dark:bg-gray-400 hover:dark:bg-gray-500">
              <span className="text-xs">NFT details.</span>
              <ChevronDownIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`} />
            </Disclosure.Button>

            <Disclosure.Panel>
              <p className="text-xs">{description ? description.slice(0, 200) : 'No Description'}</p>
              <div className="flex flex-wrap items-center justify-center p-2 ">
                {attributes?.length > 0 &&
                  attributes.map(attribute => {
                    return (
                      <div key={attribute} className="mb-2 flex w-1/2 flex-col justify-start text-start">
                        <p className="mr-2 text-xs font-bold">{attribute.trait_type}:</p>
                        <p className="overflow-clip text-xs">{attribute.value}</p>
                      </div>
                    )
                  })}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}

export default NftCard
