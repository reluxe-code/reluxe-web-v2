// src/lib/fontawesome.js
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInstagram, faFacebookF, faTiktok } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Avoid automatic CSS injection

config.autoAddCss = false // Tell FA not to inject CSS automatically

library.add(
  faInstagram,
  faFacebookF,
  faTiktok,
  faArrowRight,
  faChevronDown
)
