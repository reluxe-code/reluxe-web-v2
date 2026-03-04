import PropTypes from 'prop-types';
import { getPostCategories } from '../../lib/getPostCategories';
import { getPostTags } from '../../lib/getPostTags';
import { getAllItems } from '../../lib/items-util';
import BetaLayout from '@/components/beta/BetaLayout';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import AllItems from '../../components/posts/all-items';
import Breadcrumb from '../../components/breadcrumb';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function CategoryPostPage({ posts, categories, tags }) {
    return (
        <BetaLayout
            title="Posts Category"
            description="Browse RELUXE Med Spa posts by category."
            canonical="https://reluxemedspa.com/category"
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
            uniqueCategory: post.category.find((cate) => cate === slug),
        }))
        .filter((post) => post.uniqueCategory === slug);
    const categories = getPostCategories();
    const tags = getPostTags();

    return {
        props: {
            posts: filteredPosts,
            categories,
            tags,
        },
    };
};

export const getStaticPaths = () => {
    const categories = getPostCategories();

    return {
        paths: categories.map((category) => ({
            params: { slug: category },
        })),
        fallback: false,
    };
};

CategoryPostPage.propTypes = {
    posts: PropTypes.instanceOf(Object).isRequired,
    categories: PropTypes.instanceOf(Object).isRequired,
    tags: PropTypes.instanceOf(Object).isRequired,
};

CategoryPostPage.getLayout = (page) => page;

export default CategoryPostPage;
