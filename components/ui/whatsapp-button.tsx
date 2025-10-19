'use client'

import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
  className?: string
}

export function WhatsAppButton({ 
  phoneNumber = '+351912193785', 
  message = 'Hi! I\'m interested in booking at Heiwa House. Can you help me?',
  className = ''
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 min-h-[56px] min-w-[56px] flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={24} />
    </motion.button>
  )
}
