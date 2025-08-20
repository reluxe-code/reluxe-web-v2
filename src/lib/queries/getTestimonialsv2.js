// lib/queries/getTestimonials.js
import { gql } from '@apollo/client';

export const GET_TESTIMONIALS = gql`
  query GetTestimonials {
    testimonials(where: { status: PUBLISH }) {
      nodes {
        testimonialFields {
          authorName
          quote
          rating
          # Uncomment once these ACF fields are exposed in your schema:
          # month
          # service
          # location
          staff {
            ... on Staff {
              title
            }
          }
        }
      }
    }
  }
`;