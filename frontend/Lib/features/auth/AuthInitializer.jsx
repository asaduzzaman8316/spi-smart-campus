'use client'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { hydrateAuth } from './authReducer'

export default function AuthInitializer() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(hydrateAuth())
    }, [dispatch])

    return null
}
