// src/lib/apollo.js

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://wordpress-74434-5742908.cloudwaysapps.com/graphql',
    fetch
  }),
  cache: new InMemoryCache()
})

export default client
