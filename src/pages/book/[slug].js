// pages/book/[[...slug]].js
export async function getServerSideProps({ params }) {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug || '');
  const destination = slug ? `/services/${slug}?book=1` : `/services?book=1`;
  return {
    redirect: { destination, permanent: false },
  };
}
export default function BookRedirect() { return null; }
