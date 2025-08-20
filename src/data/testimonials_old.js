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
