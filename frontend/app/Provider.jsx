'use client'
import { store } from '@/Lib/store'
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import AOS from 'aos';
import 'aos/dist/aos.css';

import AuthInitializer from '@/Lib/features/auth/AuthInitializer'

function StoreProvider({ children }) {
  useEffect(() => {
    const initAOS = async () => {
      await import('aos');
      AOS.init({
        duration: 1000,
        easing: 'ease',
        once: false,
        anchorPlacement: 'bottom-top'
      })
    }
    initAOS()
  }, [])
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  )
}

export default StoreProvider
