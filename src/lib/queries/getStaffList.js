// src/lib/queries/getStaffList.js
import { gql } from '@apollo/client'

export const GET_STAFF_LIST = gql`
  query GetStaffList {
  staffs (first: 30, where: { orderby: { field: TITLE, order: ASC } }) {
    nodes {
      id
      slug
      title
      featuredImage {
        node {
          sourceUrl
        }
      }
      staffFields {
        stafftitle
        staffbookingurl
        stafffunfact
        videoIntro         # ✅ was: video_intro
        staffBio           # ✅ was: staff_bio
        role
        location {
          ... on Location {
            title
            slug
          }
        }
        availability {
          day
          hours
        }
        credentials {
          credentialItem   # ✅ was: credential_item
        }
        specialties {
          specialty
        }
        socialProfiles {   # ✅ was: social_profiles
          label
          url
        }
        # relatedtestimonials {
        #   ... on Testimonial {
        #     title
        #     content
        #   }
        # }
      }
    }
  }
}
`
