import React from 'react'
import { useAppKit, useAppKitState } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import logo from '../../assets/apple-touch-icon.png'
import { WalletOutlined } from '@ant-design/icons'
function Header() {
    const { open } = useAppKit()

    const { selectedNetworkId } = useAppKitState()
    const { address } = useAccount()
    console.log(selectedNetworkId, 'selectedNetworkId')
    return (
        <nav className='navbar'>
            <img src={logo} alt='logo' />
            <div className='right-sec'>
                <w3m-network-button />
                <button type='button' className='wallet-btn' onClick={() => open()}><WalletOutlined />{address !== undefined ? address.slice(0, 6) + '...' + address.slice(40, 42) : 'Connect Wallet'}</button>
            </div>
        </nav>
    )
}

export default Header