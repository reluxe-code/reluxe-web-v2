// test-gql.js
const {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql
} = require('@apollo/client/core');
const fetch = require('cross-fetch');

const GRAPHQL_URL = 'https://wordpress-74434-5742908.cloudwaysapps.com/graphql';

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL, fetch }),
  cache: new InMemoryCache(),
});

const GET_TESTIMONIALS = gql`
  query GetTestimonials {
    testimonials(where: { status: PUBLISH }) {
      nodes {
        testimonialFields {
          authorName
          quote
          rating
          staff {
            ... on NodeWithTitle {
              title
            }
          }
        }
      }
    }
  }
`;

client
  .query({ query: GET_TESTIMONIALS })
  .then(res => {
    console.log('✅ Success:\n', JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.error('❌ GraphQL Error:\n', err);
  });
