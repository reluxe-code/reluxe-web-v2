import PropTypes from 'prop-types';
import { getAllItems } from '../../lib/items-util';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import Breadcrumb from '../../components/breadcrumb';
import AllItems from '../../components/posts/all-items';
import { getPostTags } from '../../lib/getPostTags';
import { getPostCategories } from '../../lib/getPostCategories';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function popularTagPage({ posts, tags, categories }) {
    return (
        <BetaLayout
            title="Popular Tags"
            description="Browse RELUXE Med Spa posts by tag."
            canonical="https://reluxemedspa.com/tag"
        >
            <Breadcrumb activePage="Posts" pageTitle="Our Posts" />
            <AllItems posts={posts} categories={categories} tags={tags} />
        </BetaLayout>
    );
}

export const getStaticProps = ({ params }) => {
    const { slug } = params;
    const posts = getAllItems('posts');
    const filteredPosts = posts
        .map((post) => ({
            ...post,
            uniqueTag: post.postTags.find((tag) => tag === slug),
        }))
        .filter((post) => post.uniqueTag === slug);
    const tags = getPostTags();
    const categories = getPostCategories();

    return {
        props: {
            posts: filteredPosts,
            tags,
            categories,
        },
    };
};

export const getStaticPaths = () => {
    const tags = getPostTags();

    return {
        paths: tags.map((tag) => ({
            params: { slug: tag },
        })),
        fallback: false,
    };
};

popularTagPage.propTypes = {
    posts: PropTypes.instanceOf(Object).isRequired,
    tags: PropTypes.instanceOf(Object).isRequired,
    categories: PropTypes.instanceOf(Object).isRequired,
};

popularTagPage.getLayout = (page) => page;

export default popularTagPage;
