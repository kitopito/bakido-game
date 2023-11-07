import React from 'react'
import ReactDOM from 'react-dom/client'
import GameComponent from './App.tsx'
import './index.css'
import { Center, ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
//  <React.StrictMode>
    <ChakraProvider>
    <GameComponent />
    </ChakraProvider>
//  </React.StrictMode>,
)
