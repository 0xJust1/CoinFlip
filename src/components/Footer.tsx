import { FaTwitter, FaGithub } from 'react-icons/fa'

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-400 mb-4 md:mb-0">
          © {currentYear} MonadCoinFlip. All rights reserved.
        </div>
        <div className="flex justify-center items-center gap-6">
          <a
            href="https://x.com/0xJust1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://github.com/0xJust1/coinflip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400 transition-colors"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
} 