// pages/locations/index.js

import Head from 'next/head'
import PropTypes from 'prop-types'
import Breadcrumb from '@/components/breadcrumb'
import HeaderTwo from '@/components/header/header-2'
import { gql } from '@apollo/client'
import client from '@/lib/apollo'
import Link from 'next/link'

export async function getStaticProps() {
  const { data } = await client.query({
    query: gql`
      query {
        locations(first: 100) {
          nodes {
            title
            slug
            featuredImage {
              node {
                sourceUrl
              }
            }
            locationFields {
              fullAddress
              city
              state
              locationMap {
                latitude
                longitude
              }
            }
          }
        }
      }
    `
  })

  return {
    props: {
      locations: data.locations.nodes
    },
    
  }
}

function LocationsPage({ locations }) {
  return (
    <>
      <Head>
        <title>Our Locations</title>
        <meta
          name="description"
          content="Find a RELUXE location near you"
        />
      </Head>
      <HeaderTwo />
      <Breadcrumb activePage="Locations" pageTitle="Our Locations" />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="block border rounded-xl overflow-hidden hover:shadow-lg transition bg-white">

              {/* Image only in square container */}
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={loc.featuredImage?.node?.sourceUrl}
                  alt={loc.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Everything else outside the image container */}
              <div className="p-4">
                <h2 className="text-2xl font-semibold">{loc.title}</h2>
                <p className="text-gray-600 text-sm">
                  {loc.locationFields?.fullAddress}
                </p>
                <p className="text-sm text-gray-500">
                  {loc.locationFields?.city}, {loc.locationFields?.state}
                </p>
              </div>

            </Link>

          ))}
        </div>
      </div>
    </>
  );
}

LocationsPage.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default LocationsPage
