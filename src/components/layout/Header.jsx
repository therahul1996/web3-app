import React from 'react'
import { useAppKit, useAppKitState } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import logo from '../../assets/apple-touch-icon.png'
function Header() {
    const { open } = useAppKit()

    const { selectedNetworkId } = useAppKitState()
    const { address } = useAccount()
    console.log(selectedNetworkId, 'selectedNetworkId')
    return (
        <nav className='navbar'>
            <img src={logo} alt='logo' />
            <button type='button' className='wallet-btn' onClick={() => open()}>{address !== undefined ? 'Disconnect' : 'Connect'} Wallet</button>
        </nav>
    )
}

export default Header