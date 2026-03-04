// src/context/SearchContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SearchContext = createContext({
  isSearchOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
})

export function SearchProvider({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = useCallback((source) => {
    setIsSearchOpen(true)
    // Store source for analytics
    if (typeof window !== 'undefined') {
      window.__searchSource = source || 'nav_icon'
    }
  }, [])

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
  }, [])

  // Cmd/Ctrl+K global shortcut
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => {
          if (!prev && typeof window !== 'undefined') {
            window.__searchSource = 'keyboard_shortcut'
          }
          return !prev
        })
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isSearchOpen])

  // Body scroll lock
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isSearchOpen])

  return (
    <SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  return useContext(SearchContext)
}
