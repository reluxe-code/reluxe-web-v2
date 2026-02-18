// src/lib/apollo.js

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const WP_BASE = (process.env.WP_API_ENDPOINT || 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-json/wp/v2')
  .replace(/\/wp-json\/wp\/v2\/?$/, '')

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${WP_BASE}/graphql`,
    fetch
  }),
  cache: new InMemoryCache()
})

export default client
